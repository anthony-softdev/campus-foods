import React, { useState, useMemo, useEffect } from 'react';
import { Search, User, Shield, ShieldCheck, ChevronDown, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { UserProfile } from '../types';
import { updateUserRoleInDb, deleteUserFromDb } from '../firebase';

interface AdminUsersViewProps {
  users: UserProfile[];
  currentUserEmail: string;
  onShowToast: (message: string, type: 'success' | 'error' | 'warning') => void;
}

export default function AdminUsersView({ users, currentUserEmail, onShowToast }: AdminUsersViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'admin'>('all');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown && !(event.target as Element).closest('.role-dropdown-container')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  const filteredUsers = useMemo(() => {
    const filtered = users.filter(user => {
      const matchesSearch = 
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesFilter;
    }).sort((a, b) => a.fullName.localeCompare(b.fullName));
    // Reset to first page when filters change to avoid being on an empty page
    setCurrentPage(1);
    return filtered;
  }, [users, searchQuery, roleFilter]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const handleRoleChange = async (email: string, newRole: 'student' | 'admin') => {
    if (email === currentUserEmail) {
      onShowToast("You cannot change your own role.", 'error');
      return;
    }
    if (window.confirm(`Are you sure you want to change this user's role to "${newRole}"?`)) {
      try {
        await updateUserRoleInDb(email, newRole);
        onShowToast(`User role successfully updated to ${newRole}.`, 'success');
      } catch (error) {
        console.error("Error updating user role:", error);
        onShowToast("Failed to update user role.", 'error');
      } finally {
        setActiveDropdown(null);
      }
    }
  };

  const handleDeleteUser = async (email: string, fullName: string) => {
    if (email === currentUserEmail) {
      onShowToast("You cannot delete your own account.", 'error');
      return;
    }
    if (window.confirm(`Are you sure you want to permanently delete the user "${fullName}" (${email})? This action is irreversible and will remove their profile data.`)) {
      try {
        await deleteUserFromDb(email);
        onShowToast(`User ${fullName} has been deleted.`, 'success');
        // The user list will update automatically via the onSnapshot listener in AdminView
      } catch (error) {
        console.error("Error deleting user:", error);
        onShowToast("Failed to delete user.", 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Panel */}
      <div className="bg-white border border-orange-100/50 p-4 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-grow max-w-md">
          <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#fff9f2]/30 hover:bg-[#fff9f2]/60 focus:bg-white text-xs pl-10 pr-4 py-3 rounded-2xl border border-orange-100 outline-none transition-all text-[#1a1a1a] font-sans font-semibold"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-sans font-bold text-gray-400">Filter by role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="bg-[#fff9f2]/40 rounded-2xl border border-orange-100 px-4 py-2.5 text-xs font-sans font-bold text-[#1a1a1a] outline-none"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white border border-orange-100/60 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left font-sans">
            <thead className="bg-orange-50/50 text-[10px] text-gray-500 uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-3">User</th>
                <th scope="col" className="px-6 py-3">Contact</th>
                <th scope="col" className="px-6 py-3">Last Seen</th>
                <th scope="col" className="px-6 py-3">Default Location</th>
                <th scope="col" className="px-6 py-3">Role</th>
                <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map(user => (
                <tr key={user.email} className="border-b border-orange-100/50 hover:bg-orange-50/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    <div className="font-bold text-brand-dark">{user.fullName}</div>
                    <div className="text-xs text-gray-500 font-mono">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.phoneNumber}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {user.lastSeen 
                      ? new Date(user.lastSeen).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) 
                      : 'Never'
                    }
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <div>{user.deliveryLocation}</div>
                    <div className="text-xs text-gray-400">Room: {user.roomNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      user.role === 'admin' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role === 'admin' ? <ShieldCheck size={12} /> : <User size={12} />}
                      <span className="capitalize">{user.role}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.email !== currentUserEmail ? (
                      <div className="flex items-center justify-end gap-2">
                        <div className="relative role-dropdown-container">
                          <button 
                            onClick={() => setActiveDropdown(activeDropdown === user.email ? null : user.email)}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-1"
                          >
                            Change Role <ChevronDown size={14} />
                          </button>
                          {activeDropdown === user.email && (
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-10 animate-fadeIn">
                              <button onClick={() => handleRoleChange(user.email, 'student')} disabled={user.role === 'student'} className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"><User size={12} /> Make Student</button>
                              <button onClick={() => handleRoleChange(user.email, 'admin')} disabled={user.role === 'admin'} className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"><Shield size={12} /> Make Admin</button>
                            </div>
                          )}
                        </div>
                        <button onClick={() => handleDeleteUser(user.email, user.fullName)} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors" title={`Delete ${user.fullName}`}><Trash2 size={14} /></button>
                      </div>
                    ) : (<span className="text-xs text-gray-400 italic">Current User</span>)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {paginatedUsers.length === 0 && (<div className="text-center p-8 text-gray-500">No users found matching your criteria.</div>)}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center text-xs font-sans font-semibold text-gray-500 mt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

    </div>
  );
}