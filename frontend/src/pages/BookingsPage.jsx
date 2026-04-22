import React, { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { Plus, Search, CalendarCheck, Clock, CheckCircle, XCircle, Ban, AlarmClock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import bookingService from '../services/bookingService'
import BookingForm from '../components/BookingForm'
import BookingDetailModal from '../components/BookingDetailModal'

const STATUS_TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']

const STATUS_BADGE = {
    PENDING: 'badge-yellow',
    APPROVED: 'badge-green',
    REJECTED: 'badge-red',
    CANCELLED: 'badge-gray',
}

const STATUS_ICON = {
    PENDING: <AlarmClock size={12} />,
    APPROVED: <CheckCircle size={12} />,
    REJECTED: <XCircle size={12} />,
    CANCELLED: <Ban size={12} />,
}

function formatTime(t) {
    if (!t) return '—'
    const [h, m] = t.split(':')
    const d = new Date(); d.setHours(h, m)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(d) {
    if (!d) return '—'
    const parts = d.split('-')
    return new Date(parts[0], parts[1] - 1, parts[2])
        .toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function BookingsPage() {
    const { user } = useAuth()
    const isAdmin = user?.role === 'ADMIN'
    const isStaff = user?.role === 'STAFF'
    const canManageAll = isAdmin || isStaff

    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [statusTab, setStatusTab] = useState('ALL')
    const [search, setSearch] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [formLoading, setFormLoading] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState(null)

    const load = useCallback(() => {
        setLoading(true)
        const fetch = canManageAll ? bookingService.getAll() : bookingService.getMy()
        fetch
            .then(r => setBookings(Array.isArray(r.data) ? r.data : []))
            .catch(() => toast.error('Failed to load bookings'))
            .finally(() => setLoading(false))
    }, [canManageAll])

    useEffect(load, [load])

    // Client-side filtering
    const filtered = bookings.filter(b => {
        const matchStatus = statusTab === 'ALL' || b.status === statusTab
        const matchSearch = !search ||
            b.resource?.name?.toLowerCase().includes(search.toLowerCase()) ||
            b.purpose?.toLowerCase().includes(search.toLowerCase()) ||
            b.user?.name?.toLowerCase().includes(search.toLowerCase())
        return matchStatus && matchSearch
    })

    // Stats
    const counts = bookings.reduce((acc, b) => {
        acc[b.status] = (acc[b.status] || 0) + 1
        return acc
    }, {})

    const handleCreate = async (data) => {
        setFormLoading(true)
        try {
            await bookingService.create(data)
            toast.success('Booking request submitted!')
            setShowForm(false)
            load()
        } catch (err) {
            toast.error(err.message)
        } finally {
            setFormLoading(false)
        }
    }

    const handleApprove = async (id) => {
        setActionLoading(true)
        try {
            await bookingService.approve(id)
            toast.success('Booking approved')
            setSelectedBooking(null)
            load()
        } catch (err) {
            toast.error(err.message)
        } finally {
            setActionLoading(false)
        }
    }

    const handleReject = async (id, reason) => {
        setActionLoading(true)
        try {
            await bookingService.reject(id, reason)
            toast.success('Booking rejected')
            setSelectedBooking(null)
            load()
        } catch (err) {
            toast.error(err.message)
        } finally {
            setActionLoading(false)
        }
    }

    const handleCancel = async (id) => {
        setActionLoading(true)
        try {
            await bookingService.cancel(id)
            toast.success('Booking cancelled')
            setSelectedBooking(null)
            load()
        } catch (err) {
            toast.error(err.message)
        } finally {
            setActionLoading(false)
        }
    }

    return (
        <div>
            {/* Page header */}
            <div className="page-header page-header-row">
                <div>
                    <h1>{canManageAll ? 'All Bookings' : 'My Bookings'}</h1>
                    <p>{canManageAll ? 'Review and manage all booking requests' : 'View and manage your resource bookings'}</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    <Plus size={15} /> Book a Resource
                </button>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', marginBottom: 24 }}>
                <div className="stat-card">
                    <div className="stat-icon blue"><CalendarCheck size={20} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{bookings.length}</div>
                        <div className="stat-label">Total</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon yellow"><AlarmClock size={20} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{counts.PENDING || 0}</div>
                        <div className="stat-label">Pending</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green"><CheckCircle size={20} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{counts.APPROVED || 0}</div>
                        <div className="stat-label">Approved</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon red"><XCircle size={20} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{(counts.REJECTED || 0) + (counts.CANCELLED || 0)}</div>
                        <div className="stat-label">Rejected / Cancelled</div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="toolbar" style={{ marginBottom: 0 }}>
                <div className="search-box">
                    <Search size={14} />
                    <input
                        placeholder={canManageAll ? 'Search by resource, user or purpose…' : 'Search by resource or purpose…'}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-3)' }}>
                    {filtered.length} booking{filtered.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Status tabs */}
            <div className="status-tabs">
                {STATUS_TABS.map(tab => (
                    <button
                        key={tab}
                        className={`status-tab${statusTab === tab ? ' active' : ''}`}
                        onClick={() => setStatusTab(tab)}
                    >
                        {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                        {tab !== 'ALL' && counts[tab] ? (
                            <span className="status-tab-count">{counts[tab]}</span>
                        ) : null}
                    </button>
                ))}
            </div>

            {/* Table */}
            {loading ? (
                <div className="loading-container"><div className="spinner" /></div>
            ) : filtered.length === 0 ? (
                <div className="empty-state">
                    <CalendarCheck size={48} />
                    <h3>No bookings found</h3>
                    <p>{statusTab !== 'ALL' ? `No ${statusTab.toLowerCase()} bookings` : 'No bookings yet'}</p>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: 0 }}>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Resource</th>
                                    {canManageAll && <th>Requested By</th>}
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Purpose</th>
                                    <th>Attendees</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(b => (
                                    <tr key={b.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedBooking(b)}>
                                        <td>
                                            <div style={{ fontWeight: 600, color: 'var(--text)' }}>{b.resource?.name}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
                                                {b.resource?.location}
                                            </div>
                                        </td>
                                        {canManageAll && (
                                            <td>
                                                <div style={{ fontWeight: 500, color: 'var(--text)' }}>{b.user?.name}</div>
                                                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{b.user?.email}</div>
                                            </td>
                                        )}
                                        <td style={{ whiteSpace: 'nowrap' }}>{formatDate(b.bookingDate)}</td>
                                        <td style={{ whiteSpace: 'nowrap', color: 'var(--text)' }}>
                                            {formatTime(b.startTime)} – {formatTime(b.endTime)}
                                        </td>
                                        <td style={{ maxWidth: 180 }}>
                                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {b.purpose}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>{b.expectedAttendees}</td>
                                        <td>
                                            <span className={`badge ${STATUS_BADGE[b.status] || 'badge-gray'}`}
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                {STATUS_ICON[b.status]}
                                                {b.status.charAt(0) + b.status.slice(1).toLowerCase()}
                                            </span>
                                        </td>
                                        <td onClick={e => e.stopPropagation()}>
                                            <div style={{ display: 'flex', gap: 5, flexWrap: 'nowrap' }}>
                                                {/* Admin: approve/reject pending */}
                                                {isAdmin && b.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            className="btn btn-success btn-sm"
                                                            onClick={() => handleApprove(b.id)}
                                                            disabled={actionLoading}
                                                            title="Approve"
                                                        >
                                                            <CheckCircle size={12} />
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => setSelectedBooking(b)}
                                                            disabled={actionLoading}
                                                            title="Reject"
                                                        >
                                                            <XCircle size={12} />
                                                        </button>
                                                    </>
                                                )}
                                                {/* Owner or admin: cancel pending/approved */}
                                                {(b.user?.id === user?.id || isAdmin) &&
                                                    (b.status === 'PENDING' || b.status === 'APPROVED') && (
                                                        <button
                                                            className="btn btn-secondary btn-sm"
                                                            onClick={() => handleCancel(b.id)}
                                                            disabled={actionLoading}
                                                            title="Cancel"
                                                        >
                                                            <Ban size={12} />
                                                        </button>
                                                    )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create booking modal */}
            {showForm && (
                <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
                    <div className="modal" style={{ maxWidth: 560 }}>
                        <h2>Book a Resource</h2>
                        <BookingForm
                            onSubmit={handleCreate}
                            onCancel={() => setShowForm(false)}
                            loading={formLoading}
                        />
                    </div>
                </div>
            )}

            {/* Detail / action modal */}
            {selectedBooking && (
                <BookingDetailModal
                    booking={selectedBooking}
                    isAdmin={isAdmin}
                    currentUserId={user?.id}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onCancel={handleCancel}
                    onClose={() => setSelectedBooking(null)}
                    actionLoading={actionLoading}
                />
            )}
        </div>
    )
}
