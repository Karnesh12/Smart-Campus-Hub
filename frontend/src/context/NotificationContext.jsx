import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import api from '../services/api';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const stompClient = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
      
      const unreadResponse = await api.get('/notifications/unread-count');
      setUnreadCount(unreadResponse.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      connectWebSocket();
    } else {
      disconnectWebSocket();
      setNotifications([]);
      setUnreadCount(0);
    }
    return () => disconnectWebSocket();
  }, [user, fetchNotifications]);

  const connectWebSocket = () => {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    // Use SockJS for the initial connection to the /ws endpoint
    const socket = new SockJS('http://localhost:8082/ws');
    
    stompClient.current = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      // debug: (str) => console.log(str), // Uncomment for debugging
      onConnect: () => {
        console.log('Connected to WebSocket');
        stompClient.current.subscribe(`/user/${user.email}/topic/notifications`, (message) => {
          const newNotification = JSON.parse(message.body);
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Use string message for react-hot-toast
          toast.success(`${newNotification.title}: ${newNotification.content}`);
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error', frame);
      },
    });

    stompClient.current.activate();
  };

  const disconnectWebSocket = () => {
    if (stompClient.current) {
      stompClient.current.deactivate();
      stompClient.current = null;
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
