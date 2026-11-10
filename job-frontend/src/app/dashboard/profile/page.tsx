'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useCandidateStore } from '@/store/candidateStore'
import { useEmployerStore } from '@/store/employerStore'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const { 
    profile: candidateProfile, 
    fetchProfile: fetchCandidateProfile, 
    updateProfile: updateCandidateProfile,
    isActionLoading: isCandidateLoading 
  } = useCandidateStore()
  
  const { 
    profile: employerProfile, 
    fetchProfile: fetchEmployerProfile, 
    updateProfile: updateEmployerProfile,
    isActionLoading: isEmployerLoading 
  } = useEmployerStore()

  const [isEditing, setIsEditing] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    bio: '',
    skills: [] as string[],
    companyName: '',
    website: '',
    industry: 'Technology',
    companySize: '1-10',
    description: ''
  })

  useEffect(() => {
    if (user?.role === 'candidate') {
      fetchCandidateProfile()
    } else if (user?.role === 'employer') {
      fetchEmployerProfile()
    }
  }, [user, fetchCandidateProfile, fetchEmployerProfile])

  useEffect(() => {
    const profile = user?.role === 'candidate' ? candidateProfile : employerProfile
    if (profile) {
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        location: profile.location || '',
        bio: (profile as any).bio || '',
        skills: (profile as any).skills || [],
        companyName: (profile as any).companyName || '',
        website: (profile as any).website || '',
        industry: (profile as any).industry || 'Technology',
        companySize: (profile as any).companySize || '1-10',
        description: (profile as any).description || ''
      })
    }
  }, [candidateProfile, employerProfile, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (user?.role === 'candidate') {
        await updateCandidateProfile({
          location: formData.location,
          bio: formData.bio,
          skills: formData.skills
        })
      } else {
        await updateEmployerProfile({
          companyName: formData.companyName,
          website: formData.website,
          location: formData.location,
          description: formData.description,
          industry: formData.industry,
          companySize: formData.companySize
        })
      }
      setSaveSuccess(true)
      setIsEditing(false)
      toast.success('Profile updated successfully')
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile')
    }
  }

  const isLoading = isCandidateLoading || isEmployerLoading

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-12">
        <h1 className="text-[28px] font-bold text-foreground tracking-tight mb-2">Personal Information</h1>
        <p className="text-muted font-normal text-lg">
          Manage your professional details and how others see you on the platform.
        </p>
      </div>

      {saveSuccess && (
        <div className="mb-10 p-6 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-center gap-4 animate-fade-in">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="font-bold text-sm uppercase tracking-wider">Profile updated successfully</span>
        </div>
      )}

      <div className="card border border-border bg-white shadow-sm overflow-hidden !p-0">
        <div className="bg-accent/30 px-10 py-12 border-b border-border flex flex-col md:flex-row md:items-center gap-10">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full bg-primary flex items-center justify-center text-white text-4xl font-bold shadow-md">
              {formData.name?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase()}
            </div>
            <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-foreground hover:bg-accent transition-all border border-border">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {user?.role === 'employer' ? formData.companyName || user.name : formData.name || user?.name}
            </h3>
            <div className="flex items-center gap-4">
              <span className="badge bg-white text-foreground border-border shadow-sm">
                {user?.role}
              </span>
              <span className="text-muted text-sm font-medium">{formData.email || user?.email}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 md:p-14 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {user?.role === 'employer' ? (
              <>
                <div className="space-y-3">
                  <label className="form-label ml-1">Company Name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    disabled={!isEditing}
                    className="input w-full"
                    placeholder="e.g. Acme Corp"
                  />
                </div>
                <div className="space-y-3">
                  <label className="form-label ml-1">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    disabled={!isEditing}
                    className="input w-full"
                    placeholder="https://example.com"
                  />
                </div>
                <div className="space-y-3">
                  <label className="form-label ml-1">Industry</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({...formData, industry: e.target.value})}
                    disabled={!isEditing}
                    className="input w-full appearance-none"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="form-label ml-1">Company Size</label>
                  <select
                    value={formData.companySize}
                    onChange={(e) => setFormData({...formData, companySize: e.target.value})}
                    disabled={!isEditing}
                    className="input w-full appearance-none"
                  >
                    <option value="1-10">1-10 Employees</option>
                    <option value="11-50">11-50 Employees</option>
                    <option value="51-200">51-200 Employees</option>
                    <option value="201-500">201-500 Employees</option>
                    <option value="501-1000">501-1000 Employees</option>
                    <option value="1000+">1000+ Employees</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="form-label ml-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    disabled={!isEditing}
                    className="input w-full"
                    placeholder="City, Country"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <label className="form-label ml-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    disabled={!isEditing}
                    className="input w-full"
                    placeholder="City, Country"
                  />
                </div>
                <div className="space-y-3">
                  <label className="form-label ml-1">Skills (comma separated)</label>
                  <input
                    type="text"
                    value={formData.skills.join(', ')}
                    onChange={(e) => setFormData({...formData, skills: e.target.value.split(',').map(s => s.trim())})}
                    disabled={!isEditing}
                    className="input w-full"
                    placeholder="React, Node.js, Design..."
                  />
                </div>
              </>
            )}
          </div>

          <div className="space-y-3">
            <label className="form-label ml-1">
              {user?.role === 'employer' ? 'Company Description' : 'Short Bio'}
            </label>
            <textarea
              rows={5}
              value={user?.role === 'employer' ? formData.description : formData.bio}
              onChange={(e) => setFormData({...formData, [user?.role === 'employer' ? 'description' : 'bio']: e.target.value})}
              disabled={!isEditing}
              className="input w-full !rounded-2xl resize-none py-4"
              placeholder={user?.role === 'employer' ? 'Tell us about your company mission...' : 'Tell us about yourself and your career goals...'}
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-8 border-t border-border">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="px-8 h-12 text-sm font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  variant="primary"
                  className="px-10 h-12 text-sm font-bold"
                >
                  {isLoading ? 'Saving...' : 'Save changes'}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                onClick={() => setIsEditing(true)}
                variant="primary"
                className="px-10 h-12 text-sm font-bold"
              >
                Edit profile
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
