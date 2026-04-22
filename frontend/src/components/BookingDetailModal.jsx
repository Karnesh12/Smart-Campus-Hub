import React, { useState } from 'react'
import {
    Building2, CalendarDays, Clock, Users, FileText,
    CheckCircle, XCircle, Ban, X, AlertTriangle
} from 'lucide-react'
import { format } from 'date-fns'

const STATUS_BADGE = {
    PENDING: 'badge-yellow',
    APPROVED: 'badge-green',
    REJECTED: 'badge-red',
    CANCELLED: 'badge-gray',
}

function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="booking-detail-row">
            <span className="booking-detail-label">
                <Icon size={13} style={{ flexShrink: 0 }} /> {label}
            </span>
            <span className="booking-detail-value">{value}</span>
        </div>
    )
}

export default function BookingDetailModal({ booking, isAdmin, currentUserId, onApprove, onReject, onCancel, onClose, actionLoading }) {
    const [showRejectInput, setShowRejectInput] = useState(false)
    const [rejectReason, setRejectReason] = useState('')

    const isOwner = booking.user?.id === currentUserId
    const isPending = booking.status === 'PENDING'
    const isCancellable = booking.status === 'PENDING' || booking.status === 'APPROVED'

    const handleReject = () => {
        if (!rejectReason.trim()) return
        onReject(booking.id, rejectReason)
    }

    const formatTime = (t) => {
        if (!t) return '—'
        const [h, m] = t.split(':')
        const d = new Date(); d.setHours(h, m)
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const formatDate = (d) => {
        if (!d) return '—'
        try { return format(new Date(d), 'EEEE, MMMM d, yyyy') } catch { return d }
    }

    return (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 540 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
                    <div>
                        <h2 style={{ marginBottom: 6 }}>Booking Details</h2>
                        <span className={`badge ${STATUS_BADGE[booking.status] || 'badge-gray'}`}>
                            {booking.status}
                        </span>
                    </div>
                    <button className="btn-icon btn-secondary btn" onClick={onClose} style={{ marginTop: 2 }}>
                        <X size={16} />
                    </button>
                </div>

                {/* Resource info */}
                <div className="booking-detail-resource">
                    <Building2 size={20} color="var(--blue)" />
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
                            {booking.resource?.name}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                            {booking.resource?.location} · cap. {booking.resource?.capacity}
                        </div>
                    </div>
                </div>

                <div className="divider" />

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                    <InfoRow icon={CalendarDays} label="Date" value={formatDate(booking.bookingDate)} />
                    <InfoRow icon={Clock} label="Time" value={`${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`} />
                    <InfoRow icon={Users} label="Attendees" value={booking.expectedAttendees} />
                    <InfoRow icon={FileText} label="Purpose" value={booking.purpose} />
                    {booking.user && (
                        <InfoRow icon={Users} label="Requested by" value={`${booking.user.name} (${booking.user.email})`} />
                    )}
                    {booking.rejectionReason && (
                        <div className="booking-reject-reason">
                            <AlertTriangle size={13} />
                            <span><strong>Rejection reason:</strong> {booking.rejectionReason}</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                {!showRejectInput ? (
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button className="btn btn-secondary" onClick={onClose}>Close</button>

                        {/* Owner can cancel PENDING or APPROVED */}
                        {(isOwner || isAdmin) && isCancellable && (
                            <button
                                className="btn btn-danger"
                                onClick={() => onCancel(booking.id)}
                                disabled={actionLoading}
                            >
                                <Ban size={14} /> Cancel Booking
                            </button>
                        )}

                        {/* Admin can approve/reject PENDING */}
                        {isAdmin && isPending && (
                            <>
                                <button
                                    className="btn btn-success"
                                    onClick={() => onApprove(booking.id)}
                                    disabled={actionLoading}
                                >
                                    <CheckCircle size={14} /> Approve
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => setShowRejectInput(true)}
                                    disabled={actionLoading}
                                >
                                    <XCircle size={14} /> Reject
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <div>
                        <div className="form-group" style={{ marginBottom: 12 }}>
                            <label>Rejection Reason</label>
                            <textarea
                                className="form-control"
                                rows={3}
                                placeholder="Provide a reason for rejection…"
                                value={rejectReason}
                                onChange={e => setRejectReason(e.target.value)}
                                autoFocus
                                style={{ resize: 'vertical' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => { setShowRejectInput(false); setRejectReason('') }}>
                                Back
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={handleReject}
                                disabled={actionLoading || !rejectReason.trim()}
                            >
                                <XCircle size={14} /> Confirm Rejection
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
