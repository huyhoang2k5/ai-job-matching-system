'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useCandidateStore } from '@/store/candidateStore'
import { useEmployerStore } from '@/store/employerStore'
import { useMessageStore } from '@/store/messageStore'
import { useJobStore } from '@/store/jobStore'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'

const sparkData = [
  { name: 'T1', v: 12 }, { name: 'T2', v: 19 }, { name: 'T3', v: 14 },
  { name: 'T4', v: 25 }, { name: 'T5', v: 22 }, { name: 'T6', v: 30 },
  { name: 'T7', v: 28 }
]

const activityChartData = [
  { name: 'Tháng 1', applications: 4, views: 12 },
  { name: 'Tháng 2', applications: 8, views: 18 },
  { name: 'Tháng 3', applications: 12, views: 24 },
  { name: 'Tháng 4', applications: 15, views: 32 },
  { name: 'Tháng 5', applications: 20, views: 40 },
  { name: 'Tháng 6', applications: 18, views: 35 },
]

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { profile: candidateProfile, applications: candidateApps, fetchApplications: fetchCandidateApps, fetchProfile: fetchCandidateProfile } = useCandidateStore()
  const { stats: employerStats, myJobs: employerJobs, fetchStats: fetchEmployerStats, fetchMyJobs } = useEmployerStore()
  const { unreadCount } = useMessageStore()
  const { jobs } = useJobStore()
  const [mounted, setMounted] = useState(false)
  const [greeting, setGreeting] = useState('Xin chào')

  useEffect(() => {
    setMounted(true)
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Chào buổi sáng')
    else if (hour < 18) setGreeting('Chào buổi chiều')
    else setGreeting('Chào buổi tối')
  }, [])

  useEffect(() => {
    if (user?.role === 'candidate') {
      fetchCandidateApps()
      fetchCandidateProfile()
    } else if (user?.role === 'employer') {
      fetchEmployerStats()
      fetchMyJobs()
    }
  }, [user, fetchCandidateApps, fetchCandidateProfile, fetchEmployerStats, fetchMyJobs])

  const pendingApps = candidateApps.filter(a => a.status === 'pending').length
  const acceptedApps = candidateApps.filter(a => a.status === 'accepted').length
  const reviewingApps = candidateApps.filter(a => a.status === 'reviewing' || a.status === 'viewed').length

  // Employer stats
  const employerActiveJobs = employerStats?.jobs?.active || 0
  const employerTotalApps = employerStats?.applications?.total || 0
  const employerPendingApps = employerStats?.applications?.pending || 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#00b14f] via-[#009a44] to-[#007a36] p-8 md:p-12 mb-10 shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-black border border-white/20">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{greeting}</p>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  {user?.name}!
                </h1>
              </div>
            </div>
            <p className="text-white/80 text-sm font-medium max-w-lg mt-2 leading-relaxed">
              {user?.role === 'employer' 
                ? 'Quản lý tin tuyển dụng, theo dõi ứng viên và tìm kiếm nhân tài phù hợp nhất cho đội ngũ của bạn.'
                : 'Theo dõi tiến trình ứng tuyển, khám phá cơ hội nghề nghiệp mới và nâng cao hồ sơ cá nhân với AI.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/messages">
              <Button className="h-11 px-6 bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 rounded-xl font-bold text-xs uppercase tracking-wider">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                Tin nhắn {unreadCount > 0 && <span className="ml-2 bg-white text-primary text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">{unreadCount}</span>}
              </Button>
            </Link>
            <Link href={user?.role === 'employer' ? '/dashboard/jobs' : '/dashboard/cv'}>
              <Button className="h-11 px-6 bg-white text-[#00b14f] hover:bg-white/90 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg">
                {user?.role === 'employer' ? '+ Đăng tin mới' : 'Cập nhật CV'}
              </Button>
            </Link>
          </div>
        </div>
        {/* Today widget */}
        <div className="relative z-10 mt-6 flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20">
            <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span className="text-white/90 text-xs font-bold">
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            <span className="text-white/90 text-xs font-bold capitalize">{user?.role === 'employer' ? 'Nhà tuyển dụng' : user?.role === 'admin' ? 'Quản trị viên' : 'Ứng viên'}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {user?.role === 'candidate' ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Applications Card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Tổng</span>
              </div>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">{candidateApps.length}</h3>
              <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Đơn ứng tuyển</p>
            </div>

            {/* Pending Card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="text-[10px] font-black text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Chờ</span>
              </div>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">{pendingApps}</h3>
              <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Đang chờ phản hồi</p>
            </div>

            {/* Reviewing Card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </div>
                <span className="text-[10px] font-black text-purple-500 bg-purple-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Đang xem</span>
              </div>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">{reviewingApps}</h3>
              <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">NTD đang xem xét</p>
            </div>

            {/* Messages Card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Thành công</span>
              </div>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">{acceptedApps}</h3>
              <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Được chấp nhận</p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activity Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Hoạt động ứng tuyển</h2>
                  <p className="text-[11px] text-slate-400 font-semibold mt-1">Thống kê 6 tháng gần nhất</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#00b14f]" />
                    <span className="text-[10px] font-bold text-slate-400">Ứng tuyển</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                    <span className="text-[10px] font-bold text-slate-400">Lượt xem</span>
                  </div>
                </div>
              </div>
              <div className="h-64">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityChartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00b14f" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#00b14f" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 'bold' }} />
                      <Area type="monotone" dataKey="applications" name="Ứng tuyển" stroke="#00b14f" fill="url(#colorApps)" strokeWidth={2.5} />
                      <Area type="monotone" dataKey="views" name="Lượt xem" stroke="#3b82f6" fill="url(#colorViews)" strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full bg-slate-50 rounded-xl animate-pulse" />
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Application Progress */}
              <div className="bg-white rounded-2xl border border-slate-100 p-7 shadow-sm">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-5">Tiến độ ứng tuyển</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-500">Đang chờ</span>
                      <span className="text-[11px] font-black text-amber-500">{pendingApps}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700" style={{ width: `${candidateApps.length > 0 ? (pendingApps / candidateApps.length) * 100 : 0}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-500">Đang xem xét</span>
                      <span className="text-[11px] font-black text-purple-500">{reviewingApps}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-400 to-purple-500 rounded-full transition-all duration-700" style={{ width: `${candidateApps.length > 0 ? (reviewingApps / candidateApps.length) * 100 : 0}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-500">Được nhận</span>
                      <span className="text-[11px] font-black text-emerald-500">{acceptedApps}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700" style={{ width: `${candidateApps.length > 0 ? (acceptedApps / candidateApps.length) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-7 text-white shadow-xl">
                <div className="inline-flex items-center px-3 py-1 bg-[#00b14f] rounded-full text-[9px] font-black uppercase tracking-widest mb-4 shadow-lg shadow-emerald-500/20">
                  AI Powered
                </div>
                <h3 className="text-lg font-bold tracking-tight mb-2">Gợi ý việc làm AI</h3>
                <p className="text-white/50 text-xs font-medium mb-6 leading-relaxed">
                  Hệ thống AI đã phân tích hồ sơ của bạn và tìm thấy các vị trí phù hợp nhất.
                </p>
                <Link href="/dashboard/recommendations">
                  <Button className="w-full h-11 bg-[#00b14f] hover:bg-[#009a44] text-white rounded-xl font-bold text-xs shadow-lg">
                    Xem gợi ý ngay →
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Applications */}
          <div className="mt-8 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Đơn ứng tuyển gần đây</h2>
                <p className="text-[11px] text-slate-400 font-semibold mt-1">Theo dõi trạng thái các đơn ứng tuyển</p>
              </div>
              <Link href="/dashboard/applications">
                <Button variant="outline" className="h-9 text-xs font-bold rounded-xl">Xem tất cả</Button>
              </Link>
            </div>
            {candidateApps.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {candidateApps.slice(0, 5).map((app) => (
                  <div key={app.id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                    <div className="flex items-center gap-5">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm group-hover:bg-[#00b14f]/10 group-hover:text-[#00b14f] transition-colors">
                        {typeof app.jobId !== 'string' && typeof app.jobId.employerId !== 'string' ? (app.jobId.employerId as any)?.companyName?.charAt(0) : 'J'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{typeof app.jobId !== 'string' ? app.jobId.title : 'Vị trí tuyển dụng'}</p>
                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{typeof app.jobId !== 'string' && typeof app.jobId.employerId !== 'string' ? (app.jobId.employerId as any)?.companyName : 'Doanh nghiệp'}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                      app.status === 'accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      app.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      app.status === 'reviewing' || app.status === 'viewed' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {app.status === 'pending' ? 'Chờ phản hồi' : app.status === 'accepted' ? 'Đã nhận' : app.status === 'rejected' ? 'Từ chối' : app.status === 'reviewing' ? 'Đang xem' : app.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <p className="text-slate-400 font-bold text-sm">Chưa có đơn ứng tuyển nào</p>
                <p className="text-slate-300 text-xs font-medium mt-1">Khám phá việc làm phù hợp và nộp đơn ngay!</p>
                <Link href="/dashboard/jobs">
                  <Button variant="primary" className="mt-5 h-10 px-6 text-xs rounded-xl font-bold">Tìm việc ngay</Button>
                </Link>
              </div>
            )}
          </div>
        </>
      ) : user?.role === 'employer' ? (
        <>
          {/* Employer Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Active</span>
              </div>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">{employerActiveJobs}</h3>
              <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Tin đang tuyển</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Tổng</span>
              </div>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">{employerTotalApps}</h3>
              <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Lượt ứng tuyển</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="text-[10px] font-black text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Chờ</span>
              </div>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">{employerPendingApps}</h3>
              <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Hồ sơ chờ duyệt</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </div>
                {unreadCount > 0 && <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full uppercase tracking-wider">{unreadCount} Mới</span>}
              </div>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">{unreadCount}</h3>
              <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Tin nhắn mới</p>
            </div>
          </div>

          {/* Employer Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Tổng quan tuyển dụng</h2>
                  <p className="text-[11px] text-slate-400 font-semibold mt-1">Thống kê hiệu suất tuyển dụng 6 tháng</p>
                </div>
              </div>
              <div className="h-64">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityChartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorApps2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00b14f" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#00b14f" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 'bold' }} />
                      <Area type="monotone" dataKey="applications" name="Ứng tuyển" stroke="#00b14f" fill="url(#colorApps2)" strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full bg-slate-50 rounded-xl animate-pulse" />
                )}
              </div>
            </div>

            {/* Quick Actions for Employer */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-100 p-7 shadow-sm">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-5">Thao tác nhanh</h3>
                <div className="space-y-3">
                  <Link href="/dashboard/jobs" className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-[#00b14f]/10 flex items-center justify-center text-[#00b14f] group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Đăng tin tuyển dụng</p>
                      <p className="text-[10px] text-slate-400 font-semibold">Tạo tin mới nhanh chóng</p>
                    </div>
                  </Link>
                  <Link href="/dashboard/applications" className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Quản lý ứng viên</p>
                      <p className="text-[10px] text-slate-400 font-semibold">Xem hồ sơ ứng tuyển</p>
                    </div>
                  </Link>
                  <Link href="/dashboard/messages" className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Nhắn tin ứng viên</p>
                      <p className="text-[10px] text-slate-400 font-semibold">Trao đổi trực tiếp</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Employer CTA */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-7 text-white shadow-xl">
                <div className="inline-flex items-center px-3 py-1 bg-[#00b14f] rounded-full text-[9px] font-black uppercase tracking-widest mb-4 shadow-lg shadow-emerald-500/20">
                  Premium
                </div>
                <h3 className="text-lg font-bold tracking-tight mb-2">AI Matching</h3>
                <p className="text-white/50 text-xs font-medium mb-6 leading-relaxed">
                  Sử dụng AI để tìm kiếm và sàng lọc ứng viên phù hợp nhất với vị trí tuyển dụng.
                </p>
                <Link href="/dashboard/jobs">
                  <Button className="w-full h-11 bg-[#00b14f] hover:bg-[#009a44] text-white rounded-xl font-bold text-xs shadow-lg">
                    Khám phá ngay →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Admin Quick Redirect */
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-[#00b14f]/10 flex items-center justify-center text-[#00b14f] mb-6">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Bảng điều khiển Admin</h2>
          <p className="text-slate-400 text-sm font-medium mb-8">Truy cập trang quản trị hệ thống để quản lý nền tảng</p>
          <Link href="/dashboard/admin">
            <Button variant="primary" className="h-12 px-8 rounded-xl font-bold text-sm">
              Đi tới System Admin →
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
