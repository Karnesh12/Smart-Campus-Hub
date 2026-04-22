import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const TYPES = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'SPORTS', 'STUDY_ROOM', 'AUDITORIUM', 'OTHER']
const STATUSES = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RETIRED']

export default function ResourceForm({ initial, onSubmit, onCancel }) {
    const [form, setForm] = useState({
        name: '', type: 'LECTURE_HALL', location: '',
        capacity: 10, status: 'AVAILABLE', description: '',
        occupiedFrom: '', occupiedUntil: '',
        ...initial,
    })

    const [minDateTime, setMinDateTime] = useState('')
    
    useEffect(() => {
        const now = new Date()
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
        setMinDateTime(now.toISOString().slice(0, 16))
    }, [])

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const handleSubmit = (e) => {
        e.preventDefault()

        if (form.status === 'OCCUPIED') {
            if (new Date(form.occupiedUntil) <= new Date(form.occupiedFrom)) {
                toast.error('Occupied Until time must be after Occupied From time')
                return
            }
            
            if (!initial && new Date(form.occupiedFrom) < new Date()) {
                toast.error('Occupied From time cannot be in the past')
                return
            }
        }

        const submitData = { ...form, capacity: Number(form.capacity) }
        if (submitData.status !== 'OCCUPIED') {
            submitData.occupiedFrom = null
            submitData.occupiedUntil = null
        }
        onSubmit(submitData)
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-grid">
                <div className="form-group">
                    <label>Resource Name *</label>
                    <input className="form-control" required value={form.name}
                        onChange={e => set('name', e.target.value)} placeholder="e.g. Lecture Hall A" />
                </div>
                <div className="form-group">
                    <label>Type *</label>
                    <select className="form-control" value={form.type} onChange={e => set('type', e.target.value)}>
                        {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>Location *</label>
                    <input className="form-control" required value={form.location}
                        onChange={e => set('location', e.target.value)} placeholder="e.g. Block A, Ground Floor" />
                </div>
                <div className="form-group">
                    <label>Capacity *</label>
                    <input className="form-control" type="number" required min={1} value={form.capacity}
                        onChange={e => set('capacity', e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Status</label>
                    <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                {form.status === 'OCCUPIED' && (
                    <>
                        <div className="form-group">
                            <label>Occupied From *</label>
                            <input className="form-control" type="datetime-local" required 
                                min={initial?.occupiedFrom ? undefined : minDateTime} 
                                value={form.occupiedFrom || ''} 
                                onChange={e => set('occupiedFrom', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Occupied Until *</label>
                            <input className="form-control" type="datetime-local" required 
                                min={form.occupiedFrom || minDateTime} 
                                value={form.occupiedUntil || ''} 
                                onChange={e => set('occupiedUntil', e.target.value)} />
                        </div>
                    </>
                )}
            </div>
            <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" rows={3} value={form.description}
                    onChange={e => set('description', e.target.value)} placeholder="Optional description..." />
            </div>
            <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                    {initial ? 'Update Resource' : 'Create Resource'}
                </button>
            </div>
        </form>
    )
}