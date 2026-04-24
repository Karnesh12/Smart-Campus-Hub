import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Mail, Settings, CheckCircle, AlertCircle, MessageSquare, Search, RefreshCw, Eye, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAllTickets, getMyTickets, deleteTicket } from '../../services/ticketService';

const priorityBadge = (p) => {
  const map = { HIGH: 'badge-red', CRITICAL: 'badge-orange', MEDIUM: 'badge-yellow', LOW: 'badge-green' };
  return map[p] || 'badge-gray';
};

const statusBadge = (s) => {
  const map = {
    OPEN: 'badge-blue', IN_PROGRESS: 'badge-yellow',
    RESOLVED: 'badge-green', CLOSED: 'badge-gray', REJECTED: 'badge-red',
  };
  return map[s] || 'badge-gray';
};

const statusLabel = (s) => s?.replace('_', ' ');

export default function TicketListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();  // ← MUST be inside component
  const [tickets, setTickets]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [viewMode, setViewMode]   = useState('all');
  const [search, setSearch]       = useState('');
  const [filterStatus, setFilterStatus]     = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const isAdminOrStaff = user?.role === 'ADMIN' || user?.role === 'STAFF';

  const fetchTickets = async () => {
    setLoading(true);
    setError('');
    try {
      let data;
      if (viewMode === 'my' || !isAdminOrStaff) {
        data = await getMyTickets();
      } else {
        data = await getAllTickets({
          status: filterStatus || undefined,
          priority: filterPriority || undefined,
          category: filterCategory || undefined,
        });
      }
      setTickets(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, [viewMode, filterStatus, filterPriority, filterCategory]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this ticket?')) return;
    try {
      await deleteTicket(id);
      setTickets((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert('Failed to delete ticket');
    }
  };

  const filtered = tickets.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.title?.toLowerCase().includes(q) ||
      t.resourceLocation?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="page-header page-header-row">
        <div>
            <h1>Incident <span>Tickets</span></h1>
            <p>Manage maintenance and incident reports across campus</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/tickets/create')}>
            <Plus size={15} />
            New Ticket
          </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: 20 }}>
        {[
          { label: 'Total',       value: tickets.length,                                        color: 'blue',   icon: <Ticket size={20} /> },
          { label: 'Open',        value: tickets.filter(t => t.status === 'OPEN').length,        color: 'blue',   icon: <Mail size={20} /> },
          { label: 'In Progress', value: tickets.filter(t => t.status === 'IN_PROGRESS').length, color: 'yellow', icon: <Settings size={20} /> },
          { label: 'Resolved',    value: tickets.filter(t => t.status === 'RESOLVED').length,    color: 'green',  icon: <CheckCircle size={20} /> },
          { label: 'Critical',    value: tickets.filter(t => t.priority === 'CRITICAL').length,  color: 'red',    icon: <AlertCircle size={20} /> },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-info">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="toolbar">
          {isAdminOrStaff && (
            <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 8, padding: 3, gap: 2 }}>
              {['all', 'my'].map((m) => (
                <button
                  key={m}
                  className="btn btn-sm"
                  style={{
                    background: viewMode === m ? 'var(--surface)' : 'transparent',
                    color: viewMode === m ? 'var(--blue)' : 'var(--text-3)',
                    border: 'none',
                    boxShadow: viewMode === m ? 'var(--shadow-sm)' : 'none',
                    fontWeight: viewMode === m ? 700 : 500,
                  }}
                  onClick={() => setViewMode(m)}
                >
                  {m === 'all' ? 'All Tickets' : 'My Tickets'}
                </button>
              ))}
            </div>
          )}

          <div className="search-box">
            <Search size={14} />
            <input
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {(viewMode === 'all' && isAdminOrStaff) && (
            <>
              <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">All Status</option>
                {['OPEN','IN_PROGRESS','RESOLVED','CLOSED','REJECTED'].map(s =>
                  <option key={s} value={s}>{statusLabel(s)}</option>
                )}
              </select>
              <select className="filter-select" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                <option value="">All Priority</option>
                {['LOW','MEDIUM','HIGH','CRITICAL'].map(p =>
                  <option key={p} value={p}>{p}</option>
                )}
              </select>
              <select className="filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="">All Category</option>
                {['ELECTRICAL','PLUMBING','EQUIPMENT','NETWORK','HVAC','OTHER'].map(c =>
                  <option key={c} value={c}>{c}</option>
                )}
              </select>
            </>
          )}

          <button className="btn btn-secondary btn-sm" onClick={fetchTickets} style={{ marginLeft: 'auto' }}>
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="loading-container"><div className="spinner"/></div>
        ) : error ? (
          <div style={{ color: 'var(--red)', padding: 24, textAlign: 'center' }}>{error}</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={48} />
            <h3>No tickets found</h3>
            <p>Create a new ticket to get started</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/tickets/${t.id}`)}>
                    <td style={{ color: 'var(--text-3)', fontWeight: 600 }}>#{t.id}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.title}
                      </div>
                      {t.commentCount > 0 && (
                        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MessageSquare size={10} /> {t.commentCount} comment{t.commentCount > 1 ? 's' : ''}
                        </div>
                      )}
                    </td>
                    <td><span className="type-chip">{t.category}</span></td>
                    <td style={{ color: 'var(--text-2)' }}>{t.resourceLocation}</td>
                    <td><span className={`badge ${priorityBadge(t.priority)}`}>{t.priority}</span></td>
                    <td><span className={`badge ${statusBadge(t.status)}`}>{statusLabel(t.status)}</span></td>
                    <td style={{ color: 'var(--text-3)', fontSize: 12 }}>
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
                        <button className="btn btn-secondary btn-sm btn-icon" title="View"
                          onClick={() => navigate(`/tickets/${t.id}`)}>
                          <Eye size={13} />
                        </button>
                        {isAdminOrStaff && (
                          <button className="btn btn-danger btn-sm btn-icon" title="Delete"
                            onClick={(e) => handleDelete(t.id, e)}>
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}