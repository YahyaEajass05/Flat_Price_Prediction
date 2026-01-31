/**
 * Utility to clear authentication data
 * Run this in browser console if you need to logout manually
 */

export const clearAuth = () => {
  // Clear localStorage
  localStorage.removeItem('auth-storage')
  localStorage.removeItem('refreshToken')
  
  // Clear sessionStorage
  sessionStorage.clear()
  
  console.log('✅ Authentication data cleared. Please refresh the page.')
  
  // Reload page
  window.location.href = '/'
}

// Make it available in browser console for debugging
if (typeof window !== 'undefined') {
  window.clearAuth = clearAuth
}

export default clearAuth
