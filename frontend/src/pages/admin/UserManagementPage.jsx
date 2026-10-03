import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Users, Search, Filter, Shield, UserCheck, UserX, RefreshCw } from 'lucide-react';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

const UserManagementPage = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [togglingId, setTogglingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter !== 'All') params.role = roleFilter;
      if (statusFilter !== 'All') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/admin/users', { params });
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (user) => {
    if (user.role === 'admin') {
      showToast('Administrator accounts cannot be disabled', 'warning');
      return;
    }
    setTogglingId(user._id);
    try {
      const res = await api.put(`/admin/users/${user._id}/toggle-status`);
      if (res.data.success) {
        showToast(res.data.message, 'success');
        setUsers(prev =>
          prev.map(u => (u._id === user._id ? { ...u, status: res.data.user.status } : u))
        );
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update user status', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Users className="w-8 h-8 text-indigo-600" />
            <span>User Governance</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage candidates, recruiters, and administrative access privileges
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="inline-flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition shadow-sm"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Roles</option>
              <option value="candidate">Candidate</option>
              <option value="recruiter">Recruiter</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Status</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving platform accounts..." />
      ) : users.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Try broadening your search query or reset filter settings."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">User</th>
                  <th className="py-3.5 px-4 sm:px-6">Role</th>
                  <th className="py-3.5 px-4 sm:px-6">Contact & Location</th>
                  <th className="py-3.5 px-4 sm:px-6">Status</th>
                  <th className="py-3.5 px-4 sm:px-6">Joined Date</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {users.map((user) => {
                  const roleVariant =
                    user.role === 'admin'
                      ? 'purple'
                      : user.role === 'recruiter'
                      ? 'blue'
                      : 'indigo';

                  return (
                    <tr key={user._id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{user.name}</div>
                            <div className="text-xs text-slate-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 sm:px-6">
                        <Badge variant={roleVariant} size="sm">
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 sm:px-6">
                        <div className="text-xs text-slate-600">{user.phone || 'N/A'}</div>
                        <div className="text-xs text-slate-400">{user.location || 'Not specified'}</div>
                      </td>
                      <td className="py-4 px-4 sm:px-6">
                        <Badge variant={user.status === 'active' ? 'success' : 'danger'} size="sm">
                          {user.status || 'active'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-xs text-slate-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        {user.role === 'admin' ? (
                          <span className="text-xs text-slate-400 font-medium italic">Superadmin</span>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(user)}
                            disabled={togglingId === user._id}
                            className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                              user.status === 'active'
                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                          >
                            {user.status === 'active' ? (
                              <>
                                <UserX className="w-3.5 h-3.5" />
                                <span>{togglingId === user._id ? 'Updating...' : 'Disable'}</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>{togglingId === user._id ? 'Updating...' : 'Activate'}</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
