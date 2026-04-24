import axios from 'axios';

const API_BASE = 'http://localhost:8082/api';

// Always get fresh token from localStorage
const getToken = () => localStorage.getItem('jwt_token');

// Use axios with fresh token every call
const authAxios = () => {
  const token = getToken();
  return axios.create({
    baseURL: API_BASE,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
};

// ── TICKETS ───────────────────────────────────────────────────────────────────

export const getAllTickets = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status)   params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.category) params.append('category', filters.category);
  const res = await authAxios().get(`/tickets?${params}`);
  return res.data;
};

export const getMyTickets = async () => {
  const res = await authAxios().get('/tickets/my');
  return res.data;
};

export const getTicketById = async (id) => {
  const res = await authAxios().get(`/tickets/${id}`);
  return res.data;
};

export const createTicket = async (data) => {
  const res = await authAxios().post('/tickets', data);
  return res.data;
};

export const updateTicketStatus = async (id, data) => {
  const res = await authAxios().patch(`/tickets/${id}/status`, data);
  return res.data;
};

export const deleteTicket = async (id) => {
  await authAxios().delete(`/tickets/${id}`);
};

// ── ATTACHMENTS ───────────────────────────────────────────────────────────────

export const uploadAttachments = async (ticketId, files) => {
  const token = getToken();
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  const res = await axios.post(
    `${API_BASE}/tickets/${ticketId}/attachments`,
    formData,
    {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }
  );
  return res.data;
};

export const getAttachmentUrl = (path) =>
  `http://localhost:8082${path}`;

// ── COMMENTS ──────────────────────────────────────────────────────────────────

export const getComments = async (ticketId) => {
  const res = await authAxios().get(`/tickets/${ticketId}/comments`);
  return res.data;
};

export const addComment = async (ticketId, content) => {
  const res = await authAxios().post(`/tickets/${ticketId}/comments`, { content });
  return res.data;
};

export const updateComment = async (ticketId, commentId, content) => {
  const res = await authAxios().put(
    `/tickets/${ticketId}/comments/${commentId}`,
    { content }
  );
  return res.data;
};

export const deleteComment = async (ticketId, commentId) => {
  await authAxios().delete(`/tickets/${ticketId}/comments/${commentId}`);
};