

import api from './api';

export const getAllReservations = async () => {
  const response = await api.get('/reservations');
  return response.data;
};

export const getReservationById = async (id) => {
  const response = await api.get(`/reservations/${id}`);
  return response.data;
};

export const getPendingReservations = async () => {
  const response = await api.get('/reservations/pending');
  return response.data;
};

export const searchReservations = async (params = {}) => {

  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );
  const response = await api.get('/reservations/search', { params: cleanParams });
  return response.data;
};

export const getDashboardSummary = async () => {
  const response = await api.get('/reservations/dashboard');
  return response.data;
};

export const approveReservation = async (id) => {
  const response = await api.put(`/reservations/${id}/approve`);
  return response.data;
};

export const cancelReservation = async (id) => {
  const response = await api.put(`/reservations/${id}/cancel`);
  return response.data;
};

export const deleteReservation = async (id) => {
  const response = await api.delete(`/reservations/${id}`);
  return response.data;
};
