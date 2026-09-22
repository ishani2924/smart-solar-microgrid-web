const API_BASE_URL = 'https://localhost:7083/api';

export const fetchStations = async (status = '') => {
  const url = status ? `${API_BASE_URL}/stations?status=${status}` : `${API_BASE_URL}/stations`;
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

// Slots
export const fetchSlots = async (stationId, date = '') => {
  const url = date ? `${API_BASE_URL}/stations/${stationId}/slots?date=${date}` : `${API_BASE_URL}/stations/${stationId}/slots`;
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
  const response = await fetch(`${API_BASE_URL}/slots/${slotId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(status),
  });
  if (!response.ok) throw new Error('Failed to update slot status');
  return true;
};
