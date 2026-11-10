import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatSalary(salary?: { min?: number; max?: number; currency?: string }): string {
  if (!salary || (!salary.min && !salary.max)) {
    return 'Not specified'
  }
  
  const currency = salary.currency || 'VND'
  const symbol = currency === 'USD' ? '$' : '₫'
  
  if (salary.min && salary.max) {
    return `${symbol}${salary.min.toLocaleString()} - ${symbol}${salary.max.toLocaleString()}`
  } else if (salary.min) {
    return `${symbol}${salary.min.toLocaleString()}+`
  } else if (salary.max) {
    return `Up to ${symbol}${salary.max.toLocaleString()}`
  }
  
  return 'Not specified'
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength) + '...'
}

export function generateRoomId(userId1: string, userId2: string): string {
  // Sort user IDs to ensure consistent room ID
  const sortedIds = [userId1, userId2].sort()
  return sortedIds.join('_')
}

export function getInitials(name: string): string {
  if (!name) {
    return ''
  }
  
  const names = name.split(' ')
  return names
    .map(n => n.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2)
}

export function calculateExperience(startDate: string, endDate?: string): string {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : new Date()
  
  const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                (end.getMonth() - start.getMonth())
  
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  
  if (years > 0) {
    return remainingMonths > 0 ? `${years} years ${remainingMonths} months` : `${years} years`
  } else {
    return `${remainingMonths} months`
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(\+84|0)?[3-9][0-9]{8,9}$/
  return phoneRegex.test(phone)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

export function getRelativeTime(date: string | Date): string {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else {
    const months = Math.floor(diffInSeconds / 2592000)
    return `${months} month${months > 1 ? 's' : ''} ago`
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-100'
    case 'approved':
      return 'text-green-600 bg-green-100'
    case 'rejected':
      return 'text-red-600 bg-red-100'
    case 'accepted':
      return 'text-blue-600 bg-blue-100'
    case 'reviewing':
      return 'text-purple-600 bg-purple-100'
    case 'shortlisted':
      return 'text-indigo-600 bg-indigo-100'
    case 'withdrawn':
      return 'text-gray-600 bg-gray-100'
    case 'expired':
      return 'text-orange-600 bg-orange-100'
    case 'closed':
      return 'text-gray-600 bg-gray-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export function getStatusText(status: string): string {
  switch (status) {
    case 'pending':
      return 'Pending'
    case 'approved':
      return 'Approved'
    case 'rejected':
      return 'Rejected'
    case 'accepted':
      return 'Accepted'
    case 'reviewing':
      return 'Reviewing'
    case 'shortlisted':
      return 'Shortlisted'
    case 'withdrawn':
      return 'Withdrawn'
    case 'expired':
      return 'Expired'
    case 'closed':
      return 'Closed'
    default:
      return status
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
