'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Download, File, Image, FileText, Video, Archive } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { buildApiUrl } from '@/lib/api';

interface Material {
  id: string;
  course_id: string;
  title: string;
  file_key: string;
  file_url: string;
  mime_type: string;
  size: number;
  visibility: 'public' | 'private' | 'enrolled';
  provider: string;
  download_count: number;
  created_at: string;
  updated_at: string;
}

interface CourseMaterialsManagerProps {
  courseId: string;
}

export default function CourseMaterialsManager({ courseId }: CourseMaterialsManagerProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'enrolled'>('enrolled');

  useEffect(() => {
    fetchMaterials();
  }, [courseId]);

  const fetchMaterials = async () => {
    try {
      const response = await axios.get(buildApiUrl(`/api/courses/${courseId}/materials`), {
        withCredentials: true,
      });
      if (response.data?.data) {
        setMaterials(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch materials:', error);
      toast.error('Không thể tải danh sách tài liệu');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingMaterial(null);
    setTitle('');
    setVisibility('enrolled');
    setSelectedFile(null);
    setShowDialog(true);
  };

  const openEdit = (material: Material) => {
    setEditingMaterial(material);
    setTitle(material.title);
    setVisibility(material.visibility);
    setSelectedFile(null);
    setShowDialog(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (500MB limit)
      if (file.size > 500 * 1024 * 1024) {
        toast.error('File quá lớn. Giới hạn tối đa là 500MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Tiêu đề tài liệu là bắt buộc');
      return;
    }

    // For new material, file is required
    if (!editingMaterial && !selectedFile) {
      toast.error('Vui lòng chọn file để upload');
      return;
    }

    setSaving(true);
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('visibility', visibility);
      formData.append('provider', 'local');
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      if (editingMaterial) {
        // Update material
        await axios.put(
          buildApiUrl(`/api/courses/${courseId}/materials/${editingMaterial.id}`),
          formData,
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        toast.success('Tài liệu đã được cập nhật');
      } else {
        // Create material
        await axios.post(
          buildApiUrl(`/api/courses/${courseId}/materials`),
          formData,
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        toast.success('Tài liệu đã được tạo');
      }

      setShowDialog(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      fetchMaterials();
    } catch (error: any) {
      console.error('Failed to save material:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Không thể lưu tài liệu';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleDelete = async (materialId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tài liệu này? File sẽ bị xóa vĩnh viễn.')) return;

    try {
      await axios.delete(buildApiUrl(`/api/courses/${courseId}/materials/${materialId}`), {
        withCredentials: true,
      });
      toast.success('Tài liệu đã được xóa');
      fetchMaterials();
    } catch (error: any) {
      console.error('Failed to delete material:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Không thể xóa tài liệu';
      toast.error(errorMessage);
    }
  };

  const handleDownload = (material: Material) => {
    // Open file URL in new tab
    const fileUrl = buildApiUrl(material.file_url);
    window.open(fileUrl, '_blank');
    
    // Optionally increment download count (if backend supports it)
    // This would require a separate API endpoint
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.startsWith('video/')) return Video;
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return FileText;
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return Archive;
    return File;
  };

  const getVisibilityLabel = (visibility: Material['visibility']) => {
    switch (visibility) {
      case 'public':
        return 'Công khai';
      case 'private':
        return 'Riêng tư';
      case 'enrolled':
        return 'Chỉ học viên';
      default:
        return visibility;
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quản lý Tài liệu</h2>
          <p className="text-muted-foreground">
            Tổng số: {materials.length} tài liệu
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Upload Tài liệu
        </button>
      </div>

      {/* Materials Grid */}
      {materials.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground mb-4">Chưa có tài liệu nào</p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Upload Tài liệu đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {materials.map((material) => {
            const Icon = getFileIcon(material.mime_type);
            return (
              <div
                key={material.id}
                className="group relative rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-card-foreground truncate" title={material.title}>
                        {material.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(material.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => handleDownload(material)}
                      className="rounded-lg border border-border bg-background p-1.5 hover:bg-accent"
                      title="Tải xuống"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openEdit(material)}
                      className="rounded-lg border border-border bg-background p-1.5 hover:bg-accent"
                      title="Chỉnh sửa"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(material.id)}
                      className="rounded-lg border border-border bg-background p-1.5 hover:bg-accent text-red-600"
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="rounded bg-muted px-2 py-1">
                    {getVisibilityLabel(material.visibility)}
                  </span>
                  <span>{material.download_count} lượt tải</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg border border-border bg-card p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold">
              {editingMaterial ? 'Chỉnh sửa Tài liệu' : 'Upload Tài liệu mới'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Nhập tiêu đề tài liệu"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  File {!editingMaterial && <span className="text-red-500">*</span>}
                </label>
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required={!editingMaterial}
                  />
                  {selectedFile && (
                    <div className="rounded-lg border border-border bg-muted p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{selectedFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  {editingMaterial && !selectedFile && (
                    <p className="text-xs text-muted-foreground">
                      File hiện tại: {editingMaterial.file_url.split('/').pop()}
                      <br />
                      Chọn file mới để thay thế (tùy chọn)
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Hỗ trợ: PDF, DOC, DOCX, Images, Videos, Archives. Tối đa 500MB
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Quyền truy cập</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as 'public' | 'private' | 'enrolled')}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="public">Công khai</option>
                  <option value="private">Riêng tư</option>
                  <option value="enrolled">Chỉ học viên đã đăng ký</option>
                </select>
              </div>

              {uploading && (
                <div className="rounded-lg border border-border bg-muted p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-sm text-muted-foreground">
                      Đang upload file...
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDialog(false);
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving || uploading
                    ? 'Đang lưu...'
                    : editingMaterial
                    ? 'Cập nhật'
                    : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

