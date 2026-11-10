'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useJobStore } from '@/store/jobStore'
import { useEmployerStore } from '@/store/employerStore'
import { useCandidateStore } from '@/store/candidateStore'
import { JobPost } from '@/types'
import { Button } from '@/components/ui/button'
import { useSearchParams } from 'next/navigation'
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Calendar, 
  Plus, 
  Trash2, 
  X, 
  Check, 
  Clock, 
  Award, 
  Building2, 
  FileText, 
  Sparkles,
  ChevronRight,
  Eye,
  DollarSign
} from 'lucide-react'

export default function JobsPage() {
  const { user } = useAuthStore()
  const { jobs, isLoading, fetchJobs } = useJobStore()
  const { createJob, deleteJob, isActionLoading } = useEmployerStore()
  const { applyJob } = useCandidateStore()
  const searchParams = useSearchParams()

  const [isCreating, setIsCreating] = useState(false)
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [failedLogos, setFailedLogos] = useState<Record<string, boolean>>({})
  
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    location: searchParams.get('location') || '',
    type: searchParams.get('type') || ''
  })

  useEffect(() => {
    setFilters({
      keyword: searchParams.get('keyword') || '',
      location: searchParams.get('location') || '',
      type: searchParams.get('type') || ''
    })
  }, [searchParams])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    skills: '',
    location: '',
    type: 'full-time',
    experienceLevel: 'mid-level',
    salaryMin: '',
    salaryMax: '',
    deadline: ''
  })

  useEffect(() => {
    fetchJobs(filters)
  }, [fetchJobs, filters])

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...formData,
      requirements: formData.requirements.split(',').map(r => r.trim()),
      skills: formData.skills.split(',').map(s => s.trim()),
      salary: {
        min: Number(formData.salaryMin),
        max: Number(formData.salaryMax),
        currency: 'VND'
      }
    }
    await createJob(payload)
    setIsCreating(false)
    fetchJobs(filters)
  }

  const handleApply = async () => {
    if (selectedJob) {
      await applyJob(selectedJob.id, coverLetter)
      setShowApplyModal(false)
      setCoverLetter('')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100'
      case 'rejected': return 'bg-rose-50 text-rose-600 border-rose-100'
      default: return 'bg-slate-50 text-slate-500 border-slate-100'
    }
  }

  const getCompanyAvatar = (job: JobPost) => {
    const company = job.employer?.companyName || 'Company'
    const normalized = company.toLowerCase()

    if (normalized.includes('momo')) return { label: 'MoMo', className: 'from-pink-500 to-fuchsia-600' }
    if (normalized.includes('vng')) return { label: 'VNG', className: 'from-sky-500 to-blue-700' }
    if (normalized.includes('techcombank')) return { label: 'TCB', className: 'from-red-500 to-rose-700' }
    if (normalized.includes('fpt')) return { label: 'FPT', className: 'from-orange-500 via-emerald-500 to-blue-600' }

    return { label: company.slice(0, 3).toUpperCase(), className: 'from-slate-600 to-slate-900' }
  }

  const getJobCoverImage = (job: JobPost) => {
    const photoIds = [
      '1497215728101-856f4ea42174',
      '1497366216548-37526070297c',
      '1522071820081-009f0129c71c',
      '1517245386807-bb43f82c33c4',
      '1522202176988-66273c2fd55f'
    ]
    const seed = (job.id || job.title || 'job').charCodeAt(0)
    return `https://images.unsplash.com/photo-${photoIds[seed % photoIds.length]}?auto=format&fit=crop&q=80&w=800`
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header section with gradient background */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">Cơ hội việc làm</h1>
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest leading-relaxed">
            {user?.role === 'employer' 
              ? 'Quản lý các tin tuyển dụng và tìm kiếm ứng viên phù hợp cho doanh nghiệp.'
              : 'Khám phá các cơ hội nghề nghiệp mới với gợi ý thông minh từ AI.'}
          </p>
        </div>
        {user?.role === 'employer' && (
          <Button
            onClick={() => setIsCreating(true)}
            size="lg"
            variant="primary"
            className="relative z-10 h-11 px-6 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4 mr-2" /> Đăng tin tuyển dụng
          </Button>
        )}
      </div>

      {/* Search Bar (Cohesive & Clean Layout) */}
      <div className="max-w-4xl mx-auto mb-16 bg-slate-50 border border-slate-200/60 p-2.5 rounded-2xl shadow-sm focus-within:shadow-md focus-within:bg-white focus-within:border-primary/30 transition-all flex flex-col md:flex-row items-center gap-3">
        <div className="flex-1 w-full flex items-center gap-2 px-4 border-b md:border-b-0 md:border-r border-slate-200/60 pb-2 md:pb-0">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Tìm kiếm vị trí, từ khóa..."
            className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
            value={filters.keyword}
            onChange={e => setFilters({...filters, keyword: e.target.value})}
          />
        </div>
        <div className="flex-1 w-full flex items-center gap-2 px-4 border-b md:border-b-0 md:border-r border-slate-200/60 pb-2 md:pb-0">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Địa điểm toàn quốc..."
            className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
            value={filters.location}
            onChange={e => setFilters({...filters, location: e.target.value})}
          />
        </div>
        <div className="w-full md:w-48 flex items-center gap-2 px-4">
          <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
          <select 
            className="w-full bg-transparent text-sm font-semibold cursor-pointer outline-none text-slate-700"
            value={filters.type}
            onChange={e => setFilters({...filters, type: e.target.value})}
          >
            <option value="">Hình thức làm việc</option>
            <option value="full-time">Toàn thời gian</option>
            <option value="part-time">Bán thời gian</option>
            <option value="remote">Từ xa</option>
            <option value="contract">Hợp đồng</option>
          </select>
        </div>
        <Button 
          onClick={() => fetchJobs(filters)}
          variant="primary"
          className="w-full md:w-auto h-11 px-6 rounded-xl text-xs font-bold shrink-0 shadow-md shadow-primary/10"
        >
          Tìm kiếm
        </Button>
      </div>

      {/* Jobs List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Đang tìm kiếm cơ hội tuyển dụng...</p>
        </div>
      ) : jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job, i) => (
            <div 
              key={job.id} 
              className="bg-white group rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200/60 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
              onClick={() => { setSelectedJob(job); setShowApplyModal(false); }}
            >
              <div>
                {/* Visual Banner */}
                <div className="aspect-[16/9] bg-slate-100 relative overflow-hidden p-4 flex items-end">
                  <img
                    src={getJobCoverImage(job)}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/5 to-transparent" />
                  
                  {/* Floating Logo/Initial */}
                  <div className="w-14 h-14 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-lg font-black text-slate-700 shrink-0 transform translate-y-6 relative z-10 overflow-hidden">
                    {job.employer?.logo && !failedLogos[job.id] ? (
                      <img
                        src={job.employer.logo}
                        alt=""
                        className="w-full h-full object-cover rounded-xl"
                        onError={() => setFailedLogos(prev => ({ ...prev, [job.id]: true }))}
                      />
                    ) : (
                      <span className={`w-full h-full bg-gradient-to-br ${getCompanyAvatar(job).className} text-white flex items-center justify-center text-[13px] font-black tracking-tight`}>
                        {getCompanyAvatar(job).label}
                      </span>
                    )}
                  </div>
                  
                  {/* Status indicator on top right */}
                  <div className="absolute top-4 right-4 z-10">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${getStatusColor(job.status)}`}>
                      <span className={`w-1 h-1 rounded-full ${job.status === 'approved' ? 'bg-emerald-500' : job.status === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'}`} />
                      {job.status === 'approved' ? 'Đã duyệt' : job.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                    </span>
                  </div>
                </div>

                <div className="p-5 pt-8">
                  <h3 className="text-base font-extrabold text-slate-800 group-hover:text-primary transition-colors leading-tight mb-1">{job.title}</h3>
                  <p className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-300" />
                    {job.employer?.companyName || 'Doanh nghiệp'}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200/50 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {job.location}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200/50 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {job.type === 'full-time' ? 'Toàn thời gian' : job.type === 'part-time' ? 'Bán thời gian' : job.type === 'remote' ? 'Từ xa' : job.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-50 bg-slate-50/10 flex items-center justify-between">
                <div className="flex items-center gap-1 text-slate-800 font-extrabold text-xs">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <span>Thỏa thuận</span>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedJob(job); }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all"
                  >
                    <Eye className="w-3 h-3" /> Chi tiết
                  </button>
                  {user?.role === 'employer' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); if(confirm('Bạn có chắc chắn muốn xóa tin tuyển dụng này?')) deleteJob(job.id) }}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-3xl bg-slate-50/30">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 text-slate-300">
            <Briefcase className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">Không tìm thấy tin tuyển dụng nào</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">Hãy thử thay đổi bộ lọc hoặc nhập từ khóa tìm kiếm khác.</p>
        </div>
      )}

      {/* Details Modal */}
      {selectedJob && !showApplyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-slate-100 max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white border border-slate-150 shadow-sm flex items-center justify-center overflow-hidden">
                  {selectedJob.employer?.logo && !failedLogos[selectedJob.id] ? (
                    <img
                      src={selectedJob.employer.logo}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={() => setFailedLogos(prev => ({ ...prev, [selectedJob.id]: true }))}
                    />
                  ) : (
                    <span className={`w-full h-full bg-gradient-to-br ${getCompanyAvatar(selectedJob).className} text-white flex items-center justify-center text-base font-black tracking-tight`}>
                      {getCompanyAvatar(selectedJob).label}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-800 leading-tight mb-1">{selectedJob.title}</h2>
                  <p className="text-xs font-bold text-primary flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-primary/70" />
                    {selectedJob.employer?.companyName}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedJob(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hình thức</p>
                  <p className="text-xs font-bold text-slate-700 capitalize">{selectedJob.type}</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kinh nghiệm</p>
                  <p className="text-xs font-bold text-slate-700 capitalize">{selectedJob.experienceLevel}</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Địa điểm</p>
                  <p className="text-xs font-bold text-slate-700 capitalize">{selectedJob.location}</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Đã ứng tuyển</p>
                  <p className="text-xs font-bold text-slate-700">{selectedJob.applicationCount || 0}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-400" /> Mô tả công việc
                </h4>
                <div className="p-4 bg-slate-50/50 rounded-2xl text-xs font-medium text-slate-600 leading-relaxed whitespace-pre-wrap border border-slate-100">
                  {selectedJob.description}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-slate-400" /> Yêu cầu công việc
                </h4>
                <ul className="space-y-2.5 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  {selectedJob.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs font-medium text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-slate-400" /> Kỹ năng yêu cầu
                </h4>
                <div className="flex flex-wrap gap-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  {selectedJob.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 bg-white text-slate-700 text-xs font-bold rounded-lg border border-slate-200/50 shadow-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 flex gap-3 bg-slate-50/30">
              <Button 
                onClick={() => setSelectedJob(null)}
                variant="outline"
                className="flex-1 h-11 text-xs font-bold rounded-xl border-slate-200"
              >
                Đóng
              </Button>
              {user?.role === 'candidate' && (
                <Button 
                  onClick={() => setShowApplyModal(true)}
                  variant="primary"
                  className="flex-1 h-11 text-xs font-bold rounded-xl"
                >
                  Ứng tuyển ngay
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl p-6 shadow-2xl border border-slate-100">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-2">
              Nộp đơn ứng tuyển
            </h3>
            <p className="text-[11px] text-slate-400 font-semibold mb-6">
              Bạn đang ứng tuyển vị trí: <span className="font-bold text-slate-800">"{selectedJob?.title}"</span> tại <span className="text-primary font-bold">{selectedJob?.employer?.companyName}</span>
            </p>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Thư giới thiệu (Cover Letter)</label>
                <textarea 
                  rows={6}
                  placeholder="Giới thiệu bản thân và lý do bạn là ứng viên phù hợp..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold placeholder:text-slate-400 outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all resize-none"
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={() => setShowApplyModal(false)}
                  variant="outline"
                  className="flex-1 h-11 text-xs font-bold rounded-xl border-slate-200"
                >
                  Hủy bỏ
                </Button>
                <Button 
                  onClick={handleApply}
                  variant="primary"
                  className="flex-1 h-11 text-xs font-bold rounded-xl"
                >
                  Xác nhận nộp đơn
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Job Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-slate-100 max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">Đăng tin tuyển dụng mới</h2>
              <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateJob} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Tiêu đề công việc</label>
                  <input 
                    required
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="Ví dụ: Lập trình viên React Native"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold placeholder:text-slate-400 outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Địa điểm làm việc</label>
                  <input 
                    required
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    placeholder="Ví dụ: Hà Nội, TP.HCM, Remote"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold placeholder:text-slate-400 outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Mô tả công việc</label>
                <textarea 
                  required
                  rows={5}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Mô tả cụ thể nhiệm vụ và trách nhiệm..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold placeholder:text-slate-400 outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Hình thức làm việc</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold outline-none cursor-pointer focus:bg-white transition-all text-slate-700"
                  >
                    <option value="full-time">Toàn thời gian</option>
                    <option value="part-time">Bán thời gian</option>
                    <option value="remote">Từ xa</option>
                    <option value="contract">Hợp đồng</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Hạn chót ứng tuyển</label>
                  <input 
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={e => setFormData({...formData, deadline: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold outline-none focus:bg-white transition-all text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Kỹ năng yêu cầu (phân cách bằng dấu phẩy)</label>
                <input 
                  required
                  value={formData.skills}
                  onChange={e => setFormData({...formData, skills: e.target.value})}
                  placeholder="React, Node.js, TypeScript..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold placeholder:text-slate-400 outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Yêu cầu công việc (phân cách bằng dấu phẩy)</label>
                <input 
                  required
                  value={formData.requirements}
                  onChange={e => setFormData({...formData, requirements: e.target.value})}
                  placeholder="Có 2 năm kinh nghiệm, Sử dụng Git..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold placeholder:text-slate-400 outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 bg-slate-50/10">
                <Button 
                  type="button"
                  onClick={() => setIsCreating(false)}
                  variant="outline"
                  className="flex-1 h-11 text-xs font-bold rounded-xl border-slate-200"
                >
                  Hủy bỏ
                </Button>
                <Button 
                  type="submit"
                  variant="primary"
                  className="flex-1 h-11 text-xs font-bold rounded-xl"
                >
                  Đăng tuyển
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
