const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5059/api';

export const fetchStations = async (status = '', gridOperator = '') => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (gridOperator) params.append('gridOperator', gridOperator);
  const queryString = params.toString();
  const url = queryString ? `${API_BASE_URL}/stations?${queryString}` : `${API_BASE_URL}/stations`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch stations');
  return response.json();
};

export const fetchStationById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/stations/${id}`);
  if (!response.ok) throw new Error('Failed to fetch station');
  return response.json();
};

export const createStation = async (data) => {
  const response = await fetch(`${API_BASE_URL}/stations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create station');
  return response.json();
};

export const updateStation = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/stations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update station');
  return true;
};

export const updateStationStatus = async (id, status) => {
  const response = await fetch(`${API_BASE_URL}/stations/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(status),
  });
  if (!response.ok) throw new Error('Failed to update status');
  return true;
};

export const fetchSlots = async (stationId, date = '', status = '') => {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  if (status) params.append('status', status);
  const queryString = params.toString();
  const url = queryString ? `${API_BASE_URL}/stations/${stationId}/slots?${queryString}` : `${API_BASE_URL}/stations/${stationId}/slots`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch slots');
  return response.json();
};

export const createSlot = async (stationId, data) => {
  const response = await fetch(`${API_BASE_URL}/stations/${stationId}/slots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || 'Failed to create slot');
  }
  return response.json();
};

export const updateSlotStatus = async (slotId, status) => {
  const response = await fetch(`${API_BASE_URL}/EnergySlots/${slotId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(status),
  });
  if (!response.ok) throw new Error('Failed to update slot status');
  return true;
};

export const deleteSlot = async (slotId) => {
  return updateSlotStatus(slotId, 'Deleted');
};
