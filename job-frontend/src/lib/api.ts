import { useAuthStore } from '@/store/authStore'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface ApiOptions extends RequestInit {
  params?: Record<string, any>
}

export const apiCall = async <T>(url: string, options: ApiOptions = {}): Promise<T> => {
  const { params, ...fetchOptions } = options
  
  // Handle query parameters
  let queryString = ''
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v))
        } else {
          searchParams.append(key, String(value))
        }
      }
    })
    queryString = `?${searchParams.toString()}`
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...fetchOptions.headers,
  }

  // Use FormData if body is FormData
  if (fetchOptions.body instanceof FormData) {
    delete (headers as any)['Content-Type']
  }

  const response = await fetch(`${API_URL}${url}${queryString}`, {
    ...fetchOptions,
    headers,
  })

  // Handle token refresh
  if (response.status === 401) {
    const authStore = useAuthStore.getState()
    try {
      await authStore.refreshAuthToken()
      const newToken = localStorage.getItem('token')
      
      // Retry with new token
      const retryHeaders = {
        ...headers,
        ...(newToken && { Authorization: `Bearer ${newToken}` }),
      }
      
      const retryResponse = await fetch(`${API_URL}${url}${queryString}`, {
        ...fetchOptions,
        headers: retryHeaders,
      })
      
      return await retryResponse.json()
    } catch (refreshError) {
      authStore.logout()
      throw new Error('Session expired. Please login again.')
    }
  }

  const data = await response.json()
  
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'API request failed')
  }

  return data
}

// Service definitions
export const authApi = {
  login: (credentials: any) => apiCall('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData: any) => apiCall('/api/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getProfile: () => apiCall('/api/auth/profile'),
  changePassword: (data: any) => apiCall('/api/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (email: string) => apiCall('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (data: any) => apiCall('/api/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
}

export const jobApi = {
  getAll: (filters: any) => apiCall('/api/jobs', { params: filters }),
  getFeatured: (params: any) => apiCall('/api/jobs/featured', { params }),
  getById: (id: string) => apiCall(`/api/jobs/${id}`),
  getPopularSkills: (limit = 20) => apiCall('/api/jobs/skills/popular', { params: { limit } }),
}

export const candidateApi = {
  getProfile: () => apiCall('/api/candidate/profile'),
  updateProfile: (data: any) => apiCall('/api/candidate/profile', { method: 'PUT', body: JSON.stringify(data) }),
  addSkill: (skill: string) => apiCall('/api/candidate/skills', { method: 'POST', body: JSON.stringify({ skill }) }),
  removeSkill: (skill: string) => apiCall(`/api/candidate/skills/${skill}`, { method: 'DELETE' }),
  addExperience: (experience: any) => apiCall('/api/candidate/experience', { method: 'POST', body: JSON.stringify(experience) }),
  applyJob: (data: any) => apiCall('/api/candidate/apply', { method: 'POST', body: JSON.stringify(data) }),
  getMyApplications: (params: any) => apiCall('/api/candidate/applications', { params }),
  getRecommendations: () => apiCall('/api/candidate/recommendations'),
  withdrawApplication: (id: string) => apiCall(`/api/candidate/applications/${id}`, { method: 'DELETE' }),
}

export const employerApi = {
  getProfile: () => apiCall('/api/employer/profile'),
  updateProfile: (data: any) => apiCall('/api/employer/profile', { method: 'PUT', body: JSON.stringify(data) }),
  createJob: (data: any) => apiCall('/api/employer/jobs', { method: 'POST', body: JSON.stringify(data) }),
  updateJob: (id: string, data: any) => apiCall(`/api/employer/jobs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteJob: (id: string) => apiCall(`/api/employer/jobs/${id}`, { method: 'DELETE' }),
  getMyJobs: (params: any) => apiCall('/api/employer/jobs', { params }),
  getJobApplications: (id: string, params: any) => apiCall(`/api/employer/jobs/${id}/applications`, { params }),
  getApplications: () => apiCall('/api/employer/applications'),
  updateApplicationStatus: (id: string, data: any) => apiCall(`/api/employer/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
  searchCandidates: (params: any) => apiCall('/api/employer/candidates', { params }),
  getDashboardStats: () => apiCall('/api/employer/dashboard/stats'),
}

export const cvApi = {
  upload: (formData: FormData) => apiCall('/api/cv/upload', { method: 'POST', body: formData }),
  getMe: () => apiCall('/api/cv/me'),
  updateMe: (data: any) => apiCall('/api/cv/me', { method: 'PUT', body: JSON.stringify(data) }),
  reprocess: () => apiCall('/api/cv/reprocess', { method: 'POST' }),
  deleteMe: () => apiCall('/api/cv/me', { method: 'DELETE' }),
  getAiStatus: () => apiCall('/api/cv/ai-status'),
}

export const messageApi = {
  getConversations: (params: any) => apiCall('/api/messages/conversations', { params }),
  getRoomMessages: (roomId: string, params: any) => apiCall(`/api/messages/room/${roomId}`, { params }),
  getConversation: (userId: string, params: any) => apiCall(`/api/messages/conversation/${userId}`, { params }),
  getUnread: () => apiCall('/api/messages/unread'),
  getUnreadCount: () => apiCall('/api/messages/unread/count'),
  markAsRead: (id: string) => apiCall(`/api/messages/${id}/read`, { method: 'PATCH' }),
  markRoomAsRead: (roomId: string) => apiCall(`/api/messages/room/${roomId}/read`, { method: 'PATCH' }),
  editMessage: (id: string, content: string) => apiCall(`/api/messages/${id}`, { method: 'PATCH', body: JSON.stringify({ content }) }),
  deleteMessage: (id: string) => apiCall(`/api/messages/${id}`, { method: 'DELETE' }),
  addReaction: (id: string, emoji: string) => apiCall(`/api/messages/${id}/reactions`, { method: 'POST', body: JSON.stringify({ emoji }) }),
  removeReaction: (id: string, emoji: string) => apiCall(`/api/messages/${id}/reactions/${emoji}`, { method: 'DELETE' }),
  deleteConversation: (userId: string) => apiCall(`/api/messages/conversation/${userId}`, { method: 'DELETE' }),
}

export const adminApi = {
  getStats: () => apiCall('/api/admin/stats'),
  getUsers: (params: any) => apiCall('/api/admin/users', { params }),
  updateUserStatus: (id: string, data: any) => apiCall(`/api/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteUser: (id: string) => apiCall(`/api/admin/users/${id}`, { method: 'DELETE' }),
  getEmployers: (params: any) => apiCall('/api/admin/employers', { params }),
  updateEmployerStatus: (id: string, data: any) => apiCall(`/api/admin/employers/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
  getJobs: (params: any) => apiCall('/api/admin/jobs', { params }),
  updateJobStatus: (id: string, data: any) => apiCall(`/api/admin/jobs/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
  getApplications: (params: any) => apiCall('/api/admin/applications', { params }),
  getReports: (params: any) => apiCall('/api/admin/reports', { params }),
}

export const applicationApi = {
  getById: (id: string) => apiCall(`/api/applications/${id}`),
  addNote: (id: string, content: string) => apiCall(`/api/applications/${id}/notes`, { method: 'POST', body: JSON.stringify({ content }) }),
  scheduleInterview: (id: string, data: any) => apiCall(`/api/applications/${id}/interview`, { method: 'POST', body: JSON.stringify(data) }),
  acceptInterview: (id: string) => apiCall(`/api/applications/${id}/interview/accept`, { method: 'PATCH' }),
  addAttachment: (id: string, data: any) => apiCall(`/api/applications/${id}/attachments`, { method: 'POST', body: JSON.stringify(data) }),
  deleteAttachment: (id: string, attachmentId: string) => apiCall(`/api/applications/${id}/attachments/${attachmentId}`, { method: 'DELETE' }),
}
