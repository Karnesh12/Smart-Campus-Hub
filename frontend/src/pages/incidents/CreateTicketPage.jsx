import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket, uploadAttachments } from '../../services/ticketService';

const CATEGORIES = ['ELECTRICAL', 'PLUMBING', 'EQUIPMENT', 'NETWORK', 'HVAC', 'OTHER'];
const PRIORITIES  = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: '', priority: 'MEDIUM',
    resourceLocation: '', resourceId: '', preferredContact: '',
  });
  const [files, setFiles]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFiles = (incoming) => {
    const imageFiles = Array.from(incoming).filter((f) => f.type.startsWith('image/'));
    if (files.length + imageFiles.length > 3) {
      setError('Maximum 3 image attachments allowed');
      return;
    }
    setFiles((prev) => [...prev, ...imageFiles].slice(0, 3));
    setError('');
  };

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category || !form.resourceLocation) {
      setError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const ticket = await createTicket(form);
      if (files.length > 0) {
        await uploadAttachments(ticket.id, files);
      }
      navigate(`/tickets/${ticket.id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const priorityColors = { LOW: 'var(--green)', MEDIUM: 'var(--amber)', HIGH: 'var(--red)', CRITICAL: '#7c3aed' };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/tickets')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5m7-7-7 7 7 7"/>
            </svg>
            Back
          </button>
        </div>
        <h1>Report <span>Incident</span></h1>
        <p>Submit a maintenance or incident ticket for campus facilities</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-heading">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Incident Details
          </div>

          <div className="form-group">
            <label>Title <span style={{ color: 'var(--red)' }}>*</span></label>
            <input
              className="form-control"
              name="title"
              placeholder="e.g. Broken projector in Lab 301"
              value={form.title}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Description <span style={{ color: 'var(--red)' }}>*</span></label>
            <textarea
              className="form-control"
              name="description"
              rows={4}
              placeholder="Describe the issue in detail..."
              value={form.description}
              onChange={handleChange}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Category <span style={{ color: 'var(--red)' }}>*</span></label>
              <select className="form-control" name="category" value={form.category} onChange={handleChange}>
                <option value="">Select category...</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Priority <span style={{ color: 'var(--red)' }}>*</span></label>
              <select className="form-control" name="priority" value={form.priority} onChange={handleChange}
                style={{ borderColor: priorityColors[form.priority], color: priorityColors[form.priority], fontWeight: 600 }}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-heading">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            Location & Contact
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Resource Location <span style={{ color: 'var(--red)' }}>*</span></label>
              <input
                className="form-control"
                name="resourceLocation"
                placeholder="e.g. Lab 301, Main Hall"
                value={form.resourceLocation}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Resource ID <span style={{ color: 'var(--text-3)', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
              <input
                className="form-control"
                name="resourceId"
                placeholder="e.g. PROJ-004"
                value={form.resourceId}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Preferred Contact</label>
            <input
              className="form-control"
              name="preferredContact"
              placeholder="Phone number or email for follow-up"
              value={form.preferredContact}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Attachments */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-heading">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
            </svg>
            Attachments
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)', fontWeight: 400 }}>
              {files.length}/3 images
            </span>
          </div>

          {/* Drop zone */}
          <div
            className="file-upload-area"
            style={{ borderColor: dragOver ? 'var(--blue)' : undefined, background: dragOver ? '#eef1fe' : undefined }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            onClick={() => document.getElementById('file-input').click()}
          >
            <input
              id="file-input"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
            />
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 8px', display: 'block' }}>
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p style={{ fontWeight: 600, marginBottom: 2 }}>Click or drag images here</p>
            <p style={{ fontSize: 12 }}>PNG, JPG up to 5MB · Max 3 images</p>
          </div>

          {/* Preview */}
          {files.length > 0 && (
            <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              {files.map((file, i) => (
                <div key={i} style={{ position: 'relative', width: 80, height: 80 }}>
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }}
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    style={{
                      position: 'absolute', top: -6, right: -6,
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'var(--red)', color: '#fff',
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700,
                    }}
                  >✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: 'var(--red-l)', color: 'var(--red)', padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 13, fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Actions */}
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/tickets')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }}/>
                Submitting...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                </svg>
                Submit Ticket
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}