'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Sparkles, 
  FileText, 
  Building2, 
  TrendingUp, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Users
} from 'lucide-react'
import { jobApi } from '@/lib/api'
import { JobPost } from '@/types'

export default function HomePage() {
  const router = useRouter()
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')
  const [featuredJobs, setFeaturedJobs] = useState<JobPost[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch jobs for "Việc làm hấp dẫn"
  useEffect(() => {
    const fetchRecentJobs = async () => {
      try {
        const response: any = await jobApi.getAll({ limit: 6, status: 'approved' })
        if (response.success && response.data?.jobs) {
          setFeaturedJobs(response.data.jobs)
        }
      } catch (error) {
        console.error('Failed to load featured jobs:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRecentJobs()
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const query = new URLSearchParams()
    if (keyword) query.set('keyword', keyword)
    if (location) query.set('location', location)
    if (category) query.set('type', category)
    router.push(`/dashboard/jobs?${query.toString()}`)
  }

  const handleQuickSearch = (key: string) => {
    setKeyword(key)
    router.push(`/dashboard/jobs?keyword=${encodeURIComponent(key)}`)
  }

  // Pre-configured mock jobs as backup
  const mockJobs = [
    {
      id: 'mock-1',
      title: 'Kỹ sư Trí tuệ Nhân tạo (AI Engineer)',
      employer: { companyName: 'FPT Software', logo: '' },
      location: 'Hà Nội',
      type: 'full-time',
      salaryRange: '25,000,000 - 45,000,000 VND',
      skills: ['Python', 'TensorFlow', 'NLP']
    },
    {
      id: 'mock-2',
      title: 'Senior Node.js Backend Developer',
      employer: { companyName: 'VNG Corporation', logo: '' },
      location: 'TP. Hồ Chí Minh',
      type: 'full-time',
      salaryRange: '35,000,000 - 60,000,000 VND',
      skills: ['Node.js', 'Express', 'MongoDB']
    },
    {
      id: 'mock-3',
      title: 'Fullstack React / Next.js Engineer',
      employer: { companyName: 'Viettel Group', logo: '' },
      location: 'Đà Nẵng',
      type: 'remote',
      salaryRange: '20,000,000 - 35,000,000 VND',
      skills: ['React', 'Next.js', 'TypeScript']
    }
  ]

  const displayJobs = featuredJobs.length > 0 ? featuredJobs : mockJobs

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-primary/20">
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-10">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-md shadow-primary/20 rotate-3 transition-transform group-hover:rotate-0">
                <Sparkles className="w-5 h-5 fill-current" />
              </div>
              <h1 className="text-xl font-black text-slate-850 tracking-tighter">
                Job<span className="text-primary font-black">Sync</span>
              </h1>
            </Link>
            
            <nav className="hidden lg:flex items-center space-x-8 text-xs font-bold text-slate-600 tracking-wide uppercase">
              <Link href="/dashboard/jobs" className="hover:text-primary transition-colors">Tìm việc làm</Link>
              <Link href="/dashboard/cv" className="hover:text-primary transition-colors">Mẫu CV chuyên nghiệp</Link>
              <Link href="/dashboard/recommendations" className="hover:text-primary transition-colors flex items-center gap-1 text-primary">
                Gợi ý việc làm bằng AI <span className="bg-primary/10 text-primary text-[8px] px-1.5 py-0.5 rounded-full">New</span>
              </Link>
              <Link href="/dashboard/messages" className="hover:text-primary transition-colors">Trò chuyện</Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/auth/login" className="text-xs font-bold text-slate-600 hover:text-primary uppercase tracking-wide transition-colors px-4 py-2">
              Đăng nhập
            </Link>
            <Link href="/auth/register" className="bg-primary hover:bg-primary/95 text-white text-xs font-black px-6 py-3 rounded-xl shadow-md shadow-primary/10 transition-all uppercase tracking-wider">
              Đăng ký
            </Link>
            <span className="h-6 w-px bg-slate-200 hidden sm:block"></span>
            <Link href="/auth/register?role=employer" className="border border-slate-200 text-slate-600 hover:text-primary hover:border-primary/30 bg-white text-xs font-bold px-4 py-3 rounded-xl transition-all hidden sm:block">
              Tuyển dụng / Đăng tin
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Advanced Search */}
      <section className="relative bg-gradient-to-b from-primary/5 via-transparent to-transparent pt-16 pb-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl aspect-video bg-gradient-to-tr from-primary/10 to-transparent rounded-[100px] blur-3xl -z-10" />
        
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center px-4.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 mb-8 animate-fade-in">
            🚀 NỀN TẢNG KẾT NỐI VIỆC LÀM NHANH BẰNG AI
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight mb-8 text-slate-800">
            Tìm việc làm mơ ước, <br className="hidden sm:inline" />
            <span className="text-primary relative inline-block">
              kết nối tương lai cùng AI.
              <span className="absolute bottom-1 left-0 w-full h-2 bg-primary/10 -skew-x-12 -z-10" />
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-slate-500 text-base sm:text-lg font-medium leading-relaxed mb-12 opacity-90">
            Hơn 10,000+ tin tuyển dụng chất lượng cao được chuẩn hóa, khớp thông minh dựa trên kỹ năng CV của bạn thông qua thuật toán AI tối tân.
          </p>

          {/* Search Box - TopCV Style */}
          <div className="max-w-5xl mx-auto bg-white p-4 rounded-3xl shadow-xl border border-slate-100 text-left mb-8">
            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
              
              {/* Keyword */}
              <div className="flex-1 w-full flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-2xl border border-slate-100 focus-within:bg-white focus-within:border-primary/30 transition-all">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input 
                  type="text"
                  placeholder="Vị trí tuyển dụng, kỹ năng hoặc tên công ty..."
                  className="w-full bg-transparent text-xs font-semibold outline-none placeholder:text-slate-400"
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                />
              </div>

              {/* Location */}
              <div className="w-full md:w-48 flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-2xl border border-slate-100 focus-within:bg-white focus-within:border-primary/30 transition-all shrink-0">
                <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                <select 
                  className="w-full bg-transparent text-xs font-semibold outline-none cursor-pointer appearance-none"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                >
                  <option value="">Tất cả địa điểm</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Bình Dương">Bình Dương</option>
                  <option value="Hải Phòng">Hải Phòng</option>
                  <option value="Remote">Remote (Làm từ xa)</option>
                </select>
              </div>

              {/* Category/Type */}
              <div className="w-full md:w-48 flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-2xl border border-slate-100 focus-within:bg-white focus-within:border-primary/30 transition-all shrink-0">
                <Briefcase className="w-5 h-5 text-slate-400 shrink-0" />
                <select 
                  className="w-full bg-transparent text-xs font-semibold outline-none cursor-pointer appearance-none"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  <option value="">Tất cả hình thức</option>
                  <option value="full-time">Full-time (Toàn thời gian)</option>
                  <option value="part-time">Part-time (Bán thời gian)</option>
                  <option value="internship">Internship (Thực tập sinh)</option>
                  <option value="contract">Contract (Hợp đồng)</option>
                </select>
              </div>

              {/* Search button */}
              <button 
                type="submit"
                className="w-full md:w-auto bg-primary hover:bg-primary/95 text-white font-black px-8 py-3.5 rounded-2xl shadow-lg shadow-primary/10 transition-all uppercase tracking-wider text-xs shrink-0"
              >
                Tìm kiếm
              </button>
            </form>
          </div>

          {/* Quick search tags */}
          <div className="flex flex-wrap justify-center items-center gap-2.5 text-xs text-slate-400 font-semibold">
            <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-primary" /> Từ khóa phổ biến:</span>
            {['ReactJS', 'Node.js', 'Python AI', 'UI/UX Designer', 'Marketing'].map((key) => (
              <button 
                key={key} 
                onClick={() => handleQuickSearch(key)}
                className="bg-white border border-slate-100 hover:border-primary/30 hover:text-primary px-3 py-1.5 rounded-full transition-all text-[11px]"
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100 mb-3">
                🔥 TIN TUYỂN DỤNG HÀNG ĐẦU
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Việc làm nổi bật hôm nay</h2>
            </div>
            <Link href="/dashboard/jobs" className="text-xs font-bold text-primary flex items-center gap-1.5 hover:gap-2.5 transition-all uppercase tracking-wider">
              Xem tất cả việc làm <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="loading-spinner h-8 w-8"></div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Đang tìm tin tuyển dụng mới...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayJobs.map((job: any) => (
                <Link 
                  href={`/dashboard/jobs`} 
                  key={job.id || job._id} 
                  className="bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-primary/25 rounded-3xl p-6 transition-all hover:shadow-xl hover:shadow-primary/5 group relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 flex items-center justify-center font-bold text-primary shadow-sm text-lg overflow-hidden shrink-0">
                        {job.employer?.logo ? (
                          <img src={job.employer.logo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          job.employer?.companyName?.charAt(0) || 'C'
                        )}
                      </div>
                      <span className="bg-primary/10 text-primary text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                        Hot
                      </span>
                    </div>

                    <h3 className="font-black text-slate-800 text-xs group-hover:text-primary transition-colors line-clamp-1 mb-1">
                      {job.title}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-400 mb-4 line-clamp-1">
                      {job.employer?.companyName}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {job.skills?.slice(0, 3).map((skill: string, idx: number) => (
                        <span key={idx} className="bg-white border border-slate-100 text-slate-500 text-[9px] font-bold px-2 py-1 rounded-md">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-[10px] font-bold">
                    <span className="text-rose-500 uppercase tracking-wide">
                      {job.salaryRange || (job.salary?.min ? `${(job.salary.min / 1000000).toFixed(0)}tr - ${(job.salary.max / 1000000).toFixed(0)}tr VND` : 'Thỏa thuận')}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                      <MapPin className="w-3 h-3 text-slate-300" /> {job.location}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* AI Parsing Glassmorphism Banner */}
      <section className="py-20 bg-slate-50 border-t border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-[2.5rem] p-8 md:p-14 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center gap-12">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
                ✨ PHÂN TÍCH THÔNG MINH
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Phân tích CV tức thì với <br />
                hệ thống trí tuệ nhân tạo
              </h2>
              <p className="text-slate-350 text-sm leading-relaxed max-w-lg">
                Hệ thống tự động trích xuất thông tin học vấn, kinh nghiệm và kỹ năng của bạn qua OCR. Từ đó, AI đánh giá mức độ tương thích và gợi ý các việc làm phù hợp nhất trong cơ sở dữ liệu.
              </p>
              <div className="flex flex-wrap gap-6 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-primary">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black">Chính xác 98%</h4>
                    <p className="text-[10px] text-slate-400">Semantic Matching</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-primary">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black">Xử lý dưới 5s</h4>
                    <p className="text-[10px] text-slate-400">FastAPI OCR Pipeline</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Visual Element */}
            <div className="w-full lg:w-[420px] shrink-0 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl relative animate-pulse">
              <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-[11px] font-black tracking-wider uppercase">Kết quả khớp CV</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Đã phân tích</span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1.5">
                    <span>Mức độ tương thích (Match Score)</span>
                    <span className="text-primary font-black text-xs">87% Match</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>
                <div className="pt-2 space-y-2">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Kỹ năng được nhận diện:</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[9px] font-semibold px-2 py-0.5 rounded">Python</span>
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[9px] font-semibold px-2 py-0.5 rounded">ReactJS</span>
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[9px] font-semibold px-2 py-0.5 rounded">MongoDB</span>
                    <span className="bg-rose-500/20 text-rose-450 border border-rose-500/20 text-[9px] font-semibold px-2 py-0.5 rounded">Docker (Thiếu)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CV Templates Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 mb-3">
              🎨 BẢN THIẾT KẾ CÁ NHÂN
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mb-4">Tạo CV chuyên nghiệp độc bản</h2>
            <p className="text-slate-500 text-sm font-medium">Tăng 80% cơ hội được gọi phỏng vấn nhờ các mẫu thiết kế CV tối ưu và chuẩn ATS.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Elegant Developer', desc: 'Thiết kế tối giản, nhấn mạnh kỹ năng và học vấn thực tế.', color: 'from-emerald-500/10 to-teal-500/10' },
              { title: 'Creative Designer', desc: 'Màu sắc hiện đại dành cho ứng viên khối ngành Marketing/Design.', color: 'from-blue-500/10 to-indigo-500/10' },
              { title: 'Executive Professional', desc: 'Chuẩn ATS, chuyên nghiệp cho các cấp quản lý và kỹ sư lâu năm.', color: 'from-amber-500/10 to-orange-500/10' }
            ].map((tmpl, idx) => (
              <div key={idx} className="group border border-slate-100 hover:border-primary/20 bg-slate-50/50 rounded-3xl overflow-hidden transition-all shadow-sm flex flex-col justify-between">
                <div className={`h-48 bg-gradient-to-tr ${tmpl.color} flex items-center justify-center relative overflow-hidden`}>
                  <FileText className="w-16 h-16 text-slate-400 opacity-60 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Link href="/dashboard/cv" className="bg-primary text-white text-[10px] font-black uppercase px-6 py-2.5 rounded-xl shadow-md tracking-wider">
                      Dùng mẫu này
                    </Link>
                  </div>
                </div>
                <div className="p-6 bg-white border-t border-slate-100">
                  <h3 className="text-sm font-black text-slate-800 mb-1">{tmpl.title}</h3>
                  <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">{tmpl.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Stats Grid */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex items-start gap-4 p-4">
              <Users className="w-10 h-10 text-primary shrink-0" />
              <div>
                <h4 className="font-black text-slate-800 text-sm mb-1">50,000+ Ứng viên</h4>
                <p className="text-slate-400 text-xs font-semibold leading-relaxed">Đã tìm thấy công việc ưng ý và hoàn thiện hồ sơ năng lực thành công.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4">
              <Building2 className="w-10 h-10 text-primary shrink-0" />
              <div>
                <h4 className="font-black text-slate-800 text-sm mb-1">2,000+ Nhà tuyển dụng</h4>
                <p className="text-slate-400 text-xs font-semibold leading-relaxed">Các tập đoàn công nghệ hàng đầu tin tưởng đăng tin và tuyển dụng.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4">
              <ShieldCheck className="w-10 h-10 text-primary shrink-0" />
              <div>
                <h4 className="font-black text-slate-800 text-sm mb-1">Kết nối tin cậy</h4>
                <p className="text-slate-400 text-xs font-semibold leading-relaxed">Quy trình duyệt tin kiểm soát chặt chẽ thông tin, hạn chế tối đa rủi ro.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-white border-t border-slate-100 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 rotate-3">
              <Sparkles className="w-4 h-4 text-slate-600" />
            </div>
            <h1 className="text-base font-black text-slate-850 tracking-tighter">
              Job<span className="text-primary font-black">Sync</span>
            </h1>
          </div>
          
          <div className="flex gap-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">
            <Link href="/terms" className="hover:text-primary transition">Điều khoản</Link>
            <Link href="/privacy" className="hover:text-primary transition">Bảo mật</Link>
            <Link href="/contact" className="hover:text-primary transition">Liên hệ</Link>
          </div>
          
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60">
            © 2026 JobSync Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
