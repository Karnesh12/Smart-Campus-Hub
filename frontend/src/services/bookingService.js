import api from './api'

const bookingService = {
    create: (data) => api.post('/bookings', data),
    getMy: () => api.get('/bookings/my'),
    getAll: (params) => api.get('/bookings', { params }),
    getById: (id) => api.get(`/bookings/${id}`),
    approve: (id) => api.patch(`/bookings/${id}/approve`),
    reject: (id, reason) => api.patch(`/bookings/${id}/reject`, { reason }),
    cancel: (id) => api.patch(`/bookings/${id}/cancel`),
}

export default bookingService
