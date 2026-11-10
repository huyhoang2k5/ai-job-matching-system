import { create } from 'zustand'
import { cvApi } from '@/lib/api'
import { CVParsedData } from '@/types'

interface CVState {
  cvUrl: string | null
  cvParsed: CVParsedData | null
  aiServiceAvailable: boolean
  isUploading: boolean
  isProcessing: boolean
  isLoading: boolean
  error: string | null
}

interface CVActions {
  fetchMyCv: () => Promise<void>
  uploadCv: (file: File) => Promise<void>
  updateCvData: (data: Partial<CVParsedData>) => Promise<void>
  reprocessCv: () => Promise<void>
  deleteCv: () => Promise<void>
  checkAiStatus: () => Promise<void>
  setError: (error: string | null) => void
}

export const useCvStore = create<CVState & CVActions>((set) => ({
  cvUrl: null,
  cvParsed: null,
  aiServiceAvailable: true,
  isUploading: false,
  isProcessing: false,
  isLoading: false,
  error: null,

  fetchMyCv: async () => {
    set({ isLoading: true, error: null })
    try {
      const response: any = await cvApi.getMe()
      if (response.success) {
        set({
          cvUrl: response.data.cvUrl,
          cvParsed: response.data.cvParsed,
          isLoading: false
        })
      }
    } catch (error: any) {
      // 404 is expected if user hasn't uploaded CV
      if (error.message.includes('not found')) {
        set({ cvUrl: null, cvParsed: null, isLoading: false })
      } else {
        set({ error: error.message, isLoading: false })
      }
    }
  },

  uploadCv: async (file: File) => {
    set({ isUploading: true, error: null })
    try {
      const formData = new FormData()
      formData.append('cv', file)
      const response: any = await cvApi.upload(formData)
      if (response.success) {
        set({
          cvUrl: response.data.cvUrl,
          cvParsed: response.data.cvParsed,
          isUploading: false
        })
      }
    } catch (error: any) {
      set({ error: error.message, isUploading: false })
    }
  },

  updateCvData: async (data) => {
    set({ isProcessing: true, error: null })
    try {
      const response: any = await cvApi.updateMe(data)
      if (response.success) {
        set({ cvParsed: response.data.cvParsed, isProcessing: false })
      }
    } catch (error: any) {
      set({ error: error.message, isProcessing: false })
    }
  },

  reprocessCv: async () => {
    set({ isProcessing: true, error: null })
    try {
      const response: any = await cvApi.reprocess()
      if (response.success) {
        set({ cvParsed: response.data.cvParsed, isProcessing: false })
      }
    } catch (error: any) {
      set({ error: error.message, isProcessing: false })
    }
  },

  deleteCv: async () => {
    set({ isLoading: true, error: null })
    try {
      const response: any = await cvApi.deleteMe()
      if (response.success) {
        set({ cvUrl: null, cvParsed: null, isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  checkAiStatus: async () => {
    try {
      const response: any = await cvApi.getAiStatus()
      if (response.success) {
        set({ aiServiceAvailable: response.data.aiServiceAvailable })
      }
    } catch (error) {
      set({ aiServiceAvailable: false })
    }
  },

  setError: (error) => set({ error })
}))
