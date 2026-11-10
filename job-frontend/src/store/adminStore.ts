import { create } from 'zustand'
import { adminApi } from '@/lib/api'
import { User, JobPost, EmployerProfile, Application, DashboardStats } from '@/types'

interface AdminState {
  stats: DashboardStats | null
  users: User[]
  employers: EmployerProfile[]
  jobs: JobPost[]
  applications: Application[]
  isLoading: boolean
  isActionLoading: boolean
  error: string | null
}

interface AdminActions {
  fetchStats: () => Promise<void>
  fetchUsers: (params?: any) => Promise<void>
  updateUserStatus: (id: string, isActive: boolean) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  fetchEmployers: (params?: any) => Promise<void>
  updateEmployerStatus: (id: string, isApproved: boolean, rejectionReason?: string) => Promise<void>
  fetchJobs: (params?: any) => Promise<void>
  updateJobStatus: (id: string, status: string, rejectionReason?: string) => Promise<void>
  fetchApplications: (params?: any) => Promise<void>
  setError: (error: string | null) => void
}

export const useAdminStore = create<AdminState & AdminActions>((set, get) => ({
  stats: null,
  users: [],
  employers: [],
  jobs: [],
  applications: [],
  isLoading: false,
  isActionLoading: false,
  error: null,

  fetchStats: async () => {
    set({ isLoading: true, error: null })
    try {
      const response: any = await adminApi.getStats()
      if (response.success && response.data) {
        set({ stats: (response.data.stats || response.data) as unknown as DashboardStats, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchUsers: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const response: any = await adminApi.getUsers(params)
      if (response.success) {
        set({ users: response.data.users, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  updateUserStatus: async (id, isActive) => {
    set({ isActionLoading: true })
    try {
      const response: any = await adminApi.updateUserStatus(id, { isActive })
      if (response.success) {
        const { users } = get()
        set({
          users: users.map(u => u.id === id ? { ...u, isActive } : u),
          isActionLoading: false
        })
      }
    } catch (error: any) {
      set({ error: error.message, isActionLoading: false })
    }
  },

  deleteUser: async (id) => {
    set({ isActionLoading: true })
    try {
      const response: any = await adminApi.deleteUser(id)
      if (response.success) {
        const { users } = get()
        set({
          users: users.filter(u => u.id !== id),
          isActionLoading: false
        })
      }
    } catch (error: any) {
      set({ error: error.message, isActionLoading: false })
    }
  },

  fetchEmployers: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const response: any = await adminApi.getEmployers(params)
      if (response.success) {
        set({ employers: response.data.employers, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  updateEmployerStatus: async (id, isApproved, rejectionReason) => {
    set({ isActionLoading: true })
    try {
      const response: any = await adminApi.updateEmployerStatus(id, { isApproved, rejectionReason })
      if (response.success) {
        const { employers } = get()
        set({
          employers: employers.map(e => e.id === id ? { ...e, isApproved, rejectionReason } : e),
          isActionLoading: false
        })
      }
    } catch (error: any) {
      set({ error: error.message, isActionLoading: false })
    }
  },

  fetchJobs: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const response: any = await adminApi.getJobs(params)
      if (response.success) {
        set({ jobs: response.data.jobs, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  updateJobStatus: async (id, status, rejectionReason) => {
    set({ isActionLoading: true })
    try {
      const response: any = await adminApi.updateJobStatus(id, { status, rejectionReason })
      if (response.success) {
        const { jobs } = get()
        set({
          jobs: jobs.map(j => j.id === id ? { ...j, status, rejectionReason } : j) as JobPost[],
          isActionLoading: false
        })
      }
    } catch (error: any) {
      set({ error: error.message, isActionLoading: false })
    }
  },

  fetchApplications: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const response: any = await adminApi.getApplications(params)
      if (response.success) {
        set({ applications: response.data.applications, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  setError: (error) => set({ error })
}))
