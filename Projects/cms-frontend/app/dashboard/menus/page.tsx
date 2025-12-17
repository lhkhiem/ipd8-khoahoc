'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Menu as MenuIcon, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface MenuLocation {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  item_count: number;
  created_at: string;
}

export default function MenusPage() {
  const { user: currentUser } = useAuthStore();
  const isOwner = currentUser?.role === 'owner';
  
  const [locations, setLocations] = useState<MenuLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<MenuLocation | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    is_active: true
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl('/api/menu-locations'), {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch menu locations');

      const data = await response.json();
      setLocations(data.data || []);
    } catch (error) {
      console.error('Failed to fetch menu locations:', error);
      toast.error('Failed to load menu locations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa vị trí menu "${name}"? Tất cả các mục menu sẽ bị xóa.`)) return;

    try {
      const response = await fetch(buildApiUrl(`/api/menu-locations/${id}`), {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to delete menu location');

      toast.success('Menu location deleted successfully');
      setLocations(locations.filter(l => l.id !== id));
    } catch (error) {
      console.error('Failed to delete menu location:', error);
      toast.error('Failed to delete menu location');
    }
  };

  const toggleActive = async (location: MenuLocation) => {
    try {
      const response = await fetch(buildApiUrl(`/api/menu-locations/${location.id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_active: !location.is_active })
      });

      if (!response.ok) throw new Error('Failed to update menu location');

      toast.success(`Menu location ${!location.is_active ? 'activated' : 'deactivated'}`);
      setLocations(locations.map(l => 
        l.id === location.id ? { ...l, is_active: !l.is_active } : l
      ));
    } catch (error) {
      console.error('Failed to update menu location:', error);
      toast.error('Failed to update menu location');
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      // Only auto-generate slug when creating (not editing)
      slug: editingLocation ? formData.slug : generateSlug(name)
    });
  };

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.slug) {
      toast.error('Name and slug are required');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(buildApiUrl('/api/menu-locations'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create menu location');
      }

      toast.success('Menu location created successfully');
      setShowCreateModal(false);
      setFormData({ name: '', slug: '', description: '', is_active: true });
      fetchLocations();
    } catch (error: any) {
      console.error('Failed to create menu location:', error);
      toast.error(error.message || 'Failed to create menu location');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditLocation = (location: MenuLocation) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      slug: location.slug,
      description: location.description || '',
      is_active: location.is_active
    });
  };

  const handleUpdateLocation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingLocation || !formData.name || !formData.slug) {
      toast.error('Name and slug are required');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(buildApiUrl(`/api/menu-locations/${editingLocation.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update menu location');
      }

      toast.success('Menu location updated successfully');
      setEditingLocation(null);
      setFormData({ name: '', slug: '', description: '', is_active: true });
      fetchLocations();
    } catch (error: any) {
      console.error('Failed to update menu location:', error);
      toast.error(error.message || 'Failed to update menu location');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Menu</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý menu điều hướng website của bạn
          </p>
        </div>
        {isOwner && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Vị trí menu mới
          </button>
        )}
      </div>

      {/* Menu Locations Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Đang tải vị trí menu...</p>
        </div>
      ) : locations.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <MenuIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-card-foreground mb-2">Chưa có vị trí menu nào</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Tạo vị trí menu đầu tiên để bắt đầu xây dựng điều hướng của bạn.
          </p>
          {isOwner && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Tạo vị trí menu
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <div
              key={location.id}
              className="group rounded-lg border border-border bg-card p-6 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-foreground truncate">{location.name}</h3>
                    {isOwner && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditLocation(location)}
                          className="p-1 hover:bg-accent rounded transition-colors"
                          title="Edit location settings"
                        >
                          <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => toggleActive(location)}
                          className="p-1 hover:bg-accent rounded transition-colors"
                          title={location.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {location.is_active ? (
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(location.id, location.name)}
                          className="p-1 hover:bg-accent rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </button>
                      </div>
                    )}
                    {!location.is_active && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">{location.slug}</p>
                </div>
              </div>

              {/* Description */}
              {location.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {location.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MenuIcon className="h-4 w-4" />
                  <span>{location.item_count} mục</span>
                </div>
              </div>

              {/* Actions */}
              {isOwner && (
                <div className="pt-4 border-t border-border">
                  <Link
                    href={`/dashboard/menus/${location.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Chỉnh sửa mục menu</span>
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Menu Location Modal */}
      {(showCreateModal || editingLocation) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-lg w-full mx-4 shadow-xl">
            <h2 className="text-xl font-bold text-foreground mb-6">
              {editingLocation ? 'Chỉnh sửa vị trí menu' : 'Tạo vị trí menu'}
            </h2>
            
            <form onSubmit={editingLocation ? handleUpdateLocation : handleCreateLocation} className="space-y-4">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Tên <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Ví dụ: Menu Sidebar"
                  required
                />
              </div>

              {/* Slug Field */}
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-foreground mb-2">
                  Slug <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Ví dụ: sidebar"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Tự động tạo từ tên. Được sử dụng trong code để tham chiếu menu này.
                </p>
              </div>

              {/* Description Field */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                  Mô tả
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Mô tả ngắn về nơi menu này được sử dụng"
                  rows={3}
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-primary/50"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-foreground">
                  Hoạt động (Vị trí menu sẽ có sẵn ngay lập tức)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingLocation(null);
                    setFormData({ name: '', slug: '', description: '', is_active: true });
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-input bg-background text-foreground hover:bg-accent transition-colors"
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? (editingLocation ? 'Đang cập nhật...' : 'Đang tạo...') : (editingLocation ? 'Cập nhật vị trí' : 'Tạo vị trí')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

