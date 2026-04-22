import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:8082/api',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || error.message
        return Promise.reject(new Error(message))
    }
)

export default api