/**
 * Helper Utilities
 */

/**
 * Format currency in Indian Rupees
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format large numbers with Indian numbering system
 */
export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-IN').format(num)
}

/**
 * Format date
 */
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

/**
 * Format date and time
 */
export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now - past) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  
  return formatDate(date)
}

/**
 * Validate email
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

/**
 * Validate phone (10 digits)
 */
export const isValidPhone = (phone) => {
  const re = /^[0-9]{10}$/
  return re.test(phone)
}

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  const minLength = password.length >= 6
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  return {
    isValid: minLength && hasUpperCase && hasLowerCase && hasNumber,
    minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
  }
}

/**
 * Truncate text
 */
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Generate random color
 */
export const randomColor = () => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Calculate percentage
 */
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return '??'
  const parts = name.split(' ')
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Copy to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}

/**
 * Download data as JSON
 */
export const downloadJSON = (data, filename) => {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.json`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Get status color
 */
export const getStatusColor = (status) => {
  const colors = {
    success: 'text-green-600 bg-green-100',
    failed: 'text-red-600 bg-red-100',
    pending: 'text-yellow-600 bg-yellow-100',
    active: 'text-blue-600 bg-blue-100',
    inactive: 'text-gray-600 bg-gray-100',
  }
  return colors[status] || colors.pending
}

/**
 * Sleep/delay function
 */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
