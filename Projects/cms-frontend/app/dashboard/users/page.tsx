'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, UserPlus, Users as UsersIcon, Search, Shield, Edit, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/empty-state';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const { user: currentUser } = useAuthStore();
  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'admin', status: 'active' });
  const [errors, setErrors] = useState<FormErrors>({});
  const isOwner = currentUser?.role === 'owner';
  
  // Debug: log user role
  useEffect(() => {
    console.log('Current user:', currentUser);
    console.log('Is owner:', isOwner);
  }, [currentUser, isOwner]);
  
  // Real-time validation
  const validateField = (name: string, value: string, currentPassword?: string, currentConfirmPassword?: string) => {
    const newErrors: FormErrors = { ...errors };
    const password = currentPassword !== undefined ? currentPassword : form.password;
    const confirmPassword = currentConfirmPassword !== undefined ? currentConfirmPassword : form.confirmPassword;
    
    if (name === 'name') {
      if (!value.trim()) {
        newErrors.name = 'Tên là bắt buộc';
      } else {
        delete newErrors.name;
      }
    }
    
    if (name === 'email') {
      if (!value.trim()) {
        newErrors.email = 'Email là bắt buộc';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors.email = 'Email không hợp lệ';
      } else {
        delete newErrors.email;
      }
    }
    
    if (name === 'password') {
      if (!editingUser && !value) {
        newErrors.password = 'Mật khẩu là bắt buộc';
      } else if (value && value.length < 8) {
        newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
      } else if (value && !/[A-Za-z]/.test(value)) {
        newErrors.password = 'Mật khẩu phải chứa ít nhất 1 chữ cái';
      } else if (value && !/[0-9]/.test(value)) {
        newErrors.password = 'Mật khẩu phải chứa ít nhất 1 số';
      } else {
        delete newErrors.password;
      }
      
      // Re-validate confirm password if password changed
      if (confirmPassword && confirmPassword !== value) {
        newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      } else if (confirmPassword && confirmPassword === value) {
        delete newErrors.confirmPassword;
      }
    }
    
    if (name === 'confirmPassword') {
      if (!editingUser && !value) {
        newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
      } else if (value && value !== password) {
        newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      } else {
        delete newErrors.confirmPassword;
      }
    }
    
    setErrors(newErrors);
  };
  
  const isFormValid = () => {
    // Check required fields
    if (!form.name?.trim() || !form.email?.trim()) return false;
    
    // Email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return false;
    
    // Password validation (required for new users, optional for editing)
    if (!editingUser) {
      if (!form.password || !form.confirmPassword) return false;
      if (form.password.length < 8) return false;
      if (!/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) return false;
      if (form.password !== form.confirmPassword) return false;
    } else {
      // When editing, if password is provided, it must be valid
      if (form.password) {
        if (form.password.length < 8) return false;
        if (!/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) return false;
        if (form.password !== form.confirmPassword) return false;
      }
    }
    
    // Check for any validation errors
    if (Object.keys(errors).length > 0) return false;
    
    return true;
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get<any>(buildApiUrl('/api/users'), {
        withCredentials: true,
      });
      const data = (res.data && (res.data as any).data) ? (res.data as any).data as any[] : [];
      // map to UI type
      setUsers(
        data.map((u: any) => ({
          id: u.id,
          name: u.name || u.email,
          email: u.email,
          role: u.role || 'admin',
          status: (u.status as any) === 'inactive' ? 'inactive' : 'active',
          lastLogin: '',
        }))
      );
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to load users');
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreateUser = async () => {
    // Validate all fields
    validateField('name', form.name);
    validateField('email', form.email);
    validateField('password', form.password);
    validateField('confirmPassword', form.confirmPassword);
    
    if (!isFormValid()) {
      toast.error('Vui lòng điền đầy đủ và đúng thông tin');
      return;
    }
    
    try {
      // Remove status and confirmPassword from payload
      const { status, confirmPassword, ...payload } = form;
      const response = await axios.post(
        buildApiUrl('/api/users'),
        payload,
        { withCredentials: true }
      );
      toast.success('Tạo user thành công');
      setShowDialog(false);
      resetForm();
      fetchUsers();
    } catch (e: any) {
      const errorMessage = e.response?.data?.error || e.message || 'Tạo user thất bại';
      toast.error(errorMessage);
    }
  };

  const onUpdateUser = async () => {
    if (!editingUser) return;
    
    // Validate all fields
    validateField('name', form.name);
    validateField('email', form.email);
    if (form.password) {
      validateField('password', form.password);
      if (form.confirmPassword) {
        validateField('confirmPassword', form.confirmPassword);
      }
    }
    
    // Check if form is valid (password is optional when editing)
    if (!form.name || !form.email) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (form.password && form.password !== form.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    if (form.password && (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password))) {
      toast.error('Mật khẩu không hợp lệ');
      return;
    }
    
    try {
      const payload: any = { name: form.name, email: form.email, role: form.role, status: form.status };
      if (form.password && form.password.length > 0) {
        payload.password = form.password;
      }
      await axios.put(
        buildApiUrl(`/api/users/${editingUser.id}`),
        payload,
        { withCredentials: true }
      );
      toast.success('Cập nhật user thành công');
      setShowDialog(false);
      resetForm();
      fetchUsers();
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Cập nhật user thất bại');
    }
  };

  const onDeleteUser = async (user: User) => {
    // Prevent deleting owner user
    if (user.role === 'owner') {
      toast.error('Owner account cannot be deleted');
      return;
    }
    if (!confirm(`Are you sure you want to delete user "${user.name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await axios.delete(
        buildApiUrl(`/api/users/${user.id}`),
        { withCredentials: true }
      );
      toast.success('User deleted');
      fetchUsers();
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Delete user failed');
    }
  };

  const handleEdit = (user: User) => {
    // Prevent editing owner user
    if (user.role === 'owner') {
      toast.error('Owner account cannot be modified');
      return;
    }
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      confirmPassword: '',
      role: user.role,
      status: user.status,
    });
    setErrors({});
    setShowDialog(true);
  };
  
  const handleFormChange = (name: string, value: string) => {
    setForm(prev => {
      const newForm = { ...prev, [name]: value };
      // Validate the changed field with new form values
      if (name === 'password') {
        validateField('password', value, value, newForm.confirmPassword);
        // Also re-validate confirmPassword if it exists
        if (newForm.confirmPassword) {
          validateField('confirmPassword', newForm.confirmPassword, value, newForm.confirmPassword);
        }
      } else if (name === 'confirmPassword') {
        validateField('confirmPassword', value, newForm.password, value);
      } else {
        validateField(name, value);
      }
      return newForm;
    });
  };
  
  const resetForm = () => {
    setForm({ name: '', email: '', password: '', confirmPassword: '', role: 'admin', status: 'active' });
    setErrors({});
    setEditingUser(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users & Roles</h1>
          <p className="text-sm text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <button
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isOwner
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
            onClick={() => isOwner ? setShowDialog(true) : undefined}
            title={isOwner ? 'Create a new user' : 'Insufficient permission'}
            disabled={!isOwner}
          >
            <UserPlus className="h-4 w-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <select className="px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="author">Author</option>
        </select>
        <select className="px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {users.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No users yet"
          description="Start by adding team members and assigning roles. Configure permissions to control access to different parts of the CMS."
            action={{
              label: isOwner ? 'Add Your First User' : 'Insufficient permission',
              onClick: () => (isOwner ? setShowDialog(true) : toast.message('Insufficient permission')),
            }}
        />
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-accent/40 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-foreground">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      <Shield className="h-3 w-3" />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      {isOwner && user.role !== 'owner' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleEdit(user)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteUser(user)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </button>
                        </>
                      ) : user.role === 'owner' ? (
                        <span className="text-muted-foreground text-xs">Owner account cannot be modified</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">No permission</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Roles Info */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-medium text-card-foreground mb-3 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Role-Based Access Control (RBAC)
        </h3>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="font-medium text-sm text-foreground">Admin</p>
            <p className="text-xs text-muted-foreground mt-1">Full system access and user management</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="font-medium text-sm text-foreground">Editor</p>
            <p className="text-xs text-muted-foreground mt-1">Can publish and manage all content</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="font-medium text-sm text-foreground">Author</p>
            <p className="text-xs text-muted-foreground mt-1">Can create and edit own content</p>
          </div>
        </div>
      </div>

      {/* Create/Edit User Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => {
            setShowDialog(false);
            resetForm();
          }} />
          <div 
            className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl" 
            onClick={(e) => {
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">{editingUser ? 'Edit User' : 'Add User'}</h3>
              <button onClick={() => {
                setShowDialog(false);
                resetForm();
              }} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tên <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  onBlur={(e) => validateField('name', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border bg-background text-sm ${
                    errors.name ? 'border-destructive' : 'border-input'
                  }`}
                  placeholder="Nhập tên người dùng"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-destructive">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  onBlur={(e) => validateField('email', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border bg-background text-sm ${
                    errors.email ? 'border-destructive' : 'border-input'
                  }`}
                  placeholder="user@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-destructive">{errors.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Mật khẩu <span className="text-destructive">*</span>
                  {editingUser && <span className="text-muted-foreground text-xs font-normal ml-2">(để trống nếu không đổi)</span>}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => handleFormChange('password', e.target.value)}
                  onBlur={(e) => validateField('password', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border bg-background text-sm ${
                    errors.password ? 'border-destructive' : 'border-input'
                  }`}
                  placeholder={editingUser ? "Để trống nếu không đổi mật khẩu" : "Nhập mật khẩu"}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-destructive">{errors.password}</p>
                )}
                {!editingUser && (
                  <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                    <p className="font-medium mb-1">Yêu cầu mật khẩu:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li className={form.password.length >= 8 ? 'text-green-600' : ''}>
                        Ít nhất 8 ký tự {form.password.length >= 8 ? '✓' : ''}
                      </li>
                      <li className={/[A-Za-z]/.test(form.password) ? 'text-green-600' : ''}>
                        Có ít nhất 1 chữ cái {/[A-Za-z]/.test(form.password) ? '✓' : ''}
                      </li>
                      <li className={/[0-9]/.test(form.password) ? 'text-green-600' : ''}>
                        Có ít nhất 1 số {/[0-9]/.test(form.password) ? '✓' : ''}
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              
              {(!editingUser || form.password) && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Xác nhận mật khẩu <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => handleFormChange('confirmPassword', e.target.value)}
                    onBlur={(e) => validateField('confirmPassword', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border bg-background text-sm ${
                      errors.confirmPassword ? 'border-destructive' : 'border-input'
                    }`}
                    placeholder="Nhập lại mật khẩu"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-destructive">{errors.confirmPassword}</p>
                  )}
                  {form.confirmPassword && form.password === form.confirmPassword && !errors.confirmPassword && (
                    <p className="mt-1 text-xs text-green-600">✓ Mật khẩu khớp</p>
                  )}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">Vai trò</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                  disabled={editingUser?.role === 'owner'}
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="author">Author</option>
                </select>
              </div>
              
              {editingUser && (
                <div>
                  <label className="block text-sm font-medium mb-1">Trạng thái</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="px-3 py-2 rounded-lg border border-input text-sm"
                onClick={() => {
                  setShowDialog(false);
                  resetForm();
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isOwner || !isFormValid()}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isOwner) {
                    toast.error('Không đủ quyền');
                    return;
                  }
                  if (!isFormValid()) {
                    toast.error('Vui lòng điền đầy đủ và đúng thông tin');
                    return;
                  }
                  if (editingUser) {
                    onUpdateUser();
                  } else {
                    onCreateUser();
                  }
                }}
              >
                {editingUser ? 'Cập nhật' : 'Tạo user'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
