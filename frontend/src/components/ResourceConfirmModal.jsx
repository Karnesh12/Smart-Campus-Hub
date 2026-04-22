import React from 'react'
import { Trash2 } from 'lucide-react'

export default function ResourceConfirmModal({ open, onClose, onConfirm }) {
    if (!open) return null

    return (
        <div className="modal-backdrop">
            <div className="modal confirm-modal">
                <div className="confirm-icon">
                    <Trash2 size={28} />
                </div>

                <h2>Delete Resource?</h2>
                <p>This action cannot be undone.</p>

                <div className="confirm-actions">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="btn btn-danger" onClick={onConfirm}>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}