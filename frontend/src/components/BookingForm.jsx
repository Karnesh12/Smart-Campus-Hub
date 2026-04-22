import React, { useState, useEffect } from 'react'
import { CalendarDays, Clock, Users, FileText, Building2 } from 'lucide-react'
import resourceService from '../services/resourceService'

const today = new Date().toISOString().split('T')[0]

export default function BookingForm({ onSubmit, onCancel, loading }) {
    const [resources, setResources] = useState([])
    const [form, setForm] = useState({
        resourceId: '',
        bookingDate: '',
        startTime: '',
        endTime: '',
        purpose: '',
        expectedAttendees: 1,
    })
    const [error, setError] = useState('')

    useEffect(() => {
        resourceService.getAll()
            .then(r => {
                const all = Array.isArray(r.data) ? r.data : []
                setResources(all.filter(res => res.status !== 'MAINTENANCE' && res.status !== 'RETIRED'))
            })
            .catch(() => {})
    }, [])

    const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

    const selectedResource = resources.find(r => r.id === Number(form.resourceId))

    const handleSubmit = (e) => {
        e.preventDefault()
        setError('')

        if (!form.resourceId) return setError('Please select a resource.')
        if (!form.bookingDate) return setError('Please select a date.')
        if (!form.startTime || !form.endTime) return setError('Please set both start and end times.')
        if (form.startTime >= form.endTime) return setError('Start time must be before end time.')
        if (selectedResource && form.expectedAttendees > selectedResource.capacity) {
            return setError(`Attendees exceed capacity (${selectedResource.capacity}).`)
        }

        onSubmit({
            resourceId: Number(form.resourceId),
            bookingDate: form.bookingDate,
            startTime: form.startTime + ':00',
            endTime: form.endTime + ':00',
            purpose: form.purpose,
            expectedAttendees: Number(form.expectedAttendees),
        })
    }

    return (
        <form onSubmit={handleSubmit}>
            {/* Resource */}
            <div className="form-group">
                <label><Building2 size={11} style={{ display: 'inline', marginRight: 4 }} />Resource</label>
                <select
                    className="form-control"
                    value={form.resourceId}
                    onChange={e => set('resourceId', e.target.value)}
                    required
                >
                    <option value="">Select a resource…</option>
                    {resources.map(r => (
                        <option key={r.id} value={r.id}>
                            {r.name} — {r.location} (cap. {r.capacity})
                        </option>
                    ))}
                </select>
                {selectedResource && (
                    <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span className="badge badge-blue">{selectedResource.type.replace(/_/g, ' ')}</span>
                        <span className="badge badge-green">Capacity: {selectedResource.capacity}</span>
                        <span className="badge badge-gray">{selectedResource.location}</span>
                    </div>
                )}
            </div>

            <div className="form-grid">
                {/* Date */}
                <div className="form-group">
                    <label><CalendarDays size={11} style={{ display: 'inline', marginRight: 4 }} />Date</label>
                    <input
                        type="date"
                        className="form-control"
                        min={today}
                        value={form.bookingDate}
                        onChange={e => set('bookingDate', e.target.value)}
                        required
                    />
                </div>

                {/* Attendees */}
                <div className="form-group">
                    <label><Users size={11} style={{ display: 'inline', marginRight: 4 }} />Expected Attendees</label>
                    <input
                        type="number"
                        className="form-control"
                        min={1}
                        max={selectedResource?.capacity || 9999}
                        value={form.expectedAttendees}
                        onChange={e => set('expectedAttendees', e.target.value)}
                        required
                    />
                </div>

                {/* Start time */}
                <div className="form-group">
                    <label><Clock size={11} style={{ display: 'inline', marginRight: 4 }} />Start Time</label>
                    <input
                        type="time"
                        className="form-control"
                        value={form.startTime}
                        onChange={e => set('startTime', e.target.value)}
                        required
                    />
                </div>

                {/* End time */}
                <div className="form-group">
                    <label><Clock size={11} style={{ display: 'inline', marginRight: 4 }} />End Time</label>
                    <input
                        type="time"
                        className="form-control"
                        value={form.endTime}
                        onChange={e => set('endTime', e.target.value)}
                        required
                    />
                </div>
            </div>

            {/* Purpose */}
            <div className="form-group">
                <label><FileText size={11} style={{ display: 'inline', marginRight: 4 }} />Purpose</label>
                <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Describe the purpose of this booking…"
                    value={form.purpose}
                    onChange={e => set('purpose', e.target.value)}
                    required
                    style={{ resize: 'vertical' }}
                />
            </div>

            {error && (
                <div className="booking-form-error">{error}</div>
            )}

            <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Submitting…' : 'Submit Booking'}
                </button>
            </div>
        </form>
    )
}
