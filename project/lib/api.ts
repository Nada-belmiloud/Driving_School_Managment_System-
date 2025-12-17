// lib/api.ts
// API helper functions for connecting frontend to backend
// Base URL for the backend API

// Production API URL (Render backend)
const PRODUCTION_API_URL = 'https://driving-school-managment-system-api.onrender.com/api/v1';

// Use environment variable if set, otherwise use production URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || PRODUCTION_API_URL;

// Log the API URL for debugging
if (typeof window !== 'undefined') {
  console.log('API_BASE_URL:', API_BASE_URL);
}

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('Making API request to:', url);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    console.log('API response status:', response.status);
    const result = await response.json();
    console.log('API response body:', result);
    return result;
  } catch (error) {
    console.error('API request error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    };
  }
}

// ==================== AUTH API ====================
export const authApi = {
  login: async (username: string, email: string, password: string) => {
    const result = await apiRequest<{ id: string; name: string; email: string; token: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      }
    );

    // Store token if login successful
    if (result.success && result.data?.token) {
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: result.data.id,
        name: result.data.name,
        email: result.data.email
      }));
    }

    return result;
  },

  logout: async () => {
    const result = await apiRequest('/auth/logout', { method: 'POST' });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return result;
  },

  getMe: () => apiRequest<{ id: string; name: string; email: string }>('/auth/me'),

  updateEmail: (email: string, password: string) =>
    apiRequest('/auth/email', {
      method: 'PUT',
      body: JSON.stringify({ email, password }),
    }),

  updatePassword: (currentPassword: string, newPassword: string) =>
    apiRequest('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  updateName: (name: string) =>
    apiRequest('/auth/name', {
      method: 'PUT',
      body: JSON.stringify({ name }),
    }),

  forgotPassword: (email: string) =>
    apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    apiRequest<{ token: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),
};

// ==================== DASHBOARD API ====================
export const dashboardApi = {
  getStats: () =>
    apiRequest<{
      totalCandidates: number;
      totalInstructors: number;
      totalVehicles: number;
      pendingPayments: { count: number; totalAmount: number };
    }>('/dashboard/stats'),
};

// ==================== CANDIDATES API ====================
export const candidatesApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string; licenseType?: string; search?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return apiRequest(`/candidates${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => apiRequest(`/candidates/${id}`),

  getCount: () => apiRequest<{ total: number }>('/candidates/count'),

  create: (data: {
    name: string;
    email: string;
    phone: string;
    licenseType: string;
    address?: string;
    dateOfBirth?: string;
    documents?: { name: string; checked: boolean }[];
    paidAmount?: number;
    totalFee?: number;
  }) =>
    apiRequest('/candidates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<{
    name: string;
    email: string;
    phone: string;
    licenseType: string;
    address: string;
    status: string;
    progress: string;
  }>) =>
    apiRequest(`/candidates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest(`/candidates/${id}`, { method: 'DELETE' }),

  updateProgress: (id: string, progress: 'highway_code' | 'parking' | 'driving') =>
    apiRequest(`/candidates/${id}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ progress }),
    }),
};

// ==================== INSTRUCTORS API ====================
export const instructorsApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return apiRequest(`/instructors${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => apiRequest(`/instructors/${id}`),

  getCount: () => apiRequest<{ total: number }>('/instructors/count'),

  create: (data: { name: string; email: string; phone: string; address?: string }) =>
    apiRequest('/instructors', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<{ name: string; email: string; phone: string; address: string }>) =>
    apiRequest(`/instructors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest(`/instructors/${id}`, { method: 'DELETE' }),

  assignVehicle: (instructorId: string, vehicleId: string | null) =>
    apiRequest(`/instructors/${instructorId}/assign-vehicle`, {
      method: 'PUT',
      body: JSON.stringify({ vehicleId }),
    }),
};

// ==================== VEHICLES API ====================
export const vehiclesApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return apiRequest(`/vehicles${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => apiRequest(`/vehicles/${id}`),

  getCount: () => apiRequest<{ total: number }>('/vehicles/count'),

  create: (data: { brand: string; model: string; licensePlate: string }) =>
    apiRequest('/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<{ brand: string; model: string; licensePlate: string; status: string }>) =>
    apiRequest(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest(`/vehicles/${id}`, { method: 'DELETE' }),

  assignInstructor: (vehicleId: string, instructorId: string | null) =>
    apiRequest(`/vehicles/${vehicleId}/assign-instructor`, {
      method: 'PUT',
      body: JSON.stringify({ instructorId }),
    }),

  // Maintenance logs
  getMaintenanceLogs: (vehicleId: string) =>
    apiRequest(`/vehicles/${vehicleId}/maintenance-logs`),

  addMaintenanceLog: (vehicleId: string, data: {
    type: string;
    description: string;
    cost: number;
    performedBy?: string;
    date?: string;
  }) =>
    apiRequest(`/vehicles/${vehicleId}/maintenance-logs`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateMaintenanceLog: (vehicleId: string, logId: string, data: Partial<{
    type: string;
    description: string;
    cost: number;
    performedBy: string;
  }>) =>
    apiRequest(`/vehicles/${vehicleId}/maintenance-logs/${logId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteMaintenanceLog: (vehicleId: string, logId: string) =>
    apiRequest(`/vehicles/${vehicleId}/maintenance-logs/${logId}`, {
      method: 'DELETE',
    }),
};

// ==================== SCHEDULE API ====================
export const scheduleApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    lessonType?: string;
    candidateId?: string;
    instructorId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return apiRequest(`/schedule${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => apiRequest(`/schedule/${id}`),

  getUpcoming: (limit?: number) =>
    apiRequest(`/schedule/upcoming${limit ? `?limit=${limit}` : ''}`),

  getCandidateSchedule: (candidateId: string) =>
    apiRequest(`/schedule/candidate/${candidateId}`),

  getInstructorSchedule: (instructorId: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    const query = params.toString();
    return apiRequest(`/schedule/instructor/${instructorId}${query ? `?${query}` : ''}`);
  },

  create: (data: {
    candidateId: string;
    instructorId: string;
    date: string;
    time: string;
    lessonType: 'highway_code' | 'parking' | 'driving';
  }) =>
    apiRequest('/schedule', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<{
    date: string;
    time: string;
    lessonType: string;
    instructorId: string;
  }>) =>
    apiRequest(`/schedule/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  cancel: (id: string) =>
    apiRequest(`/schedule/${id}`, { method: 'DELETE' }),

  complete: (id: string) =>
    apiRequest(`/schedule/${id}/complete`, { method: 'PUT' }),
};

// ==================== EXAMS API ====================
export const examsApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    examType?: string;
    candidateId?: string;
    instructorId?: string;
  }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return apiRequest(`/exams${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => apiRequest(`/exams/${id}`),

  getUpcoming: (limit?: number) =>
    apiRequest(`/exams/upcoming${limit ? `?limit=${limit}` : ''}`),

  getCandidateExams: (candidateId: string) =>
    apiRequest(`/exams/candidate/${candidateId}`),

  canTakeExam: (candidateId: string, examType: 'highway_code' | 'parking' | 'driving') =>
    apiRequest<{ canTake: boolean; reason?: string; waitUntil?: string }>(
      `/exams/can-take/${candidateId}/${examType}`
    ),

  schedule: (data: {
    candidateId: string;
    instructorId: string;
    examType: 'highway_code' | 'parking' | 'driving';
    date: string;
    time: string;
    notes?: string;
  }) =>
    apiRequest('/exams', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<{
    date: string;
    time: string;
    instructorId: string;
    notes: string;
  }>) =>
    apiRequest(`/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  cancel: (id: string) =>
    apiRequest(`/exams/${id}`, { method: 'DELETE' }),

  recordResult: (id: string, result: 'passed' | 'failed', notes?: string) =>
    apiRequest(`/exams/${id}/result`, {
      method: 'PUT',
      body: JSON.stringify({ result, notes }),
    }),
};

// ==================== PAYMENTS API ====================
export const paymentsApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string; candidateId?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return apiRequest(`/payments${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => apiRequest(`/payments/${id}`),

  getPending: () => apiRequest('/payments/pending'),

  getPendingCount: () =>
    apiRequest<{ count: number; totalPendingAmount: number }>('/payments/pending/count'),

  getCandidatePayments: (candidateId: string) =>
    apiRequest(`/payments/candidate/${candidateId}`),

  create: (data: { candidateId: string; amount: number; status?: 'pending' | 'paid'; date?: string }) =>
    apiRequest('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<{ amount: number; status: string; date: string }>) =>
    apiRequest(`/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest(`/payments/${id}`, { method: 'DELETE' }),

  markAsPaid: (id: string) =>
    apiRequest(`/payments/${id}/mark-paid`, { method: 'PUT' }),
};

// ==================== SETTINGS API ====================
export const settingsApi = {
  get: () => apiRequest('/settings'),

  updateName: (name: string) =>
    apiRequest('/settings/name', {
      method: 'PUT',
      body: JSON.stringify({ name }),
    }),

  updateEmail: (email: string, password: string) =>
    apiRequest('/settings/email', {
      method: 'PUT',
      body: JSON.stringify({ email, password }),
    }),

  updatePassword: (currentPassword: string, newPassword: string) =>
    apiRequest('/settings/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// Export all APIs
export default {
  auth: authApi,
  dashboard: dashboardApi,
  candidates: candidatesApi,
  instructors: instructorsApi,
  vehicles: vehiclesApi,
  schedule: scheduleApi,
  exams: examsApi,
  payments: paymentsApi,
  settings: settingsApi,
};

