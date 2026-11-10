export interface User {
  id: string
  name: string
  email: string
  role: 'candidate' | 'employer' | 'admin'
  avatar?: string
  isActive: boolean
  isVerified: boolean
  createdAt: string
  lastLogin?: string
}

export interface CandidateProfile {
  id: string
  userId: string | User
  skills: string[]
  experience: Experience[]
  education: Education[]
  location?: string
  bio?: string
  cvUrl?: string
  cvParsed?: CVParsedData
  resumeHeadline?: string
  preferredLocations: string[]
  expectedSalary?: {
    min?: number
    max?: number
    currency: 'USD' | 'VND'
  }
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote'
  availability: 'immediately' | '1-2-weeks' | '2-4-weeks' | '1-month' | 'not-looking'
  socialLinks?: {
    linkedin?: string
    github?: string
    portfolio?: string
    website?: string
  }
  isPublic: boolean
  isAvailable: boolean
  totalExperience?: string
  latestEducation?: Education
}

export interface Experience {
  title: string
  company: string
  location?: string
  startDate: string
  endDate?: string
  description?: string
  isCurrentJob?: boolean
}

export interface Education {
  degree: string
  school: string
  field?: string
  startDate: string
  endDate?: string
  gpa?: number
  isCurrent?: boolean
}

export interface EmployerProfile {
  id: string
  userId: string | User
  companyName: string
  description?: string
  logo?: string
  website?: string
  location: string
  industry: string
  companySize: string
  foundedYear?: number
  socialLinks?: {
    linkedin?: string
    facebook?: string
    twitter?: string
    instagram?: string
  }
  contactInfo?: {
    phone?: string
    email?: string
    address?: string
  }
  benefits?: string[]
  isApproved: boolean
  approvalDate?: string
  rejectionReason?: string
  subscription?: {
    type: 'free' | 'basic' | 'premium' | 'enterprise'
    startDate: string
    endDate?: string
    features: string[]
  }
  isActive: boolean
  companyAge?: number
  activeJobPostingsCount?: number
}

export interface JobPost {
  id: string
  employerId: string | EmployerProfile
  title: string
  description: string
  requirements: string[]
  skills: string[]
  location: string
  isRemote: boolean
  salary?: {
    min?: number
    max?: number
    currency: 'USD' | 'VND'
    isNegotiable: boolean
  }
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote'
  experienceLevel: 'entry-level' | 'junior' | 'mid-level' | 'senior' | 'lead' | 'manager'
  department?: string
  deadline: string
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'closed'
  rejectionReason?: string
  approvedDate?: string
  views: number
  applications: string[]
  isFeatured: boolean
  featuredExpiry?: string
  tags: string[]
  applicationCount: number
  isActive: boolean
  daysUntilDeadline?: number
  salaryRange?: string
  isExpired?: boolean
  isLive?: boolean
  employer?: {
    companyName: string
    logo?: string
    location: string
    website?: string
    description?: string
  }
}

export interface Application {
  id: string
  candidateId: string | CandidateProfile
  jobId: string | JobPost
  userId: string
  cvUrl: string
  coverLetter?: string
  status: 'pending' | 'viewed' | 'reviewing' | 'shortlisted' | 'rejected' | 'accepted' | 'withdrawn'
  appliedAt: string
  lastUpdated: string
  notes: ApplicationNote[]
  employerNotes?: string
  matchScore?: number
  matchReasons?: string[]
  isViewed: boolean
  viewedAt?: string
  interviewSchedule?: InterviewSchedule
  rejectionReason?: string
  withdrawalReason?: string
  attachments: ApplicationAttachment[]
  daysSinceApplied?: number
  candidate?: {
    name: string
    email: string
    skills: string[]
    experience: Experience[]
  }
  job?: {
    title: string
    company: string
    location: string
    salary: {
      min?: number
      max?: number
      currency: string
    }
    type: string
    employerId?: {
      _id: string
      companyName: string
      userId: string
      logo?: string
    }
  }
}

export interface ApplicationNote {
  content: string
  addedBy: string
  addedAt: string
}

export interface InterviewSchedule {
  date: string
  time: string
  type: 'phone' | 'video' | 'onsite' | 'technical'
  location?: string
  notes?: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
}

export interface ApplicationAttachment {
  filename: string
  url: string
  uploadedAt: string
}

export interface Message {
  id: string
  roomId: string
  senderId: string
  receiverId: string
  content: string
  type: 'text' | 'image' | 'file' | 'system'
  attachment?: {
    filename: string
    url: string
    mimeType: string
    size: number
  }
  isRead: boolean
  readAt?: string
  isEdited: boolean
  editedAt?: string
  isDeleted: boolean
  deletedAt?: string
  replyTo?: string
  reactions: MessageReaction[]
  metadata?: {
    userAgent?: string
    ipAddress?: string
    device?: string
  }
  sender?: User
  receiver?: User
  replyMessage?: Message
  createdAt: string
}

export interface MessageReaction {
  userId: string
  emoji: string
  addedAt: string
}

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  content: string
  isRead: boolean
  readAt?: string
  data?: {
    jobId?: string
    applicationId?: string
    messageId?: string
    senderId?: string
    url?: string
    actionUrl?: string
  }
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'application' | 'job' | 'message' | 'profile' | 'system'
  expiresAt?: string
  isDeleted: boolean
  deletedAt?: string
  user?: User
  createdAt: string
}

export interface CVParsedData {
  name?: string
  email?: string
  phone?: string
  skills: string[]
  experience: any[]
  education: any[]
  location?: string
  summary?: string
}

export interface JobRecommendation {
  id: string
  title: string
  company?: string
  employer?: {
    companyName: string
    logo?: string
    location?: string
  }
  location?: string
  matchScore: number
  matchReasons: string[]
  salary?: {
    min?: number
    max?: number
    currency: string
  }
  type: string
  description: string
  requirements: string[]
  skills: string[]
}

export interface DashboardStats {
  users: {
    total: number
    candidates: number
    employers: number
    admins: number
    active: number
    verified: number
  }
  jobs: {
    total: number
    pending: number
    approved: number
    rejected: number
    expired: number
  }
  applications: {
    total: number
    pending: number
    viewed: number
    reviewing: number
    accepted: number
    rejected: number
  }
  recent: {
    users: User[]
    jobs: JobPost[]
  }
  popularSkills: Array<{
    _id: string
    count: number
  }>
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: {
    items: T[]
    pagination: {
      current: number
      limit: number
      total: number
      pages: number
    }
  }
}

export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    user: User
    token: string
    refreshToken: string
  }
}

export interface SearchFilters {
  keyword?: string
  skills?: string[]
  location?: string
  type?: string
  experienceLevel?: string
  salaryMin?: number
  salaryMax?: number
  isRemote?: boolean
  page?: number
  limit?: number
}

export interface ChatRoom {
  id: string
  otherUser: User
  lastMessage: Message
  unreadCount: number
}
