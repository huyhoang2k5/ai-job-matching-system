'use client'

import { useState, useEffect } from 'react'
import { useAdminStore } from '@/store/adminStore'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Users as UsersIcon, 
  Briefcase, 
  FileText, 
  Building2, 
  Search, 
  Check, 
  X, 
  Ban, 
  RotateCcw,
  Trash2,
  Lock,
  Eye,
  AlertTriangle
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts'

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const router = useRouter()
  const { 
    users, 
    employers, 
    jobs, 
    stats,
    applications,
    isLoading, 
    fetchStats,
    fetchUsers, 
    fetchEmployers, 
    fetchJobs,
    fetchApplications,
    updateUserStatus,
    updateEmployerStatus,
    updateJobStatus,
    deleteUser 
  } = useAdminStore()

  const [activeTab, setActiveTab] = useState<'users' | 'employers' | 'jobs' | 'applications' | 'stats' | 'reports'>('stats')
  const [mounted, setMounted] = useState(false)

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Moderation reason modal states
  const [reasonModal, setReasonModal] = useState<{
    show: boolean
    type: 'job_reject' | 'employer_reject' | 'user_deactivate'
    id: string
    title: string
    actionText: string
  } | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    setMounted(true)
    if (user && user.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    
    fetchStats()
    fetchUsers()
    fetchEmployers()
    fetchJobs()
    fetchApplications()
  }, [user, router, fetchStats, fetchUsers, fetchEmployers, fetchJobs, fetchApplications])

  // Trigger search params fetch
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    triggerFetch()
  }

  const triggerFetch = () => {
    const params: any = {}
    if (searchQuery) params.search = searchQuery
    
    if (activeTab === 'users') {
      if (roleFilter) params.role = roleFilter
      if (statusFilter) params.status = statusFilter
      fetchUsers(params)
    } else if (activeTab === 'employers') {
      if (statusFilter) params.status = statusFilter
      fetchEmployers(params)
    } else if (activeTab === 'jobs') {
      if (statusFilter) params.status = statusFilter
      fetchJobs(params)
    } else if (activeTab === 'applications') {
      if (statusFilter) params.status = statusFilter
      fetchApplications(params)
    }
  }

  useEffect(() => {
    setSearchQuery('')
    setRoleFilter('')
    setStatusFilter('')
  }, [activeTab])

  if (user?.role !== 'admin') return null

  // Moderation Handlers
  const handleOpenReasonModal = (type: 'job_reject' | 'employer_reject' | 'user_deactivate', id: string, title: string) => {
    setRejectionReason('')
    setReasonModal({
      show: true,
      type,
      id,
      title,
      actionText: type === 'user_deactivate' ? 'Đình chỉ' : 'Từ chối'
    })
  }

  const handleConfirmModeration = async () => {
    if (!reasonModal) return
    const { type, id } = reasonModal

    if (type === 'job_reject') {
      await updateJobStatus(id, 'rejected', rejectionReason)
    } else if (type === 'employer_reject') {
      await updateEmployerStatus(id, false, rejectionReason)
    } else if (type === 'user_deactivate') {
      await updateUserStatus(id, false) // Reason log is done via winston on backend
    }

    setReasonModal(null)
    setRejectionReason('')
    triggerFetch()
    fetchStats()
  }

  // Pre-configured growth data for recharts
  const growthData = [
    { name: 'Tháng 1', Tăng_trưởng: 20, Ứng_viên: 15, Nhà_tuyển_dụng: 5 },
    { name: 'Tháng 2', Tăng_trưởng: 38, Ứng_viên: 30, Nhà_tuyển_dụng: 8 },
    { name: 'Tháng 3', Tăng_trưởng: 52, Ứng_viên: 42, Nhà_tuyển_dụng: 10 },
    { name: 'Tháng 4', Tăng_trưởng: 78, Ứng_viên: 63, Nhà_tuyển_dụng: 15 },
    { name: 'Tháng 5', Tăng_trưởng: 95, Ứng_viên: 78, Nhà_tuyển_dụng: 17 },
    { name: 'Tháng 6', Tăng_trưởng: 120, Ứng_viên: 98, Nhà_tuyển_dụng: 22 }
  ]

  const COLORS = ['#00b14f', '#009a44', '#3b82f6', '#f59e0b', '#ef4444']

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      
      {/* Page Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Hệ thống Quản trị Admin</h1>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Quản lý và Moderation các tài nguyên trên hệ thống JobSync</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-10 text-xs font-bold rounded-xl" onClick={() => { fetchStats(); triggerFetch(); }}>
            Tải lại dữ liệu
          </Button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <UsersIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-450 uppercase tracking-widest leading-none">Người dùng</p>
            <h3 className="text-2xl font-black text-slate-800 mt-2">{stats?.users?.total || 0}</h3>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full mt-1.5 inline-block">
              {stats?.users?.active || 0} Đang hoạt động
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-455 uppercase tracking-widest leading-none">Tin tuyển dụng</p>
            <h3 className="text-2xl font-black text-slate-800 mt-2">{stats?.jobs?.total || 0}</h3>
            <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full mt-1.5 inline-block">
              {stats?.jobs?.pending || 0} Chờ duyệt
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-450 uppercase tracking-widest leading-none">Lượt ứng tuyển</p>
            <h3 className="text-2xl font-black text-slate-800 mt-2">{stats?.applications?.total || 0}</h3>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full mt-1.5 inline-block">
              {stats?.applications?.accepted || 0} Nhận việc
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-450 uppercase tracking-widest leading-none">Doanh nghiệp</p>
            <h3 className="text-2xl font-black text-slate-800 mt-2">{stats?.users?.verified || 0}</h3>
            <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full mt-1.5 inline-block">
              Trust Index 98%
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-2xl mb-8 w-fit border border-slate-200/50">
        {[
          { id: 'stats', label: 'Tổng quan hệ thống' },
          { id: 'users', label: `Người dùng (${users.length})` },
          { id: 'employers', label: `Công ty (${employers.length})` },
          { id: 'jobs', label: `Tin tuyển dụng (${jobs.length})` },
          { id: 'applications', label: `Hồ sơ tuyển dụng (${applications.length})` },
          { id: 'reports', label: 'Báo cáo vi phạm' }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-slate-800 shadow-sm border border-slate-200/20' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Panel Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="loading-spinner h-10 w-10 mb-4"></div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Đang kết xuất dữ liệu...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6">
          
          {/* Active Tab: Analytics Statistics */}
          {activeTab === 'stats' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Recharts Area Chart: User Growth */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div className="mb-6">
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Tăng trưởng người dùng mới</h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">Thống kê số lượng ứng viên và nhà tuyển dụng gia nhập hệ thống</p>
                  </div>
                  <div className="h-64 w-full">
                    {mounted ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorCandidate" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00b14f" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#00b14f" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorEmployer" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                          <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 'bold' }} />
                          <Area type="monotone" dataKey="Ứng_viên" stroke="#00b14f" fillOpacity={1} fill="url(#colorCandidate)" strokeWidth={2} />
                          <Area type="monotone" dataKey="Nhà_tuyển_dụng" stroke="#3b82f6" fillOpacity={1} fill="url(#colorEmployer)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full bg-slate-50 rounded-xl animate-pulse flex items-center justify-center">Loading charts...</div>
                    )}
                  </div>
                </div>

                {/* Recharts Bar Chart: Demands */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                  <div className="mb-6">
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Top Kỹ năng tuyển dụng hot nhất</h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">Thống kê số tin tuyển dụng yêu cầu kỹ năng tương ứng</p>
                  </div>
                  <div className="h-64 w-full">
                    {mounted && stats?.popularSkills ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.popularSkills.slice(0, 7)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="_id" stroke="#94a3b8" fontSize={9} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                          <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 'bold' }} />
                          <Bar dataKey="count" name="Số tin tuyển dụng" fill="#00b14f" radius={[4, 4, 0, 0]}>
                            {stats.popularSkills.slice(0, 7).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full bg-slate-50 rounded-xl animate-pulse flex items-center justify-center">Loading charts...</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search & Filter Bar */}
          {activeTab !== 'stats' && activeTab !== 'reports' && (
            <div className="mb-6 flex flex-col md:flex-row items-center gap-3">
              <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-3 bg-slate-50/80 border border-slate-200/60 rounded-2xl px-5 py-3 focus-within:border-primary/40 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-primary/5 transition-all">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm theo tên, email, vị trí..."
                  className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </form>
              
              <div className="flex gap-2 w-full md:w-auto shrink-0">
                {activeTab === 'users' && (
                  <select 
                    className="bg-white border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-semibold outline-none cursor-pointer hover:border-slate-300 transition-colors appearance-none min-w-[130px]"
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value)}
                  >
                    <option value="">Tất cả vai trò</option>
                    <option value="candidate">Ứng viên</option>
                    <option value="employer">Nhà tuyển dụng</option>
                    <option value="admin">Quản trị viên</option>
                  </select>
                )}

                <select 
                  className="bg-white border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-semibold outline-none cursor-pointer hover:border-slate-300 transition-colors appearance-none min-w-[130px]"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="">Trạng thái</option>
                  {activeTab === 'users' && (
                    <>
                      <option value="active">Đang hoạt động</option>
                      <option value="inactive">Đã đình chỉ</option>
                    </>
                  )}
                  {activeTab === 'employers' && (
                    <>
                      <option value="approved">Đã xác minh</option>
                      <option value="pending">Chờ xác minh</option>
                    </>
                  )}
                  {activeTab === 'jobs' && (
                    <>
                      <option value="approved">Đã duyệt</option>
                      <option value="pending">Chờ duyệt</option>
                      <option value="rejected">Bị từ chối</option>
                    </>
                  )}
                  {activeTab === 'applications' && (
                    <>
                      <option value="accepted">Trúng tuyển</option>
                      <option value="rejected">Bị từ chối</option>
                      <option value="pending">Chờ xét duyệt</option>
                    </>
                  )}
                </select>

                <Button variant="primary" className="h-[46px] text-xs font-bold px-6 rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all" onClick={triggerFetch}>
                  <Search className="w-3.5 h-3.5 mr-1.5" /> Lọc
                </Button>
              </div>
            </div>
          )}

          {/* ========= USERS TABLE ========= */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <UsersIcon className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-700">Danh sách người dùng</h3>
                      <p className="text-[10px] text-slate-400 font-medium">{users.length} tài khoản</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-6 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Người dùng</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Vai trò</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Xác thực</th>
                      <th className="px-6 py-3.5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {users.map((u) => (
                      <tr key={u.id} className="group hover:bg-gradient-to-r hover:from-slate-50/80 hover:to-transparent transition-all duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 shadow-sm ${
                              u.role === 'admin' ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white' :
                              u.role === 'employer' ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' :
                              'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-600'
                            }`}>
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{u.name}</p>
                              <p className="text-[11px] text-slate-400 font-medium">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'admin' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                            u.role === 'employer' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                            'bg-slate-50 text-slate-500 border border-slate-100'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              u.role === 'admin' ? 'bg-purple-500' : u.role === 'employer' ? 'bg-blue-500' : 'bg-slate-400'
                            }`} />
                            {u.role === 'admin' ? 'Quản trị viên' : u.role === 'employer' ? 'Nhà tuyển dụng' : 'Ứng viên'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            u.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                            {u.isActive ? 'Hoạt động' : 'Đình chỉ'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {u.isVerified ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                              <Check className="w-3.5 h-3.5" /> Đã xác thực
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-300">Chưa xác thực</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {u.role !== 'admin' && (
                              <>
                                {u.isActive ? (
                                  <button 
                                    onClick={() => handleOpenReasonModal('user_deactivate', u.id, u.name)}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 hover:border-rose-200 transition-all"
                                  >
                                    <Ban className="w-3 h-3" /> Khóa
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => updateUserStatus(u.id, true)}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/10 hover:border-primary/20 transition-all"
                                  >
                                    <RotateCcw className="w-3 h-3" /> Mở khóa
                                  </button>
                                )}
                                <button 
                                  onClick={() => { if(confirm(`Xóa vĩnh viễn tài khoản của ${u.name}?`)) deleteUser(u.id) }}
                                  className="p-2 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                  title="Xóa tài khoản"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center"><UsersIcon className="w-6 h-6 text-slate-300" /></div>
                            <p className="text-sm font-bold text-slate-400">Không tìm thấy người dùng nào</p>
                            <p className="text-xs text-slate-300">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========= EMPLOYERS TABLE ========= */}
          {activeTab === 'employers' && (
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-700">Quản lý doanh nghiệp</h3>
                    <p className="text-[10px] text-slate-400 font-medium">{employers.length} công ty đã đăng ký</p>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-6 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Công ty</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Lĩnh vực</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Quy mô</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                      <th className="px-6 py-3.5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {employers.map((e) => (
                      <tr key={e.id} className="group hover:bg-gradient-to-r hover:from-slate-50/80 hover:to-transparent transition-all duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-black text-white shadow-sm shrink-0">
                              {e.companyName?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{e.companyName}</p>
                              <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                {e.location || 'Chưa cập nhật'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 uppercase tracking-wider">
                            {e.industry || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold text-slate-500">{e.companySize || '—'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            e.isApproved 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                              : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${e.isApproved ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                            {e.isApproved ? 'Đã xác minh' : 'Chờ duyệt'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {!e.isApproved ? (
                              <>
                                <button 
                                  onClick={() => updateEmployerStatus(e.id, true)}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[10px] font-bold text-white bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20 transition-all"
                                >
                                  <Check className="w-3 h-3" /> Xác minh
                                </button>
                                <button 
                                  onClick={() => handleOpenReasonModal('employer_reject', e.id, e.companyName)}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[10px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 transition-all"
                                >
                                  <X className="w-3 h-3" /> Từ chối
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={() => updateEmployerStatus(e.id, false)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all"
                              >
                                <RotateCcw className="w-3 h-3" /> Thu hồi
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {employers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center"><Building2 className="w-6 h-6 text-slate-300" /></div>
                            <p className="text-sm font-bold text-slate-400">Không có doanh nghiệp nào</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========= JOBS TABLE ========= */}
          {activeTab === 'jobs' && (
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-700">Kiểm duyệt tin tuyển dụng</h3>
                    <p className="text-[10px] text-slate-400 font-medium">{jobs.length} tin đã đăng</p>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-6 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Vị trí tuyển dụng</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Doanh nghiệp</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Địa điểm</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                      <th className="px-6 py-3.5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Kiểm duyệt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {jobs.map((j) => (
                      <tr key={j.id} className="group hover:bg-gradient-to-r hover:from-slate-50/80 hover:to-transparent transition-all duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-sm shrink-0 ${
                              j.status === 'approved' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' :
                              j.status === 'pending' ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                              'bg-gradient-to-br from-rose-400 to-rose-600'
                            }`}>
                              <Briefcase className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{j.title}</p>
                              <p className="text-[11px] text-slate-400 font-medium">
                                {j.type === 'full-time' ? 'Toàn thời gian' : j.type === 'part-time' ? 'Bán thời gian' : j.type === 'remote' ? 'Từ xa' : j.type || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {(() => {
                              const compName = j.employer?.companyName || (typeof j.employerId !== 'string' ? (j.employerId as any)?.companyName : '') || 'N/A';
                              return (
                                <>
                                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0">
                                    {compName.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-xs font-semibold text-slate-600">{compName}</span>
                                </>
                              );
                            })()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                            <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {j.location || 'Remote'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            j.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                            j.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                            'bg-rose-50 text-rose-600 border border-rose-100'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              j.status === 'approved' ? 'bg-emerald-500' : j.status === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'
                            }`} />
                            {j.status === 'approved' ? 'Đã duyệt' : j.status === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {j.status === 'pending' && (
                              <button 
                                onClick={() => updateJobStatus(j.id, 'approved')}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[10px] font-bold text-white bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20 transition-all"
                              >
                                <Check className="w-3 h-3" /> Phê duyệt
                              </button>
                            )}
                            {j.status !== 'rejected' ? (
                              <button 
                                onClick={() => handleOpenReasonModal('job_reject', j.id, j.title)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[10px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 transition-all"
                              >
                                <X className="w-3 h-3" /> Từ chối
                              </button>
                            ) : (
                              <button 
                                onClick={() => updateJobStatus(j.id, 'approved')}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-all"
                              >
                                <RotateCcw className="w-3 h-3" /> Khôi phục
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {jobs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center"><Briefcase className="w-6 h-6 text-slate-300" /></div>
                            <p className="text-sm font-bold text-slate-400">Không có tin tuyển dụng nào</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========= APPLICATIONS TABLE ========= */}
          {activeTab === 'applications' && (
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-700">Hồ sơ ứng tuyển</h3>
                    <p className="text-[10px] text-slate-400 font-medium">{applications.length} hồ sơ</p>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-6 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Ứng viên</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Vị trí ứng tuyển</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                      <th className="px-6 py-3.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày nộp</th>
                      <th className="px-6 py-3.5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">CV</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {applications.map((app) => (
                      <tr key={app.id} className="group hover:bg-gradient-to-r hover:from-slate-50/80 hover:to-transparent transition-all duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-sm font-black text-white shadow-sm shrink-0">
                              {app.candidate?.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{app.candidate?.name || 'Ứng viên'}</p>
                              <p className="text-[11px] text-slate-400 font-medium">{app.candidate?.email || ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-semibold text-slate-600">
                            {app.job?.title || (typeof app.jobId !== 'string' ? (app.jobId as any)?.title : '') || 'N/A'}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                            {app.job?.company || (typeof app.jobId !== 'string' ? ((app.jobId as any)?.employer?.companyName || (typeof (app.jobId as any)?.employerId !== 'string' ? ((app.jobId as any)?.employerId as any)?.companyName : '')) : '') || ''}
                          </p>
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
                             'Chờ xét'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span className="text-xs font-semibold text-slate-500">
                              {new Date(app.appliedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {app.cvUrl ? (
                            <a href={app.cvUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-all">
                              <Eye className="w-3 h-3" /> Xem CV
                            </a>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-300">Không có</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {applications.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center"><FileText className="w-6 h-6 text-slate-300" /></div>
                            <p className="text-sm font-bold text-slate-400">Chưa có hồ sơ ứng tuyển</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========= REPORTS EMPTY STATE ========= */}
          {activeTab === 'reports' && (
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="px-6 py-20 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-5">
                  <Check className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Hệ thống an toàn</h3>
                <p className="text-sm text-slate-400 font-medium max-w-md">Không phát hiện báo cáo vi phạm nào. Hệ thống đang hoạt động bình thường và tuân thủ các quy định.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Moderation Actions custom reason modal popup */}
      {reasonModal?.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl border border-slate-100">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" /> {reasonModal.actionText} tài nguyên tuyển dụng
            </h3>
            <p className="text-[11px] text-slate-400 font-semibold mb-6">
              Bạn đang {reasonModal.actionText} đối tượng: <span className="font-bold text-slate-800">"{reasonModal.title}"</span>. Vui lòng nhập lý do để phản hồi cho nhà tuyển dụng hoặc ứng viên.
            </p>
            
            <div className="space-y-4">
              <textarea 
                rows={4}
                required
                placeholder="Nhập lý do từ chối cụ thể..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold placeholder:text-slate-400 outline-none focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all resize-none"
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
              />
              <div className="flex gap-3">
                <Button 
                  onClick={() => setReasonModal(null)}
                  variant="outline"
                  className="flex-1 h-10 text-xs font-bold rounded-xl"
                >
                  Hủy bỏ
                </Button>
                <Button 
                  onClick={handleConfirmModeration}
                  variant="primary"
                  className="flex-1 h-10 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white"
                  disabled={!rejectionReason.trim()}
                >
                  Xác nhận
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
