import React, { useEffect, useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Check, Clock, CheckCircle, Search } from 'lucide-react';
import { format } from 'date-fns';

const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filtered = notifications.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase()) ||
    n.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header page-header-row">
        <div>
          <h1>Notifications <span>History</span></h1>
          <p>Stay updated with your latest booking and ticket alerts</p>
        </div>
        {notifications.length > 0 && (
          <button className="btn btn-secondary" onClick={markAllAsRead}>
            <CheckCircle size={15} /> Mark all as read
          </button>
        )}
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-icon blue"><Bell size={20} /></div>
          <div className="stat-info">
            <div className="stat-value">{notifications.length}</div>
            <div className="stat-label">Total Notifications</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow"><Clock size={20} /></div>
          <div className="stat-info">
            <div className="stat-value">{unreadCount}</div>
            <div className="stat-label">Unread Messages</div>
          </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={14} />
          <input 
            placeholder="Search notifications..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-3)' }}>
          Showing {filtered.length} notifications
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <Bell size={48} />
          <h3>No notifications found</h3>
          <p>{search ? 'Try a different search term' : "You don't have any notifications yet."}</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 40 }}></th>
                  <th>Message</th>
                  <th>Type</th>
                  <th>Date & Time</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((n) => (
                  <tr 
                    key={n.id} 
                    style={{ 
                      background: !n.read ? '#f0f4ff' : 'transparent',
                      cursor: 'pointer' 
                    }}
                    onClick={() => !n.read && markAsRead(n.id)}
                  >
                    <td>
                      {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue)', margin: '0 auto' }} />}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{n.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{n.content}</div>
                    </td>
                    <td>
                      <span className={`badge ${n.type === 'BOOKING_STATUS' ? 'badge-blue' : n.type === 'TICKET_UPDATE' ? 'badge-green' : 'badge-yellow'}`}>
                        {n.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-3)', fontSize: 12 }}>
                      {format(new Date(n.createdAt), 'MMM dd, yyyy · HH:mm')}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {!n.read && (
                        <button 
                          className="btn btn-secondary btn-sm btn-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(n.id);
                          }}
                          title="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
