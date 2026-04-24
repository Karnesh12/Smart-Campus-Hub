import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { getAllTickets, getMyTickets } from '../services/ticketService';
import bookingService from '../services/bookingService';
import resourceService from '../services/resourceService';
import { 
  LayoutDashboard, 
  Ticket, 
  CalendarCheck, 
  Monitor, 
  Bell, 
  PlusCircle, 
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';

const DashboardPage = () => {
  const { user } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    tickets: 0,
    bookings: 0,
    resources: 0
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdminOrStaff = user?.role === 'ADMIN' || user?.role === 'STAFF';

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch Tickets
        const ticketData = isAdminOrStaff ? await getAllTickets() : await getMyTickets();
        const activeTickets = ticketData.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED');
        
        // Fetch Bookings
        const bookingRes = isAdminOrStaff ? await bookingService.getAll() : await bookingService.getMy();
        const bookingData = bookingRes.data || [];
        const upcoming = bookingData
          .filter(b => b.status === 'APPROVED' && new Date(b.bookingDate) >= new Date())
          .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate));

        // Fetch Resources
        const resourceRes = await resourceService.getAll();
        const resourceData = resourceRes.data || [];

        setStats({
          tickets: activeTickets.length,
          bookings: upcoming.length,
          resources: resourceData.filter(r => r.status === 'AVAILABLE').length
        });

        setRecentTickets(activeTickets.slice(0, 5));
        setUpcomingBookings(upcoming.slice(0, 3));

      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [isAdminOrStaff]);

  return (
    <div className="dashboard-container">
      <div className="page-header page-header-row">
        <div>
          <h1>Welcome back, <span>{user?.name?.split(' ')[0]}!</span></h1>
          <p>Here's what's happening on campus today.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/notifications')}>
            <Bell size={16} />
            {unreadCount > 0 && <span className="sidebar-badge" style={{ position: 'static', marginLeft: 5 }}>{unreadCount}</span>}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/tickets')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon blue"><Ticket size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{stats.tickets}</div>
            <div className="stat-label">Active Tickets</div>
          </div>
          <ArrowRight size={16} className="stat-arrow" style={{ color: 'var(--text-3)' }} />
        </div>

        <div className="stat-card" onClick={() => navigate('/bookings')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon purple"><CalendarCheck size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{stats.bookings}</div>
            <div className="stat-label">Upcoming Bookings</div>
          </div>
          <ArrowRight size={16} className="stat-arrow" style={{ color: 'var(--text-3)' }} />
        </div>

        <div className="stat-card" onClick={() => navigate('/resources')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon green"><Monitor size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{stats.resources}</div>
            <div className="stat-label">Available Resources</div>
          </div>
          <ArrowRight size={16} className="stat-arrow" style={{ color: 'var(--text-3)' }} />
        </div>

        <div className="stat-card" onClick={() => navigate('/notifications')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon yellow"><Bell size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{unreadCount}</div>
            <div className="stat-label">New Alerts</div>
          </div>
          <ArrowRight size={16} className="stat-arrow" style={{ color: 'var(--text-3)' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginTop: 24 }}>
        {/* Main Section: Recent Activity */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Recent Activity</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/notifications')}>View All</button>
          </div>

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <Clock size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                <p>No recent activity found.</p>
              </div>
            ) : (
              notifications.slice(0, 5).map(n => (
                <div key={n.id} className="notification-item" style={{ 
                  display: 'flex', 
                  gap: 15, 
                  padding: '15px 0', 
                  borderBottom: '1px solid var(--border)',
                  alignItems: 'flex-start'
                }}>
                  <div className={`stat-icon ${n.read ? 'gray' : 'blue'}`} style={{ width: 36, height: 36, borderRadius: 8 }}>
                    {n.type === 'TICKET_UPDATE' ? <Ticket size={18} /> : <CalendarCheck size={18} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{n.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{format(new Date(n.createdAt), 'MMM dd, HH:mm')}</div>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>{n.content}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Section: Quick Actions & Bookings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card">
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={() => navigate('/bookings')}>
                <PlusCircle size={16} /> Book a Resource
              </button>
              <button className="btn btn-secondary" style={{ justifyContent: 'center' }} onClick={() => navigate('/tickets/create')}>
                <AlertTriangle size={16} /> Report Incident
              </button>
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Upcoming Bookings</h2>
            {upcomingBookings.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', padding: '20px 0' }}>No upcoming bookings.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {upcomingBookings.map(b => (
                  <div key={b.id} style={{ 
                    padding: 12, 
                    background: 'var(--bg)', 
                    borderRadius: 10,
                    border: '1px solid var(--border)'
                  }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{b.resource?.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
                      <Clock size={10} style={{ marginRight: 4 }} /> 
                      {format(new Date(b.bookingDate), 'MMM dd')} · {b.startTime}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
