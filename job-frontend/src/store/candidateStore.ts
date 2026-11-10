import { create } from 'zustand'
import { candidateApi } from '@/lib/api'
import { CandidateProfile, Application, JobPost, JobRecommendation } from '@/types'

interface CandidateState {
  profile: CandidateProfile | null
  applications: Application[]
  recommendations: JobRecommendation[]
  isLoading: boolean
  isActionLoading: boolean
  error: string | null
  totalApplications: number
  applicationPages: number
  currentApplicationPage: number
}

interface CandidateActions {
  fetchProfile: () => Promise<void>
  updateProfile: (data: any) => Promise<void>
  addSkill: (skill: string) => Promise<void>
  removeSkill: (skill: string) => Promise<void>
  addExperience: (experience: any) => Promise<void>
  applyJob: (jobId: string, coverLetter?: string) => Promise<void>
  fetchApplications: (page?: number, limit?: number) => Promise<void>
  fetchRecommendations: () => Promise<void>
  withdrawApplication: (id: string) => Promise<void>
  setError: (error: string | null) => void
}

export const useCandidateStore = create<CandidateState & CandidateActions>((set, get) => ({
  profile: null,
  applications: [],
  recommendations: [],
  isLoading: false,
  isActionLoading: false,
  error: null,
  totalApplications: 0,
  applicationPages: 0,
  currentApplicationPage: 1,

  fetchProfile: async () => {
    set({ isLoading: true, error: null })
    try {
      const response: any = await candidateApi.getProfile()
      if (response.success) {
        set({ profile: response.data.profile, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  updateProfile: async (data) => {
    set({ isActionLoading: true, error: null })
    try {
      const response: any = await candidateApi.updateProfile(data)
      if (response.success) {
        set({ profile: response.data.profile, isActionLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isActionLoading: false })
      throw error
    }
  },

  addSkill: async (skill) => {
    try {
      const response: any = await candidateApi.addSkill(skill)
      if (response.success) {
        const { profile } = get()
        if (profile) {
          set({ profile: { ...profile, skills: response.data.skills } })
        }
      }
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  removeSkill: async (skill) => {
    try {
      const response: any = await candidateApi.removeSkill(skill)
      if (response.success) {
        const { profile } = get()
        if (profile) {
          set({ profile: { ...profile, skills: response.data.skills } })
        }
      }
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  addExperience: async (experience) => {
    set({ isActionLoading: true, error: null })
    try {
      const response: any = await candidateApi.addExperience(experience)
      if (response.success) {
        const { profile } = get()
        if (profile) {
          set({ 
            profile: { ...profile, experience: response.data.experience },
            isActionLoading: false 
          })
        }
      }
    } catch (error: any) {
      set({ error: error.message, isActionLoading: false })
    }
  },

  applyJob: async (jobId, coverLetter) => {
    set({ isActionLoading: true, error: null })
    try {
      const response: any = await candidateApi.applyJob({ jobId, coverLetter })
      if (response.success) {
        set({ isActionLoading: false })
        // Refresh applications
        get().fetchApplications()
      }
    } catch (error: any) {
      set({ error: error.message, isActionLoading: false })
    }
  },

  fetchApplications: async (page = 1, limit = 10) => {
    set({ isLoading: true, error: null })
    try {
      const response: any = await candidateApi.getMyApplications({ page, limit })
      if (response.success) {
        set({
          applications: response.data.applications,
          totalApplications: response.data.pagination.total,
          applicationPages: response.data.pagination.pages,
          currentApplicationPage: response.data.pagination.current,
          isLoading: false
        })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  fetchRecommendations: async () => {
    set({ isLoading: true, error: null })
    try {
      const response: any = await candidateApi.getRecommendations()
      if (response.success) {
        set({ recommendations: response.data.recommendations, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  withdrawApplication: async (id) => {
    set({ isActionLoading: true, error: null })
    try {
      const response: any = await candidateApi.withdrawApplication(id)
      if (response.success) {
        set({ isActionLoading: false })
        // Refresh applications
        get().fetchApplications(get().currentApplicationPage)
      }
    } catch (error: any) {
      set({ error: error.message, isActionLoading: false })
    }
  },

  setError: (error) => set({ error })
}))
