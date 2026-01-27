import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { fadeIn } from '../../utils/animations'

const Layout = () => {
  useEffect(() => {
    fadeIn('.main-content', 600)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="main-content flex-1 p-6 ml-64">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
