import { useEffect, useState, useRef } from 'react'
import { FaEdit, FaTrash, FaUserPlus, FaSearch } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { adminAPI } from '../../services/api'
import { staggerFadeIn } from '../../utils/animations'
import Loading from '../../components/common/Loading'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const tableRef = useRef(null)

  useEffect(() => {
    loadUsers()
  }, [page, search])

  useEffect(() => {
    if (tableRef.current && users.length > 0) {
      staggerFadeIn(tableRef.current.querySelectorAll('tbody tr'), 600, 50)
    }
  }, [users])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getAllUsers(page, 20, search)
      setUsers(response.data)
      setTotalPages(response.pages)
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user ${userName}?`)) return

    try {
      await adminAPI.deleteUser(userId)
      toast.success('User deleted successfully')
      loadUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user')
    }
  }

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await adminAPI.updateUser(userId, { isActive: !currentStatus })
      toast.success('User status updated')
      loadUsers()
    } catch (error) {
      toast.error('Failed to update user status')
    }
  }

  if (loading && users.length === 0) {
    return <Loading message="Loading users..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Users</h1>
        <button className="btn btn-primary flex items-center gap-2">
          <FaUserPlus />
          Add User
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table ref={tableRef} className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">User</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Role</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Predictions
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Joined
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 anime-hidden">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`badge ${
                        user.role === 'admin' ? 'badge-info' : 'badge-success'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleUserStatus(user._id, user.isActive)}
                      className={`badge ${
                        user.isActive ? 'badge-success' : 'badge-danger'
                      } cursor-pointer`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold">
                      {user.predictionCount} / {user.predictionLimit}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                        <FaEdit />
                      </button>
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleDelete(user._id, user.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-secondary disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn btn-secondary disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUsers
