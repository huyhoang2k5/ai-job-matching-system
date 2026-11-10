'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useCandidateStore } from '@/store/candidateStore'
import { useEmployerStore } from '@/store/employerStore'
import { Application } from '@/types'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Search, 
  Sparkles, 
  Eye, 
  Check, 
  X, 
  Calendar, 
  MapPin, 
  User, 
  Mail, 
  FileText, 
  Briefcase, 
  MessageSquare,
  ChevronRight,
  FileCheck,
  Building2
} from 'lucide-react'

export default function ApplicationsPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  
  const { applications: candidateApps, fetchApplications } = useCandidateStore()
  const { 
    jobApplications: employerApps, 
    fetchEmployerApplications, 
    updateApplicationStatus, 
    searchResults, 
    searchCandidates, 
    isActionLoading: employerLoading 
  } = useEmployerStore()
  
  const [activeTab, setActiveTab] = useState<'applications' | 'search'>('applications')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState<Application['status']>('pending')

  useEffect(() => {
    if (user?.role === 'candidate') {
      fetchApplications()
    } else if (user?.role === 'employer') {
      if (activeTab === 'applications') {
        fetchEmployerApplications()
      } else if (activeTab === 'search') {
        searchCandidates({ q: searchQuery })
      }
    }
  }, [user, fetchApplications, fetchEmployerApplications, activeTab, searchQuery, searchCandidates])

  const handleUpdateStatus = async () => {
    if (selectedApp) {
      await updateApplicationStatus(selectedApp.id, newStatus, rejectionReason)
      setShowStatusModal(false)
      setRejectionReason('')
      setSelectedApp(null)
    }
  }

  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'accepted': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
      case 'rejected': return 'bg-rose-50 text-rose-600 border-rose-100'
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100'
      case 'shortlisted': return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'reviewing': return 'bg-purple-50 text-purple-600 border-purple-100'
      default: return 'bg-slate-50 text-slate-600 border-slate-100'
    }
  }

  const apps = user?.role === 'employer' ? employerApps : candidateApps
  const getViewableCvUrl = (app: Application) => {
    const cvUrl = app.cvUrl
    if (!cvUrl) return null

    // Old seeded demo data points to a Cloudinary file that no longer exists.
    // Keep demo applications useful by opening the CV file for the actual candidate.
    if (cvUrl.includes('res.cloudinary.com/dqaku0n0q/image/upload/v1717200000/sample_cv.pdf')) {
      const candidateEmail = app.candidate?.email
      const seededCvByEmail: Record<string, string> = {
        'dangquochuy@gmail.com': 'http://localhost:3001/uploads/cvs/dangquochuy.html',
        'doannguyenbao@gmail.com': 'http://localhost:3001/uploads/cvs/doannguyenbao.html',
        'lenguyenhuyhoang@gmail.com': 'http://localhost:3001/uploads/cvs/lenguyenhuyhoang.html',
      }

      return candidateEmail ? seededCvByEmail[candidateEmail] || null : null
    }

    return cvUrl
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header section with gradient background */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">Hồ sơ & Ứng tuyển</h1>
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest leading-relaxed">
            {user?.role === 'employer' 
              ? 'Quản lý quy trình tuyển dụng và tìm kiếm ứng viên tài năng.'
              : 'Theo dõi tiến độ các đơn ứng tuyển và phản hồi từ nhà tuyển dụng.'}
          </p>
        </div>
        
        {user?.role === 'employer' && (
          <div className="relative z-10 flex p-1 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 w-fit shadow-inner">
            <button 
              onClick={() => setActiveTab('applications')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'applications' ? 'bg-[#00b14f] text-white shadow-md' : 'text-white/70 hover:text-white'}`}
            >
              Hồ sơ ứng tuyển
            </button>
            <button 
              onClick={() => setActiveTab('search')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'search' ? 'bg-[#00b14f] text-white shadow-md' : 'text-white/70 hover:text-white'}`}
            >
              Tìm kiếm ứng viên
            </button>
          </div>
        )}
      </div>

      {activeTab === 'search' && user?.role === 'employer' ? (
        <div className="space-y-10">
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex items-center bg-slate-50 border border-slate-200/60 shadow-sm focus-within:shadow-md focus-within:border-[#00b14f]/40 focus-within:bg-white transition-all rounded-2xl p-2">
              <div className="flex-1 px-4 flex items-center gap-3">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Tìm theo tên, kỹ năng, vị trí..."
                  className="w-full bg-transparent text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                onClick={() => searchCandidates({ q: searchQuery })}
                variant="primary"
                className="h-11 px-6 rounded-xl text-xs font-bold shadow-md shadow-primary/20 hover:shadow-lg"
              >
                Tìm kiếm
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((candidate) => (
              <div key={candidate.id} className="bg-white group rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200/60 transition-all duration-300 flex flex-col justify-between overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xl font-black text-white shadow-sm shrink-0">
                      {typeof candidate.userId !== 'string' ? candidate.userId?.name?.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-800 group-hover:text-primary transition-colors leading-tight mb-1.5">
                        {typeof candidate.userId !== 'string' ? candidate.userId?.name : 'Ứng viên'}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {candidate.location || 'Chưa cập nhật'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Kỹ năng nổi bật</span>
                      <span className="text-primary flex items-center gap-0.5"><Sparkles className="w-3 h-3" /> CV Khớp</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {candidate.skills && candidate.skills.length > 0 ? (
                        candidate.skills.slice(0, 4).map((skill, i) => (
                          <span key={i} className="px-2.5 py-1 bg-white text-slate-600 text-[10px] font-bold rounded-lg border border-slate-200/50">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Chưa cập nhật kỹ năng</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-6 pt-0 border-t border-slate-50 bg-slate-50/20">
                  <Button 
                    onClick={() => router.push(`/dashboard/profile/${candidate.id}`)}
                    variant="outline"
                    className="w-full h-10 text-xs font-bold rounded-xl border-slate-200 hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-white group-hover:border-primary"
                  >
                    Xem chi tiết hồ sơ <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          {apps.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {user?.role === 'employer' ? 'Ứng viên' : 'Vị trí ứng tuyển'}
                    </th>
                    <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Độ phù hợp (AI Match)</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày nộp</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {apps.map((app) => (
                    <tr key={app.id} className="group hover:bg-gradient-to-r hover:from-slate-50/80 hover:to-transparent transition-all duration-200">
                      <td className="px-6 py-4">
                        {user?.role === 'employer' ? (
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm font-black text-white shadow-sm shrink-0">
                              {app.candidate?.name?.charAt(0).toUpperCase() || 'C'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{app.candidate?.name}</p>
                              <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                                <Mail className="w-3.5 h-3.5 text-slate-300" />
                                {app.candidate?.email}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00b14f]/80 to-[#007a36]/90 flex items-center justify-center text-white shadow-sm shrink-0">
                              <Briefcase className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{app.job?.title || (app as any).jobId?.title}</p>
                              <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                                <Building2 className="w-3.5 h-3.5 text-slate-300" />
                                {app.job?.employerId?.companyName || app.job?.company || (app as any).jobId?.employerId?.companyName}
                              </p>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                          (app.matchScore ?? 0) >= 80 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                            : (app.matchScore ?? 0) >= 60 
                            ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                            : 'bg-slate-50 text-slate-500 border border-slate-100'
                        }`}>
                          <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                          {app.matchScore ?? 0}% Match
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          app.status === 'accepted' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          app.status === 'rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                          app.status === 'reviewing' || app.status === 'viewed' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                          'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            app.status === 'accepted' ? 'bg-emerald-500' :
                            app.status === 'rejected' ? 'bg-rose-500' :
                            app.status === 'reviewing' || app.status === 'viewed' ? 'bg-blue-500' :
                            'bg-amber-500 animate-pulse'
                          }`} />
                          {app.status === 'accepted' ? 'Trúng tuyển' : 
                           app.status === 'rejected' ? 'Từ chối' : 
                           app.status === 'reviewing' ? 'Đang xem' :
                           app.status === 'viewed' ? 'Đã xem' :
                           'Chờ phản hồi'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(app.appliedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setSelectedApp(app)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all"
                          >
                            <Eye className="w-3 h-3" /> Chi tiết
                          </button>
                          {user?.role === 'employer' && (
                            <button 
                              onClick={() => { setSelectedApp(app); setNewStatus(app.status); setShowStatusModal(true); }}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[10px] font-bold text-white bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20 transition-all"
                            >
                              Cập nhật
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 text-slate-300">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">Không tìm thấy hồ sơ nào</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Hồ sơ ứng tuyển sẽ xuất hiện ở đây khi ứng viên bắt đầu ứng tuyển các vị trí.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedApp && !showStatusModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileCheck className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">Chi tiết đơn ứng tuyển</h2>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Ngày nộp: {new Date(selectedApp.appliedAt).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
              <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Ứng viên</p>
                  <p className="text-sm font-bold text-slate-800">{selectedApp.candidate?.name || 'N/A'}</p>
                  <p className="text-[11px] font-bold text-primary mt-0.5">{selectedApp.candidate?.email}</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Vị trí ứng tuyển</p>
                  <p className="text-sm font-bold text-slate-800">{selectedApp.job?.title || (selectedApp as any).jobId?.title || 'N/A'}</p>
                  <p className="text-[11px] font-bold text-slate-500 mt-0.5">{selectedApp.job?.employerId?.companyName || selectedApp.job?.company || (selectedApp as any).jobId?.employerId?.companyName}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-400" /> Thư xin việc (Cover Letter)
                </h4>
                <div className="p-4 bg-slate-50/60 rounded-2xl text-xs font-medium text-slate-600 leading-relaxed whitespace-pre-wrap border border-slate-100">
                  {selectedApp.coverLetter || 'Không đính kèm thư xin việc.'}
                </div>
              </div>

              {selectedApp.matchReasons && selectedApp.matchReasons.length > 0 && (
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-500" /> Lý do phù hợp (AI Match)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.matchReasons.map((reason, i) => (
                      <span key={i} className="px-3 py-1.5 bg-emerald-50/50 text-emerald-700 text-[11px] font-semibold rounded-lg border border-emerald-100 shadow-sm flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 flex gap-3 bg-slate-50/30">
              {getViewableCvUrl(selectedApp) && (
                <Button 
                  onClick={() => window.open(getViewableCvUrl(selectedApp)!, '_blank', 'noopener,noreferrer')}
                  variant="primary"
                  className="flex-1 h-11 text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" /> Xem CV của ứng viên
                </Button>
              )}
              <Button 
                onClick={() => {
                  const chatTargetId = user?.role === 'employer' 
                    ? selectedApp.userId 
                    : (selectedApp.job?.employerId?.userId || (selectedApp as any).jobId?.employerId?.userId)
                  const partnerName = user?.role === 'employer'
                    ? selectedApp.candidate?.name
                    : (selectedApp.job?.employerId?.companyName || selectedApp.job?.company || (selectedApp as any).jobId?.employerId?.companyName)
                  if (chatTargetId) {
                    router.push(`/dashboard/messages?userId=${chatTargetId}${partnerName ? `&name=${encodeURIComponent(partnerName)}` : ''}`)
                  }
                }}
                variant="outline"
                className="flex-1 h-11 text-xs font-bold rounded-xl border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-slate-400" /> Nhắn tin trao đổi
              </Button>
              <Button 
                onClick={() => setSelectedApp(null)}
                variant="outline"
                className="h-11 px-6 text-xs font-bold rounded-xl border-slate-200"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedApp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-100">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">
              Cập nhật trạng thái tuyển dụng
            </h3>
            <p className="text-[11px] text-slate-400 font-semibold mb-6">
              Bạn đang cập nhật tiến trình ứng tuyển của: <span className="font-bold text-slate-800">"{selectedApp.candidate?.name}"</span>
            </p>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2.5">Trạng thái hồ sơ</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { key: 'reviewing', text: 'Đang xem xét' },
                    { key: 'shortlisted', text: 'Phù hợp' },
                    { key: 'accepted', text: 'Trúng tuyển' },
                    { key: 'rejected', text: 'Từ chối' }
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setNewStatus(item.key as any)}
                      className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                        newStatus === item.key 
                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' 
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {item.text}
                    </button>
                  ))}
                </div>
              </div>

              {newStatus === 'rejected' && (
                <div className="animate-fade-in space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Phản hồi lý do (Không bắt buộc)</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold placeholder:text-slate-400 outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all resize-none"
                    placeholder="Nhập lý do từ chối cụ thể để phản hồi cho ứng viên..."
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={() => setShowStatusModal(false)}
                  variant="outline"
                  className="flex-1 h-11 text-xs font-bold rounded-xl border-slate-200"
                >
                  Hủy bỏ
                </Button>
                <Button 
                  onClick={handleUpdateStatus}
                  disabled={employerLoading}
                  variant="primary"
                  className="flex-1 h-11 text-xs font-bold rounded-xl"
                >
                  {employerLoading ? 'Đang cập nhật...' : 'Xác nhận'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
