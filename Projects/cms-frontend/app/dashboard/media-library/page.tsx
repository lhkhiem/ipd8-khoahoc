'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Plus, Search, Grid, List, Upload, 
  FolderPlus, Folder, FolderOpen, Image as ImageIcon,
  Trash2, Eye, Copy, X, MoreVertical, Edit2, Move,
  ChevronRight, ChevronDown, Check, SortAsc, SortDesc
} from 'lucide-react';
import { toast } from 'sonner';
import { buildApiUrl, getAssetUrl } from '@/lib/api';

interface MediaFolder {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
}

interface Asset {
  id: string;
  type: string;
  provider: string;
  url: string;
  cdn_url: string | null;
  width: number | null;
  height: number | null;
  format: string | null;
  sizes: { [key: string]: string } | null;
  folder_id: string | null;
  created_at: string;
  file_name?: string;
  file_size?: number;
  thumb_url?: string;
  medium_url?: string;
  large_url?: string;
  original_url?: string;
}

type ViewMode = 'grid' | 'list';
type SortField = 'name' | 'date' | 'size' | 'type';
type SortOrder = 'asc' | 'desc';

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<Asset[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; itemId: string; type: 'file' | 'folder' } | null>(null);
  const [previewFile, setPreviewFile] = useState<Asset | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // Modals
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showRenameFolderModal, setShowRenameFolderModal] = useState<string | null>(null);
  const [showMoveFilesModal, setShowMoveFilesModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renameFolderName, setRenameFolderName] = useState('');

  useEffect(() => {
    fetchFolders();
    fetchMedia();
  }, [selectedFolder]);

  const fetchFolders = async () => {
    try {
      const response = await fetch(buildApiUrl('/api/media/folders'), {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch folders');

      const data = await response.json();
      setFolders(data.folders || []);
    } catch (error: any) {
      console.error('Failed to fetch folders:', error);
      toast.error('Không thể tải thư mục');
    }
  };

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedFolder) params.append('folder_id', selectedFolder);
      
      const response = await fetch(buildApiUrl(`/api/media?${params}`), {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch media');

      const data = await response.json();
      setMedia(Array.isArray(data) ? data : (data?.data || []));
    } catch (error: any) {
      console.error('Failed to fetch media:', error);
      toast.error('Không thể tải media');
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    const WARNING_SIZE = 10 * 1024 * 1024; // 10MB

    // Validate file sizes
    const largeFiles: string[] = [];
    const oversizedFiles: string[] = [];
    
    for (const file of fileArray) {
      if (file.size > MAX_FILE_SIZE) {
        oversizedFiles.push(`${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      } else if (file.size >= WARNING_SIZE) {
        largeFiles.push(`${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      }
    }

    // Show error for oversized files
    if (oversizedFiles.length > 0) {
      toast.error(
        `File quá lớn (giới hạn 100MB): ${oversizedFiles.join(', ')}`
      );
      return;
    }

    // Show warning for large files
    if (largeFiles.length > 0) {
      const proceed = window.confirm(
        `Cảnh báo: Các file sau có dung lượng >= 10MB sẽ được nén và chuyển đổi sang .webp:\n${largeFiles.join('\n')}\n\nBạn có muốn tiếp tục?`
      );
      if (!proceed) {
        return;
      }
    }

    setUploading(true);
    try {
      for (let i = 0; i < fileArray.length; i++) {
        const formData = new FormData();
        formData.append('file', fileArray[i]);
        if (selectedFolder) formData.append('folder_id', selectedFolder);

        const response = await fetch(buildApiUrl('/api/media/upload'), {
          method: ')POST',
          credentials: 'include',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `Failed to upload ${fileArray[i].name}`);
        }
      }

      toast.success(`Đã tải lên thành công ${fileArray.length} tệp!`);
      fetchMedia();
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.message || 'Tải lên thất bại');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const response = await fetch(buildApiUrl('/api/media/folders'), {
        method: ')POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newFolderName, parent_id: selectedFolder }),
      });

      if (!response.ok) throw new Error('Failed to create folder');

      toast.success('Đã tạo thư mục thành công!');
      setNewFolderName('');
      setShowNewFolderModal(false);
      fetchFolders();
    } catch (error: any) {
      toast.error(error.message || 'Không thể tạo thư mục');
    }
  };

  const handleRenameFolder = async (folderId: string) => {
    if (!renameFolderName.trim()) return;

    try {
      const response = await fetch(buildApiUrl('/api/media/folders/${folderId}'), {
        method: ')PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: renameFolderName }),
      });

      if (!response.ok) throw new Error('Failed to rename folder');

      toast.success('Đã đổi tên thư mục thành công!');
      setRenameFolderName('');
      setShowRenameFolderModal(null);
      fetchFolders();
    } catch (error: any) {
      toast.error(error.message || 'Không thể đổi tên thư mục');
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thư mục này và tất cả nội dung bên trong?')) return;

    try {
      const response = await fetch(buildApiUrl('/api/media/folders/${folderId}'), {
        method: ')DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete folder');

      toast.success('Đã xóa thư mục thành công!');
      if (selectedFolder === folderId) setSelectedFolder(null);
      fetchFolders();
      fetchMedia();
    } catch (error: any) {
      toast.error(error.message || 'Không thể xóa thư mục');
    }
  };

  const handleDeleteFiles = async (fileIds: string[]) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa ${fileIds.length} tệp?`)) return;

    try {
      await Promise.all(
        fileIds.map(id =>
          fetch(buildApiUrl('/api/media/${id}'), {
            method: ')DELETE',
            credentials: 'include',
          })
        )
      );

      toast.success(`Đã xóa thành công ${fileIds.length} tệp!`);
      setSelectedFiles(new Set());
      fetchMedia();
    } catch (error: any) {
      toast.error('Không thể xóa tệp');
    }
  };

  const handleMoveFiles = async (targetFolderId: string | null) => {
    try {
      await Promise.all(
        Array.from(selectedFiles).map(id =>
          fetch(buildApiUrl('/api/media/${id}'), {
            method: ')PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ folder_id: targetFolderId }),
          })
        )
      );

      toast.success('Đã di chuyển tệp thành công!');
      setSelectedFiles(new Set());
      setShowMoveFilesModal(false);
      fetchMedia();
    } catch (error: any) {
      toast.error('Không thể di chuyển tệp');
    }
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const toggleFileSelection = (fileId: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const selectAll = () => {
    setSelectedFiles(new Set(filteredAndSortedMedia.map(m => m.id)));
  };

  const deselectAll = () => {
    setSelectedFiles(new Set());
  };

  // Build folder tree
  const folderTree = useMemo(() => {
    const buildTree = (parentId: string | null): MediaFolder[] => {
      return folders
        .filter(f => f.parent_id === parentId)
        .sort((a, b) => a.name.localeCompare(b.name));
    };
    return buildTree(null);
  }, [folders]);

  // Filter and sort media
  const filteredAndSortedMedia = useMemo(() => {
    let filtered = media.filter(item =>
      (item.file_name || item.url).toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      
      if (sortField === 'name') {
        aVal = (a.file_name || a.url).toLowerCase();
        bVal = (b.file_name || b.url).toLowerCase();
      } else if (sortField === 'date') {
        aVal = new Date(a.created_at).getTime();
        bVal = new Date(b.created_at).getTime();
      } else if (sortField === 'size') {
        aVal = a.file_size || 0;
        bVal = b.file_size || 0;
      } else if (sortField === 'type') {
        aVal = a.format || '';
        bVal = b.format || '';
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [media, searchQuery, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const renderFolderTree = (folderList: MediaFolder[], level = 0) => {
    return folderList.map(folder => {
      const isExpanded = expandedFolders.has(folder.id);
      const isSelected = selectedFolder === folder.id;
      const children = folders.filter(f => f.parent_id === folder.id);
      const hasChildren = children.length > 0;

      return (
        <div key={folder.id}>
          <div
            className={`flex items-center gap-1 px-2 py-1.5 cursor-pointer rounded transition-colors ${
              isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            }`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={() => setSelectedFolder(folder.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({ x: e.clientX, y: e.clientY, itemId: folder.id, type: 'folder' });
            }}
          >
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(folder.id);
                }}
                className="p-0.5 hover:bg-accent/50 rounded"
              >
                {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </button>
            )}
            {!hasChildren && <div className="w-4" />}
            {isExpanded ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />}
            <span className="text-sm truncate flex-1">{folder.name}</span>
          </div>
          {isExpanded && hasChildren && renderFolderTree(children, level + 1)}
        </div>
      );
    });
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Thư viện Media</h1>
            <p className="text-sm text-muted-foreground">Quản lý tệp và thư mục của bạn</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="file-upload" className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer">
            <Upload className="h-4 w-4" />
            Tải lên tệp
          </label>
          <input
            id="file-upload"
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
            accept="image/jpeg,image/png,image/gif,image/webp"
          />
          <button
            onClick={() => setShowNewFolderModal(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <FolderPlus className="h-4 w-4" />
            Thư mục mới
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Folder Tree Sidebar */}
        <div className="w-64 border-r border-border bg-card overflow-y-auto">
          <div className="p-2">
            <div
              className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded transition-colors ${
                selectedFolder === null ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
              }`}
              onClick={() => setSelectedFolder(null)}
            >
              <Folder className="h-4 w-4" />
              <span className="text-sm font-medium">Tất cả tệp</span>
            </div>
            <div className="mt-2">
              {renderFolderTree(folderTree)}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 border-b border-border bg-card">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm kiếm tệp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex items-center gap-2">
              {selectedFiles.size > 0 && (
                <>
                  <span className="text-sm text-muted-foreground">{selectedFiles.size} đã chọn</span>
                  <button
                    onClick={() => setShowMoveFilesModal(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors text-sm"
                  >
                    <Move className="h-4 w-4" />
                    Di chuyển
                  </button>
                  <button
                    onClick={() => handleDeleteFiles(Array.from(selectedFiles))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors text-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                    Xóa
                  </button>
                  <button
                    onClick={deselectAll}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors text-sm"
                  >
                    Xóa chọn
                  </button>
                </>
              )}
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted'}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-muted'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* File Grid/List */}
          <div className="flex-1 overflow-y-auto p-4 bg-background">
            {uploading && (
              <div className="mb-4 p-4 rounded-lg border border-border bg-card text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <p className="mt-2 text-sm text-muted-foreground">Đang tải lên tệp...</p>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-muted-foreground">Đang tải media...</p>
              </div>
            ) : filteredAndSortedMedia.length === 0 ? (
              <div
                className={`rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
                  isDragOver ? 'border-primary bg-primary/5' : 'border-border bg-card'
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  handleFileUpload(e.dataTransfer.files);
                }}
              >
                <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-card-foreground mb-2">Chưa có tệp nào</p>
                <p className="text-sm text-muted-foreground">Kéo thả tệp hoặc nhấp "Tải lên tệp"</p>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filteredAndSortedMedia.map(asset => (
                      <div
                        key={asset.id}
                        className={`relative group rounded-lg border overflow-hidden cursor-pointer transition-all ${
                          selectedFiles.has(asset.id)
                            ? 'border-primary ring-2 ring-primary'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={(e) => {
                          if (e.shiftKey || e.ctrlKey || e.metaKey) {
                            toggleFileSelection(asset.id);
                          } else {
                            setPreviewFile(asset);
                          }
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          if (!selectedFiles.has(asset.id)) {
                            setSelectedFiles(new Set([asset.id]));
                          }
                          setContextMenu({ x: e.clientX, y: e.clientY, itemId: asset.id, type: 'file' });
                        }}
                      >
                        <img
                          src={getAssetUrl(asset.thumb_url || asset.url)}
                          alt={asset.file_name || 'Media'}
                          className="w-full h-32 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getAssetUrl(asset.url);
                          }}
                        />
                        <div className="p-2 text-xs truncate bg-card">
                          {asset.file_name || asset.url.split('/').pop()}
                        </div>
                        {selectedFiles.has(asset.id) && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <Check className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                        <div className="absolute bottom-8 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <input
                            type="checkbox"
                            checked={selectedFiles.has(asset.id)}
                            onChange={() => toggleFileSelection(asset.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 cursor-pointer"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-border bg-card overflow-hidden">
                    <table className="min-w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left">
                            <input
                              type="checkbox"
                              checked={selectedFiles.size === filteredAndSortedMedia.length && filteredAndSortedMedia.length > 0}
                              onChange={(e) => e.target.checked ? selectAll() : deselectAll()}
                              className="w-4 h-4"
                            />
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Xem trước</th>
                          <th 
                            className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:text-foreground"
                            onClick={() => handleSort('name')}
                          >
                            <div className="flex items-center gap-1">
                              Tên
                              {sortField === 'name' && (sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                            </div>
                          </th>
                          <th 
                            className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:text-foreground"
                            onClick={() => handleSort('type')}
                          >
                            <div className="flex items-center gap-1">
                              Loại
                              {sortField === 'type' && (sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                            </div>
                          </th>
                          <th 
                            className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:text-foreground"
                            onClick={() => handleSort('size')}
                          >
                            <div className="flex items-center gap-1">
                              Kích thước
                              {sortField === 'size' && (sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                            </div>
                          </th>
                          <th 
                            className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:text-foreground"
                            onClick={() => handleSort('date')}
                          >
                            <div className="flex items-center gap-1">
                              Ngày
                              {sortField === 'date' && (sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredAndSortedMedia.map(asset => (
                          <tr
                            key={asset.id}
                            className={`transition-colors ${selectedFiles.has(asset.id) ? 'bg-primary/10' : 'hover:bg-accent/40'}`}
                          >
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selectedFiles.has(asset.id)}
                                onChange={() => toggleFileSelection(asset.id)}
                                className="w-4 h-4"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <img
                                src={getAssetUrl(asset.thumb_url || asset.url)}
                                alt={asset.file_name || 'Media'}
                                className="h-10 w-10 object-cover rounded"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = getAssetUrl(asset.url);
                                }}
                              />
                            </td>
                            <td className="px-4 py-3 text-sm text-foreground max-w-xs truncate">
                              {asset.file_name || asset.url.split('/').pop()}
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground uppercase">
                              {asset.format}
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {asset.file_size ? `${(asset.file_size / 1024).toFixed(1)} KB` : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                              {new Date(asset.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setPreviewFile(asset)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
                                >
                                  <Eye className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setContextMenu({ x: e.clientX, y: e.clientY, itemId: asset.id, type: 'file' });
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-input bg-background hover:bg-accent transition-colors text-xs"
                                >
                                  <MoreVertical className="h-3 w-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-50 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[160px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {contextMenu.type === 'file' ? (
              <>
                <button
                  onClick={() => {
                    const asset = media.find(m => m.id === contextMenu.itemId);
                    if (asset) setPreviewFile(asset);
                    setContextMenu(null);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Xem trước
                </button>
                <button
                  onClick={() => {
                    const asset = media.find(m => m.id === contextMenu.itemId);
                    if (asset) {
                      const url = getAssetUrl(asset.original_url || asset.url);
                      navigator.clipboard.writeText(url);
                      toast.success('Đã sao chép URL!');
                    }
                    setContextMenu(null);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-accent flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Sao chép URL
                </button>
                <button
                  onClick={() => {
                    setSelectedFiles(new Set([contextMenu.itemId]));
                    setShowMoveFilesModal(true);
                    setContextMenu(null);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-accent flex items-center gap-2"
                >
                  <Move className="h-4 w-4" />
                  Di chuyển
                </button>
                <div className="border-t border-border my-1" />
                <button
                  onClick={() => {
                    handleDeleteFiles([contextMenu.itemId]);
                    setContextMenu(null);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-accent flex items-center gap-2 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    const folder = folders.find(f => f.id === contextMenu.itemId);
                    if (folder) {
                      setRenameFolderName(folder.name);
                      setShowRenameFolderModal(contextMenu.itemId);
                    }
                    setContextMenu(null);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-accent flex items-center gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Đổi tên
                </button>
                <div className="border-t border-border my-1" />
                <button
                  onClick={() => {
                    handleDeleteFolder(contextMenu.itemId);
                    setContextMenu(null);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-accent flex items-center gap-2 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setPreviewFile(null)}>
          <div className="relative bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewFile(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-background text-foreground hover:bg-accent z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">{previewFile.file_name || previewFile.url.split('/').pop()}</h3>
              <img
                src={getAssetUrl(previewFile.original_url || previewFile.url)}
                alt={previewFile.file_name || 'Preview'}
                className="max-w-full h-auto mx-auto rounded-lg mb-4"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getAssetUrl(previewFile.url);
                }}
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Loại</p>
                  <p className="font-medium text-foreground">{previewFile.format?.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Kích thước</p>
                  <p className="font-medium text-foreground">{previewFile.width}x{previewFile.height}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Dung lượng</p>
                  <p className="font-medium text-foreground">{previewFile.file_size ? `${(previewFile.file_size / 1024).toFixed(2)} KB` : '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Đã tải lên</p>
                  <p className="font-medium text-foreground">{new Date(previewFile.created_at).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    const url = getAssetUrl(previewFile.original_url || previewFile.url);
                    navigator.clipboard.writeText(url);
                    toast.success('Đã sao chép URL!');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  Sao chép URL
                </button>
                <button
                  onClick={() => {
                    handleDeleteFiles([previewFile.id]);
                    setPreviewFile(null);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4 text-foreground">Tạo thư mục mới</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Tên thư mục"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground mb-4"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowNewFolderModal(false);
                  setNewFolderName('');
                }}
                className="px-4 py-2 rounded-lg border border-input bg-background text-foreground hover:bg-accent transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Tạo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Folder Modal */}
      {showRenameFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4 text-foreground">Đổi tên thư mục</h3>
            <input
              type="text"
              value={renameFolderName}
              onChange={(e) => setRenameFolderName(e.target.value)}
              placeholder="Tên thư mục mới"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground mb-4"
              onKeyPress={(e) => e.key === 'Enter' && handleRenameFolder(showRenameFolderModal)}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowRenameFolderModal(null);
                  setRenameFolderName('');
                }}
                className="px-4 py-2 rounded-lg border border-input bg-background text-foreground hover:bg-accent transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => handleRenameFolder(showRenameFolderModal)}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Đổi tên
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move Files Modal */}
      {showMoveFilesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4 text-foreground">Di chuyển {selectedFiles.size} tệp</h3>
            <div className="max-h-64 overflow-y-auto border border-border rounded-lg mb-4">
              <div
                onClick={() => handleMoveFiles(null)}
                className="px-4 py-2 hover:bg-accent cursor-pointer border-b border-border"
              >
                <div className="flex items-center gap-2 text-foreground">
                  <Folder className="h-4 w-4" />
                  <span className="font-medium">Tất cả tệp (Gốc)</span>
                </div>
              </div>
              {folders.map(folder => (
                <div
                  key={folder.id}
                  onClick={() => handleMoveFiles(folder.id)}
                  className="px-4 py-2 hover:bg-accent cursor-pointer border-b border-border last:border-b-0"
                >
                  <div className="flex items-center gap-2 text-foreground">
                    <Folder className="h-4 w-4" />
                    <span>{folder.name}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowMoveFilesModal(false)}
                className="px-4 py-2 rounded-lg border border-input bg-background text-foreground hover:bg-accent transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}







