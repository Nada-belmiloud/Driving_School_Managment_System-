import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 429 (Rate Limit) errors with exponential backoff
        if (error.response?.status === 429 && !originalRequest._retry) {
            originalRequest._retry = true;
            originalRequest._retryCount = originalRequest._retryCount || 0;

            // Maximum 3 retries
            if (originalRequest._retryCount < 3) {
                originalRequest._retryCount += 1;
                
                // Exponential backoff: 1s, 2s, 4s
                const backoffDelay = Math.pow(2, originalRequest._retryCount - 1) * 1000;
                
                console.log(`Rate limit hit. Retrying in ${backoffDelay}ms (attempt ${originalRequest._retryCount}/3)...`);
                
                await delay(backoffDelay);
                
                return api(originalRequest);
            } else {
                console.error('Max retries reached for rate-limited request');
            }
        }

        // Handle 401 (Unauthorized) errors
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            // Only redirect if we're not already on the login page
            const isLoginPage = window.location.pathname === '/login';
            if (!isLoginPage) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getMe: () => api.get('/auth/me'),
    updatePassword: (passwords) => api.put('/auth/updatepassword', passwords),
    logout: () => api.post('/auth/logout'),
};

export const studentsAPI = {
    getAll: (params) => api.get('/students', { params }),
    getOne: (id) => api.get(`/students/${id}`),
    create: (data) => api.post('/students', data),
    update: (id, data) => api.put(`/students/${id}`, data),
    delete: (id) => api.delete(`/students/${id}`),
    getStats: () => api.get('/students/stats'),
};

export const instructorsAPI = {
    getAll: (params) => api.get('/instructors', { params }),
    getOne: (id) => api.get(`/instructors/${id}`),
    create: (data) => api.post('/instructors', data),
    update: (id, data) => api.put(`/instructors/${id}`, data),
    delete: (id) => api.delete(`/instructors/${id}`),
    getSchedule: (id) => api.get(`/instructors/${id}/schedule`),
    getStats: () => api.get('/instructors/stats'), // Add this line
};

export const vehiclesAPI = {
    getAll: (params) => api.get('/vehicles', { params }),
    getOne: (id) => api.get(`/vehicles/${id}`),
    create: (data) => api.post('/vehicles', data),
    update: (id, data) => api.put(`/vehicles/${id}`, data),
    delete: (id) => api.delete(`/vehicles/${id}`),
    getStats: () => api.get('/vehicles/stats'),
    getAvailability: (id, date) => api.get(`/vehicles/${id}/availability`, { params: { date } }),
    getMaintenance: (id) => api.get(`/vehicles/${id}/maintenance`),
    addMaintenance: (id, data) => api.post(`/vehicles/${id}/maintenance`, data),
    updateMaintenance: (id, maintenanceId, data) => api.put(`/vehicles/${id}/maintenance/${maintenanceId}`, data),
    deleteMaintenance: (id, maintenanceId) => api.delete(`/vehicles/${id}/maintenance/${maintenanceId}`),
};

export const lessonsAPI = {
    // Get all lessons with filters
    getAll: (params = {}) => api.get('/lessons', { params }),

    // Get single lesson
    getOne: (id) => api.get(`/lessons/${id}`),

    // Create new lesson
    create: (data) => api.post('/lessons', data),

    // Update lesson
    update: (id, data) => api.put(`/lessons/${id}`, data),

    // Delete/Cancel lesson
    delete: (id) => api.delete(`/lessons/${id}`),

    // Get lesson statistics
    getStats: () => api.get('/lessons/stats'),

    // Check availability for scheduling
    checkAvailability: (data) => api.post('/lessons/check-availability', data),

    // Complete a lesson
    complete: (id, data) => api.put(`/lessons/${id}/complete`, data),

    // Get calendar lessons (all lessons for a month)
    getCalendarLessons: (year, month) =>
        api.get('/lessons/calendar', { params: { year, month } }),

    // Bulk schedule multiple lessons
    bulkSchedule: (lessons) =>
        api.post('/lessons/bulk-schedule', { lessons }),

    // Get upcoming lessons
    getUpcoming: (limit = 10) =>
        api.get('/lessons/upcoming', { params: { limit } }),
};

export const paymentsAPI = {
    getAll: (params) => api.get('/payments', { params }),
    getOne: (id) => api.get(`/payments/${id}`),
    create: (data) => api.post('/payments', data),
    update: (id, data) => api.put(`/payments/${id}`, data),
    delete: (id) => api.delete(`/payments/${id}`),
    getStats: () => api.get('/payments/stats'),
    getStudentPayments: (studentId) => api.get(`/payments/student/${studentId}`),
    getPending: () => api.get('/payments/pending'),
    markAsPaid: (id) => api.put(`/payments/${id}/mark-paid`),
};

export const settingsAPI = {
    getSettings: () => api.get('/settings'),
    updateProfile: (data) => api.put('/settings/profile', data),
    getNotificationSettings: () => api.get('/settings/notifications'),
    updateNotificationSettings: (data) => api.put('/settings/notifications', data),
    getAppearanceSettings: () => api.get('/settings/appearance'),
    updateAppearanceSettings: (data) => api.put('/settings/appearance', data),
    getSecuritySettings: () => api.get('/settings/security'),
    toggleTwoFactor: (enabled) => api.post('/settings/security/two-factor', { enabled }),
    endSession: (sessionId) => api.delete(`/settings/security/sessions/${sessionId}`),
    getBackupSettings: () => api.get('/settings/backups'),
    updateBackupPreferences: (data) => api.put('/settings/backups/preferences', data),
    createBackup: (payload = {}) => api.post('/settings/backups', payload),
    restoreBackup: (backupId) => api.post(`/settings/backups/${backupId}/restore`),
    downloadBackup: (backupId) => api.get(`/settings/backups/${backupId}/download`),
    getSystemStatus: () => api.get('/settings/system'),
    clearCache: () => api.post('/settings/system/clear-cache'),
    optimizeDatabase: () => api.post('/settings/system/optimize-database'),
    exportLogs: () => api.post('/settings/system/export-logs'),
};

export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getActivities: (limit = 10) => api.get('/dashboard/activities', { params: { limit } }),
    getCharts: (period = '7d') => api.get('/dashboard/charts', { params: { period } }),
};

export default api;