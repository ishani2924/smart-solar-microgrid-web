/**
 * File: reservationApi.js
 * Author: Upasama (Member 3 - Reservation & Booking Management)
 * Description: React API service layer for Energy Reservation endpoints.
 *              Uses the shared axios instance from api.js so JWT Bearer token
 *              is automatically attached via the existing request interceptor.
 *              All responses are normalized to camelCase by the response interceptor.
 *
 * API Base: http://localhost:5059/api/reservations
 */

import api from './api';

// ============================================================
// GET — Read Operations
// ============================================================

/**
 * GET /api/reservations
 * Returns all reservations. Accessible by Backoffice and GridOperator.
 * Used on: ReservationsPage (all reservations list)
 */
export const getAllReservations = async () => {
  const response = await api.get('/reservations');
  return response.data; // { success, data: ReservationResponseDto[] }
};

/**
 * GET /api/reservations/{id}
 * Returns a single reservation by MongoDB ObjectId.
 * Used on: ReservationDetailsPage
 */
export const getReservationById = async (id) => {
  const response = await api.get(`/reservations/${id}`);
  return response.data; // { success, data: ReservationResponseDto }
};

/**
 * GET /api/reservations/pending
 * Returns all Pending reservations sorted oldest first.
 * Used on: PendingReservationsPage
 */
export const getPendingReservations = async () => {
  const response = await api.get('/reservations/pending');
  return response.data; // { success, data: ReservationResponseDto[] }
};

/**
 * GET /api/reservations/search
 * Flexible search with optional query params.
 * @param {Object} params - { nic, stationId, status, from, to }
 * Used on: ReservationsPage (filter), BookingHistoryPage (status filter)
 */
export const searchReservations = async (params = {}) => {
  // Remove empty/null/undefined values so the API doesn't receive blank params
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );
  const response = await api.get('/reservations/search', { params: cleanParams });
  return response.data; // { success, data: ReservationResponseDto[] }
};

/**
 * GET /api/reservations/dashboard
 * Returns PendingCount and ApprovedFutureCount summary.
 * Used on: BookingDashboardPage (BookingStatsCards)
 */
export const getDashboardSummary = async () => {
  const response = await api.get('/reservations/dashboard');
  return response.data; // { success, data: { pendingCount, approvedFutureCount } }
};

// ============================================================
// PUT — Status Change Operations
// ============================================================

/**
 * PUT /api/reservations/{id}/approve
 * Approves a Pending reservation. Backoffice or GridOperator only.
 * Backend transitions: Pending → Approved
 * Used on: PendingReservationsPage (Approve button), ReservationDetailsPage
 */
export const approveReservation = async (id) => {
  const response = await api.put(`/reservations/${id}/approve`);
  return response.data; // { success, data: ReservationResponseDto, message }
};

/**
 * PUT /api/reservations/{id}/cancel
 * Cancels a Pending or Approved reservation.
 * Backend enforces the 12-hour rule before cancelling.
 * Backend transitions: Pending/Approved → Cancelled
 * Used on: ReservationDetailsPage (Cancel button), ReservationsPage
 */
export const cancelReservation = async (id) => {
  const response = await api.put(`/reservations/${id}/cancel`);
  return response.data; // { success, data: ReservationResponseDto, message }
};

// ============================================================
// DELETE — Hard Delete (Backoffice only)
// ============================================================

/**
 * DELETE /api/reservations/{id}
 * Hard deletes a reservation. Backoffice only.
 * Used on: ReservationDetailsPage (Delete button, Backoffice-only)
 */
export const deleteReservation = async (id) => {
  const response = await api.delete(`/reservations/${id}`);
  return response.data; // { success, message }
};
