import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getTicketById, updateTicketStatus, deleteTicket, uploadAttachments,
  getComments, addComment, updateComment, deleteComment,
} from '../../services/ticketService';
import { useAuth } from '../../context/AuthContext';

const API_BASE = 'http://localhost:8082/api';

const statusBadge = (s) => {
  const map = { OPEN:'badge-blue', IN_PROGRESS:'badge-yellow', RESOLVED:'badge-green', CLOSED:'badge-gray', REJECTED:'badge-red' };
  return map[s] || 'badge-gray';
};
const priorityBadge = (p) => {
  const map = { HIGH:'badge-red', CRITICAL:'badge-orange', MEDIUM:'badge-yellow', LOW:'badge-green' };
  return map[p] || 'badge-gray';
};
const statusLabel = (s) => s?.replace('_', ' ');

const NEXT_STATUS = {
  OPEN: ['IN_PROGRESS', 'REJECTED'],
  IN_PROGRESS: ['RESOLVED', 'REJECTED'],
  RESOLVED: ['CLOSED'],
};

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket]       = useState(null);
  const [comments, setComments]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  // Status update modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: '', resolutionNotes: '', rejectionReason: '', assignedTechnicianId: '', assignedTechnicianName: '' });
  const [statusLoading, setStatusLoading]     = useState(false);

  // Comment state
  const [newComment, setNewComment]   = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent]       = useState('');

  // Attachment upload
  const [uploadFiles, setUploadFiles]   = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);

  // ── FIXED: use AuthContext instead of wrong localStorage key ──
  const { user } = useAuth();
  const isAdminOrStaff = user?.role === 'ADMIN' || user?.role === 'STAFF';

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [t, c] = await Promise.all([getTicketById(id), getComments(id)]);
      setTicket(t);
      setComments(c);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [id]);

  // Status update
  const openStatusModal = (nextStatus) => {
    setStatusForm({ status: nextStatus, resolutionNotes: '', rejectionReason: '', assignedTechnicianId: '', assignedTechnicianName: '' });
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async () => {
    setStatusLoading(true);
    try {
      const updated = await updateTicketStatus(id, statusForm);
      setTicket(updated);
      setShowStatusModal(false);
    } catch (e) {
      alert(e.message);
    } finally {
      setStatusLoading(false);
    }
  };

  // Delete ticket
  const handleDelete = async () => {
    if (!window.confirm('Permanently delete this ticket?')) return;
    try {
      await deleteTicket(id);
      navigate('/tickets');
    } catch { alert('Failed to delete ticket'); }
  };

  // Comments
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      const c = await addComment(id, newComment.trim());
      setComments((prev) => [...prev, c]);
      setNewComment('');
    } catch (e) { alert(e.message); }
    finally { setCommentLoading(false); }
  };

  const handleEditComment = async (commentId) => {
    try {
      const updated = await updateComment(id, commentId, editContent);
      setComments((prev) => prev.map((c) => c.id === commentId ? updated : c));
      setEditingComment(null);
    } catch (e) { alert(e.message); }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteComment(id, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (e) { alert(e.message); }
  };

  // Attachment upload
  const handleUpload = async () => {
    if (!uploadFiles.length) return;
    setUploadLoading(true);
    try {
      const updated = await uploadAttachments(id, uploadFiles);
      setTicket(updated);
      setUploadFiles([]);
    } catch (e) { alert(e.message); }
    finally { setUploadLoading(false); }
  };

  if (loading) return <div className="loading-container"><div className="spinner"/></div>;
  if (error)   return <div style={{ color: 'var(--red)', padding: 24 }}>{error}</div>;
  if (!ticket) return null;

  const nextStatuses = NEXT_STATUS[ticket.status] || [];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/tickets')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5m7-7-7 7 7 7"/>
            </svg>
            Back
          </button>
          <span style={{ color: 'var(--text-3)', fontSize: 13 }}>Ticket #{ticket.id}</span>
        </div>
        <div className="page-header-row">
          <div>
            <h1 style={{ fontSize: 20 }}>{ticket.title}</h1>
            <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className={`badge ${statusBadge(ticket.status)}`}>{statusLabel(ticket.status)}</span>
              <span className={`badge ${priorityBadge(ticket.priority)}`}>{ticket.priority}</span>
              <span className="type-chip">{ticket.category}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {/* Status action buttons */}
            {isAdminOrStaff && nextStatuses.map((s) => (
              <button
                key={s}
                className={`btn btn-sm ${s === 'REJECTED' ? 'btn-danger' : s === 'RESOLVED' || s === 'CLOSED' ? 'btn-success' : 'btn-primary'}`}
                onClick={() => openStatusModal(s)}
              >
                {s === 'IN_PROGRESS' ? '▶ Start' : s === 'RESOLVED' ? '✓ Resolve' : s === 'CLOSED' ? '🔒 Close' : '✕ Reject'}
              </button>
            ))}
            {isAdminOrStaff && (
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                </svg>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Description */}
          <div className="card">
            <div className="card-heading">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              Description
            </div>
            <p style={{ color: 'var(--text-2)', lineHeight: 1.7, fontSize: 13.5 }}>{ticket.description}</p>
          </div>

          {/* Attachments */}
          <div className="card">
            <div className="card-heading">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
              </svg>
              Attachments
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)', fontWeight: 400 }}>
                {ticket.attachmentUrls?.length || 0}/3
              </span>
            </div>

            {ticket.attachmentUrls?.length > 0 ? (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                {ticket.attachmentUrls.map((url, i) => (
                  <a
                    key={i}
                    href={`${API_BASE}${url}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'block' }}
                  >
                    <img
                      src={`${API_BASE}${url}`}
                      alt={`Attachment ${i + 1}`}
                      style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </a>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-3)', fontSize: 13, marginBottom: 12 }}>No attachments yet</p>
            )}

            {/* Upload more */}
            {(ticket.attachmentUrls?.length || 0) < 3 && (
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <label
                    htmlFor="upload-more"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '6px 12px', borderRadius: 7, fontSize: 12,
                      background: 'var(--bg)', border: '1px solid var(--border)',
                      cursor: 'pointer', fontWeight: 600, color: 'var(--text-2)',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Add Image
                  </label>
                  <input
                    id="upload-more"
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => setUploadFiles(Array.from(e.target.files))}
                  />
                  {uploadFiles.length > 0 && (
                    <button className="btn btn-primary btn-sm" onClick={handleUpload} disabled={uploadLoading}>
                      {uploadLoading ? 'Uploading...' : `Upload ${uploadFiles.length} file(s)`}
                    </button>
                  )}
                </div>
                {uploadFiles.length > 0 && (
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>
                    {uploadFiles.map(f => f.name).join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="card">
            <div className="card-heading">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
              Comments
              <span style={{ marginLeft: 6, background: 'var(--bg-2)', color: 'var(--text-3)', padding: '1px 7px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
                {comments.length}
              </span>
            </div>

            {/* Comment list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {comments.length === 0 ? (
                <p style={{ color: 'var(--text-3)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
                  No comments yet. Be the first to comment.
                </p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} style={{
                    background: 'var(--surface-2)', borderRadius: 10,
                    padding: '12px 14px', border: '1px solid var(--border)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                          {c.authorName?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{c.authorName}</span>
                          <span className={`badge badge-${c.authorRole === 'ADMIN' ? 'red' : c.authorRole === 'STAFF' ? 'blue' : 'gray'}`}
                            style={{ marginLeft: 6, fontSize: 10 }}>{c.authorRole}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                          {new Date(c.createdAt).toLocaleString()}
                        </span>
                        {(String(c.authorId) === String(user?.id) || isAdminOrStaff) && (
                          <>
                            {String(c.authorId) === String(user?.id) && (
                              <button className="btn btn-secondary btn-sm btn-icon"
                                onClick={() => { setEditingComment(c.id); setEditContent(c.content); }}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                              </button>
                            )}
                            <button className="btn btn-danger btn-sm btn-icon"
                              onClick={() => handleDeleteComment(c.id)}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {editingComment === c.id ? (
                      <div style={{ marginTop: 10 }}>
                        <textarea
                          className="form-control"
                          rows={2}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          style={{ marginBottom: 8 }}
                        />
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-primary btn-sm" onClick={() => handleEditComment(c.id)}>Save</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => setEditingComment(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <p style={{ marginTop: 8, color: 'var(--text-2)', fontSize: 13.5, lineHeight: 1.6 }}>{c.content}</p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Add comment */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={{ marginBottom: 8, resize: 'vertical' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleAddComment}
                  disabled={commentLoading || !newComment.trim()}
                >
                  {commentLoading ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column — Ticket Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Ticket Info */}
          <div className="card">
            <div className="card-heading">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Ticket Info
            </div>
            {[
              { label: 'Status', value: <span className={`badge ${statusBadge(ticket.status)}`}>{statusLabel(ticket.status)}</span> },
              { label: 'Priority', value: <span className={`badge ${priorityBadge(ticket.priority)}`}>{ticket.priority}</span> },
              { label: 'Category', value: <span className="type-chip">{ticket.category}</span> },
              { label: 'Location', value: ticket.resourceLocation },
              { label: 'Resource ID', value: ticket.resourceId || '—' },
              { label: 'Reported By', value: ticket.reportedByName || ticket.reportedByEmail },
              { label: 'Contact', value: ticket.preferredContact || '—' },
              { label: 'Created', value: new Date(ticket.createdAt).toLocaleString() },
              { label: 'Updated', value: new Date(ticket.updatedAt).toLocaleString() },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>{label}</span>
                <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500, textAlign: 'right', maxWidth: 160 }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Technician */}
          <div className="card">
            <div className="card-heading">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              Technician
            </div>
            {ticket.assignedTechnicianName ? (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div className="avatar">{ticket.assignedTechnicianName[0]}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{ticket.assignedTechnicianName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>ID: {ticket.assignedTechnicianId}</div>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-3)', fontSize: 13 }}>Not assigned yet</p>
            )}
          </div>

          {/* Resolution / Rejection */}
          {ticket.resolutionNotes && (
            <div className="card" style={{ borderColor: 'var(--green)', background: 'var(--green-l)' }}>
              <div className="card-heading" style={{ color: 'var(--green)' }}>✓ Resolution Notes</div>
              <p style={{ color: 'var(--green)', fontSize: 13, lineHeight: 1.6 }}>{ticket.resolutionNotes}</p>
              {ticket.resolvedAt && (
                <p style={{ fontSize: 11, color: 'var(--green)', marginTop: 6, opacity: 0.8 }}>
                  Resolved: {new Date(ticket.resolvedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}
          {ticket.rejectionReason && (
            <div className="card" style={{ borderColor: 'var(--red)', background: 'var(--red-l)' }}>
              <div className="card-heading" style={{ color: 'var(--red)' }}>✕ Rejection Reason</div>
              <p style={{ color: 'var(--red)', fontSize: 13, lineHeight: 1.6 }}>{ticket.rejectionReason}</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="modal-backdrop" onClick={() => setShowStatusModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Update Status → {statusLabel(statusForm.status)}</h2>

            {statusForm.status === 'IN_PROGRESS' && (
              <>
                <div className="form-group">
                  <label>Technician ID</label>
                  <input className="form-control" placeholder="e.g. TECH-001"
                    value={statusForm.assignedTechnicianId}
                    onChange={(e) => setStatusForm({ ...statusForm, assignedTechnicianId: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Technician Name</label>
                  <input className="form-control" placeholder="e.g. John Silva"
                    value={statusForm.assignedTechnicianName}
                    onChange={(e) => setStatusForm({ ...statusForm, assignedTechnicianName: e.target.value })} />
                </div>
              </>
            )}

            {(statusForm.status === 'RESOLVED' || statusForm.status === 'CLOSED') && (
              <div className="form-group">
                <label>Resolution Notes</label>
                <textarea className="form-control" rows={4} placeholder="Describe how the issue was resolved..."
                  value={statusForm.resolutionNotes}
                  onChange={(e) => setStatusForm({ ...statusForm, resolutionNotes: e.target.value })} />
              </div>
            )}

            {statusForm.status === 'REJECTED' && (
              <div className="form-group">
                <label>Rejection Reason <span style={{ color: 'var(--red)' }}>*</span></label>
                <textarea className="form-control" rows={3} placeholder="Explain why this ticket is rejected..."
                  value={statusForm.rejectionReason}
                  onChange={(e) => setStatusForm({ ...statusForm, rejectionReason: e.target.value })} />
              </div>
            )}

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowStatusModal(false)}>Cancel</button>
              <button
                className={`btn ${statusForm.status === 'REJECTED' ? 'btn-danger' : 'btn-primary'}`}
                onClick={handleStatusUpdate}
                disabled={statusLoading}
              >
                {statusLoading ? 'Updating...' : `Confirm ${statusLabel(statusForm.status)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}