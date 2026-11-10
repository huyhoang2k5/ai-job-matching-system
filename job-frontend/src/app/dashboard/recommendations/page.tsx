'use client'

import { useEffect, useState } from 'react'
import { useCandidateStore } from '@/store/candidateStore'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { JobRecommendation } from '@/types'
import { Award, Building2, FileText, MapPin, Sparkles, X } from 'lucide-react'

export default function RecommendationsPage() {
  const { user } = useAuthStore()
  const { recommendations, fetchRecommendations, applyJob, isLoading, isActionLoading } = useCandidateStore()
  const router = useRouter()
  const [selectedJob, setSelectedJob] = useState<JobRecommendation | null>(null)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')

  const getCompanyName = (job: JobRecommendation) => {
    return job.company || job.employer?.companyName || 'Doanh nghiệp'
  }

  useEffect(() => {
    if (user?.role !== 'candidate') {
      router.push('/dashboard')
      return
    }
    fetchRecommendations()
  }, [user, router, fetchRecommendations])

  if (user?.role !== 'candidate') return null

  const handleApply = async () => {
    if (!selectedJob) return
    await applyJob(selectedJob.id, coverLetter)
    setShowApplyModal(false)
    setCoverLetter('')
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-12 flex flex-col md:flex-row md:items-start justify-between gap-8">
        <div>
          <h1 className="text-[28px] font-bold text-foreground tracking-tight mb-2">Recommended for You</h1>
          <p className="text-muted font-normal text-lg max-w-2xl">
            Personalized job matches based on your professional profile and skills.
            We've analyzed thousands of openings to find your perfect fit.
          </p>
        </div>
        <div className="bg-white px-6 py-4 rounded-2xl border border-border flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center font-bold text-lg text-white">
            {recommendations.length}
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">Found</p>
            <p className="text-sm font-bold text-foreground">Active matches</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="loading-spinner h-12 w-12 mb-4"></div>
          <p className="text-muted text-sm font-medium">Analyzing opportunities...</p>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recommendations.map((job) => (
            <div key={job.id} className="card group flex flex-col border border-border bg-white overflow-hidden">
              <div className="aspect-[16/9] w-full bg-accent relative overflow-hidden">
                <img 
                  src={`https://images.unsplash.com/photo-${[
                    '1497215728101-856f4ea42174',
                    '1497366216548-37526070297c',
                    '1522071820081-009f0129c71c',
                    '1517245386807-bb43f82c33c4',
                    '1522202176988-66273c2fd55f'
                  ][job.id.charCodeAt(0) % 5]}?auto=format&fit=crop&q=80&w=800`} 
                  alt="" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-white/50">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-[11px] font-black text-foreground tracking-tighter">{job.matchScore}% MATCH</span>
                  </div>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-foreground mb-1 leading-tight group-hover:text-primary transition-colors">{job.title}</h3>
                  <p className="text-primary font-semibold text-sm">{getCompanyName(job)}</p>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  {job.skills.slice(0, 3).map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-accent text-foreground text-[10px] font-bold rounded-lg border border-border">
                      {skill}
                    </span>
                  ))}
                  {job.skills.length > 3 && (
                    <span className="px-2 py-1 text-[10px] font-bold text-muted">+{job.skills.length - 3}</span>
                  )}
                </div>

                <div className="space-y-4 mb-8 flex-1">
                  <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Why you match</p>
                  <div className="space-y-2">
                    {job.matchReasons.map((reason, i) => (
                      <div key={i} className="flex items-start gap-3 text-xs text-foreground font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                        {reason}
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    setSelectedJob(job)
                    setShowApplyModal(false)
                  }}
                  variant="primary"
                  className="w-full h-12 text-sm font-bold"
                >
                  View details
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-accent/30 rounded-3xl border border-dashed border-border">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-border">
            <svg className="w-10 h-10 text-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No recommendations yet</h3>
          <p className="text-muted text-sm mt-4 max-w-sm mx-auto font-medium leading-relaxed">
            Upload your CV so our system can analyze your skills and find the best job matches for you.
          </p>
          <Button 
            onClick={() => router.push('/dashboard/cv')}
            variant="primary"
            className="mt-8 px-10 h-12 text-sm font-bold"
          >
            Update your CV
          </Button>
        </div>
      )}

      {selectedJob && !showApplyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-slate-100 max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/10 flex items-center justify-center text-primary">
                  <Building2 className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-800 leading-tight mb-1">{selectedJob.title}</h2>
                  <p className="text-xs font-bold text-primary">{getCompanyName(selectedJob)}</p>
                </div>
              </div>
              <button onClick={() => setSelectedJob(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Match AI</p>
                  <p className="text-xs font-bold text-slate-700">{selectedJob.matchScore}% phù hợp</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hình thức</p>
                  <p className="text-xs font-bold text-slate-700 capitalize">{selectedJob.type}</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Địa điểm</p>
                  <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {selectedJob.location || 'Chưa cập nhật'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-primary" /> Lý do phù hợp
                </h4>
                <div className="flex flex-wrap gap-2 p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                  {selectedJob.matchReasons.map((reason, i) => (
                    <span key={i} className="px-3 py-1.5 bg-white text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100 shadow-sm">
                      {reason}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-400" /> Mô tả công việc
                </h4>
                <div className="p-4 bg-slate-50/50 rounded-2xl text-xs font-medium text-slate-600 leading-relaxed whitespace-pre-wrap border border-slate-100">
                  {selectedJob.description || 'Chưa có mô tả chi tiết.'}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-slate-400" /> Yêu cầu công việc
                </h4>
                <ul className="space-y-2.5 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  {(selectedJob.requirements?.length ? selectedJob.requirements : ['Chưa có yêu cầu chi tiết.']).map((req, i) => (
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
              <Button 
                onClick={() => setShowApplyModal(true)}
                variant="primary"
                className="flex-1 h-11 text-xs font-bold rounded-xl"
              >
                Ứng tuyển ngay
              </Button>
            </div>
          </div>
        </div>
      )}

      {showApplyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl p-6 shadow-2xl border border-slate-100">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-1">Nộp đơn ứng tuyển</h3>
            <p className="text-[11px] text-slate-400 font-semibold mb-6">
              Bạn đang ứng tuyển vị trí: <span className="font-bold text-slate-800">"{selectedJob?.title}"</span> tại <span className="text-primary font-bold">{selectedJob ? getCompanyName(selectedJob) : ''}</span>
            </p>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Thư giới thiệu</label>
                <textarea 
                  rows={6}
                  placeholder="Giới thiệu bản thân và lý do bạn phù hợp..."
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
                  disabled={isActionLoading}
                  className="flex-1 h-11 text-xs font-bold rounded-xl"
                >
                  {isActionLoading ? 'Đang nộp...' : 'Xác nhận nộp đơn'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
