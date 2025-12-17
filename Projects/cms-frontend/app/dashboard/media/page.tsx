'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Plus, Search, Grid, List, Upload, 
  FolderPlus, Folder, FolderOpen, Image as ImageIcon,
  Trash2, Eye, Copy, X, MoreVertical, Edit2, Move,
  ChevronRight, ChevronDown, Check, SortAsc, SortDesc,
  File, Download, Pencil, Link2
} from 'lucide-react';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { API_BASE_URL, buildApiUrlFromBase, getAssetUrl, getThumbnailUrl } from '@/lib/api';

interface MediaFolder {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  file_count?: number;
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
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(40);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modals
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showRenameFolderModal, setShowRenameFolderModal] = useState<string | null>(null);
  const [showRenameFileModal, setShowRenameFileModal] = useState<string | null>(null);
  const [showMoveFilesModal, setShowMoveFilesModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renameFolderName, setRenameFolderName] = useState('');
  const [renameFileName, setRenameFileName] = useState('');
  const [showUrlUploadModal, setShowUrlUploadModal] = useState(false);
  const [urlToUpload, setUrlToUpload] = useState('');
  const [urlUploading, setUrlUploading] = useState(false);

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [selectedFolder, page, pageSize, searchQuery, sortField, sortOrder]);

  // Dropzone for file upload
  const onDrop = useCallback((acceptedFiles: File[]) => {
    handleFileUpload(acceptedFiles);
  }, [selectedFolder]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    noClick: true,
  });

  const fetchFolders = async () => {
    try {
      const response = await fetch(buildApiUrlFromBase(API_BASE_URL, '/api/media/folders'), {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[fetchFolders] HTTP Error:', response.status, errorText);
        throw new Error(`Failed to fetch folders: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('[fetchFolders] Received data:', data);
      setFolders(data.folders || []);
    } catch (error: any) {
      console.error('[fetchFolders] Error:', error);
      toast.error('Failed to load folders: ' + error.message);
    }
  };

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('pageSize', String(pageSize));
      params.append('sortField', sortField);
      params.append('sortOrder', sortOrder);
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      
      // Only add folder_id if a specific folder is selected (not "All Files")
      if (selectedFolder !== null) {
        params.append('folder_id', selectedFolder);
        console.log('[fetchMedia] Filtering by folder:', selectedFolder);
      } else {
        console.log('[fetchMedia] Showing all files');
      }
      
      const response = await fetch(buildApiUrlFromBase(API_BASE_URL, `/api/media?${params}`), {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch media');

      const data = await response.json();
      const mediaFiles = Array.isArray(data) ? data : (data?.data || []);
      console.log('[fetchMedia] Loaded', mediaFiles.length, 'files');
      setMedia(mediaFiles);
      if (data?.total !== undefined) {
        setTotal(data.total);
      }
      if (data?.totalPages !== undefined) {
        setTotalPages(data.totalPages);
      } else if (data?.total !== undefined) {
        setTotalPages(Math.max(1, Math.ceil(data.total / pageSize)));
      }
    } catch (error: any) {
      console.error('Failed to fetch media:', error);
      toast.error('Failed to load media');
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: File[] | FileList | null) => {
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
        if (selectedFolder) {
          formData.append('folder_id', selectedFolder);
          console.log('[upload] Uploading to folder:', selectedFolder);
        } else {
          console.log('[upload] Uploading to root (no folder)');
        }

        const response = await fetch(buildApiUrlFromBase(API_BASE_URL, '/api/media/upload'), {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        if (!response.ok) {
          let errorMessage = `Failed to upload ${fileArray[i].name}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            // If response is not JSON, try to get text
            try {
              const errorText = await response.text();
              if (errorText) errorMessage = errorText;
            } catch (e2) {
              // Use default error message
            }
          }
          throw new Error(errorMessage);
        }
      }

      toast.success(`${fileArray.length} file(s) uploaded successfully!`);
      fetchMedia();
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlUpload = async () => {
    const trimmedUrl = urlToUpload.trim();
    if (!trimmedUrl) {
      toast.error('Vui lòng nhập URL ảnh hợp lệ');
      return;
    }

    try {
      new URL(trimmedUrl);
    } catch {
      toast.error('URL không hợp lệ');
      return;
    }

    setUrlUploading(true);
    setUploading(true);
    try {
      const response = await fetch(buildApiUrlFromBase(API_BASE_URL, '/api/media/upload/by-url'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ url: trimmedUrl, folder_id: selectedFolder }),
      });

      if (!response.ok) {
        let errorMessage = 'Không thể tải ảnh từ link';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          try {
            const errorText = await response.text();
            if (errorText) errorMessage = errorText;
          } catch {
            // ignore secondary errors
          }
        }
        throw new Error(errorMessage);
      }

      toast.success('Đã thêm ảnh từ link!');
      setShowUrlUploadModal(false);
      setUrlToUpload('');
      fetchMedia();
    } catch (error: any) {
      console.error('[handleUrlUpload] Error:', error);
      toast.error(error.message || 'Không thể tải ảnh');
    } finally {
      setUrlUploading(false);
      setUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const response = await fetch(buildApiUrlFromBase(API_BASE_URL, '/api/media/folders'), {
      method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: newFolderName, parent_id: selectedFolder }),
      });

      if (!response.ok) throw new Error('Failed to create folder');

      toast.success('Folder created successfully!');
      setNewFolderName('');
      setShowNewFolderModal(false);
      fetchFolders();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create folder');
    }
  };

  const handleRenameFolder = async (folderId: string) => {
    if (!renameFolderName.trim()) return;

    try {
      const response = await fetch(buildApiUrlFromBase(API_BASE_URL, `/api/media/folders/${folderId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: renameFolderName }),
      });

      if (!response.ok) throw new Error('Failed to rename folder');

      toast.success('Folder renamed successfully!');
      setRenameFolderName('');
      setShowRenameFolderModal(null);
      fetchFolders();
    } catch (error: any) {
      toast.error(error.message || 'Failed to rename folder');
    }
  };

  const handleRenameFile = async (fileId: string) => {
    const finalName = renameFileName.trim();
    if (!finalName) return;

    const fileToRename = media.find(m => m.id === fileId);
    const currentFileName = fileToRename?.file_name || fileToRename?.url.split('/').pop() || '';
    const fileExt = currentFileName.substring(currentFileName.lastIndexOf('.'));

    try {
      const response = await fetch(buildApiUrlFromBase(API_BASE_URL, `/api/media/${fileId}/rename`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ newName: finalName + fileExt }),
      });

      if (!response.ok) throw new Error('Failed to rename file');

      toast.success('File renamed successfully!');
      setRenameFileName('');
      setShowRenameFileModal(null);
      fetchMedia();
      fetchFolders(); // Update counts
    } catch (error: any) {
      toast.error(error.message || 'Failed to rename file');
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Delete this folder and all its contents?')) return;

    try {
      const response = await fetch(buildApiUrlFromBase(API_BASE_URL, `/api/media/folders/${folderId}`), {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete folder');

      toast.success('Folder deleted successfully!');
      if (selectedFolder === folderId) setSelectedFolder(null);
      fetchFolders();
      fetchMedia();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete folder');
    }
  };

  const handleDeleteFiles = async (fileIds: string[]) => {
    if (!confirm(`Delete ${fileIds.length} file(s)?`)) return;

    try {
      await Promise.all(
        fileIds.map(id =>
          fetch(buildApiUrlFromBase(API_BASE_URL, `/api/media/${id}`), {
            method: 'DELETE',
            credentials: 'include',
          })
        )
      );

      toast.success(`${fileIds.length} file(s) deleted successfully!`);
      setSelectedFiles(new Set());
      fetchMedia();
    } catch (error: any) {
      toast.error('Failed to delete files');
    }
  };

  const handleMoveFiles = async (targetFolderId: string | null) => {
    try {
      await Promise.all(
        Array.from(selectedFiles).map(id =>
          fetch(buildApiUrlFromBase(API_BASE_URL, `/api/media/${id}`), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ folder_id: targetFolderId }),
          })
        )
      );

      toast.success('Files moved successfully!');
      setSelectedFiles(new Set());
      setShowMoveFilesModal(false);
      fetchMedia();
    } catch (error: any) {
      toast.error('Failed to move files');
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
    setSelectedFiles(new Set(media.map((m) => m.id)));
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
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const paginatedMedia = useMemo(() => {
    return media;
  }, [media]);

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
            {folder.file_count !== undefined && folder.file_count > 0 && (
              <span className="text-xs text-muted-foreground bg-accent px-1.5 py-0.5 rounded">
                {folder.file_count}
              </span>
            )}
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
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Media Library</h1>
            <p className="text-sm text-muted-foreground">Manage your files and folders</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="file-upload" className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer">
            <Upload className="h-4 w-4" />
            Upload Files
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
            onClick={() => setShowUrlUploadModal(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Link2 className="h-4 w-4" />
            Thêm bằng link
          </button>
          <button
            onClick={() => setShowNewFolderModal(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <FolderPlus className="h-4 w-4" />
            New Folder
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden" {...getRootProps()}>
        <input {...getInputProps()} />
        
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
              <span className="text-sm font-medium">All Files</span>
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
                placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
        </div>
        <div className="flex items-center gap-2">
              {selectedFiles.size > 0 && (
                <>
                  <span className="text-sm text-muted-foreground">{selectedFiles.size} selected</span>
                  <button
                    onClick={() => setShowMoveFilesModal(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors text-sm"
                  >
                    <Move className="h-4 w-4" />
                    Move
                  </button>
                  <button
                    onClick={() => handleDeleteFiles(Array.from(selectedFiles))}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors text-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                  <button
                    onClick={deselectAll}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors text-sm"
                  >
                    Clear
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
                <p className="mt-2 text-sm text-muted-foreground">Uploading files...</p>
              </div>
            )}

            {isDragActive && (
              <div className="mb-4 p-8 rounded-lg border-2 border-dashed border-primary bg-primary/5 text-center">
                <Upload className="mx-auto h-12 w-12 text-primary mb-2" />
                <p className="text-lg font-medium text-primary">Drop files here to upload</p>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-muted-foreground">Loading media...</p>
              </div>
            ) : media.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-border p-12 text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-card-foreground mb-2">No files here</p>
                <p className="text-sm text-muted-foreground">Drag & drop files or click "Upload Files"</p>
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {media.map(asset => (
                      <div
                        key={asset.id}
                        className={`relative group rounded-lg border overflow-hidden transition-all ${
                          selectedFiles.has(asset.id)
                            ? 'border-primary ring-2 ring-primary'
                            : 'border-border hover:border-primary/50 hover:shadow-md'
                        }`}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          if (!selectedFiles.has(asset.id)) {
                            setSelectedFiles(new Set([asset.id]));
                          }
                          setContextMenu({ x: e.clientX, y: e.clientY, itemId: asset.id, type: 'file' });
                        }}
                      >
                        <div 
                          className="aspect-square overflow-hidden bg-muted cursor-pointer"
                          onClick={() => toggleFileSelection(asset.id)}
                        >
                          <img
                            src={getThumbnailUrl(asset) || getAssetUrl(asset.url)}
                            alt={asset.file_name || 'Media'}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                            onError={(e) => {
                              // Fallback to original URL if thumbnail fails
                              const target = e.target as HTMLImageElement;
                              if (target.src !== getAssetUrl(asset.url)) {
                                target.src = getAssetUrl(asset.url);
                              }
                            }}
                          />
                        </div>
                        <div className="p-2 text-xs truncate bg-card">
                          {asset.file_name || asset.url.split('/').pop()}
                        </div>
                        {selectedFiles.has(asset.id) && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg z-10">
                            <Check className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                        {/* Action buttons - show on hover */}
                        <div 
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20 pointer-events-none"
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setPreviewFile(asset);
                            }}
                            className="p-2 bg-background rounded-full hover:bg-primary hover:text-primary-foreground transition-colors shadow-lg pointer-events-auto"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              const fileName = asset.file_name || asset.url.split('/').pop() || '';
                              const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
                              setRenameFileName(nameWithoutExt);
                              setShowRenameFileModal(asset.id);
                            }}
                            className="p-2 bg-background rounded-full hover:bg-primary hover:text-primary-foreground transition-colors shadow-lg pointer-events-auto"
                            title="Rename"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleDeleteFiles([asset.id]);
                            }}
                            className="p-2 bg-background rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors shadow-lg pointer-events-auto"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
            </div>
          ) : (
                  <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
                    <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Preview</th>
                          <th 
                            className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:text-foreground select-none"
                            onClick={() => handleSort('name')}
                          >
                            <div className="flex items-center gap-1">
                              Name
                              {sortField === 'name' && (sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                            </div>
                          </th>
                          <th 
                            className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:text-foreground select-none"
                            onClick={() => handleSort('type')}
                          >
                            <div className="flex items-center gap-1">
                              Type
                              {sortField === 'type' && (sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                            </div>
                          </th>
                          <th 
                            className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:text-foreground select-none"
                            onClick={() => handleSort('size')}
                          >
                            <div className="flex items-center gap-1">
                              Size
                              {sortField === 'size' && (sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                            </div>
                          </th>
                          <th 
                            className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase cursor-pointer hover:text-foreground select-none"
                            onClick={() => handleSort('date')}
                          >
                            <div className="flex items-center gap-1">
                              Date
                              {sortField === 'date' && (sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />)}
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                      <tbody className="divide-y divide-border">
                        {media.map(asset => (
                          <tr
                            key={asset.id}
                            className={`transition-colors hover:bg-accent/30 ${selectedFiles.has(asset.id) ? 'bg-primary/10' : ''}`}
                          >
                            <td className="px-4 py-3">
                              <div 
                                className="cursor-pointer"
                                onClick={() => toggleFileSelection(asset.id)}
                              >
                                <img
                                  src={getThumbnailUrl(asset) || getAssetUrl(asset.url) || getAssetUrl(asset.thumb_url)}
                                  alt={asset.file_name || 'Media'}
                                  className={`h-10 w-10 object-cover rounded ${selectedFiles.has(asset.id) ? 'ring-2 ring-primary' : ''}`}
                                />
                              </div>
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewFile(asset);
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
                                  title="View"
                                >
                                  <Eye className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const fileName = asset.file_name || asset.url.split('/').pop() || '';
                                    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
                                    setRenameFileName(nameWithoutExt);
                                    setShowRenameFileModal(asset.id);
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors text-xs"
                                  title="Rename"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteFiles([asset.id]);
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors text-xs"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3 w-3" />
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

          {total > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 text-sm text-muted-foreground">
              <div>
                Showing {(page - 1) * pageSize + 1}-
                {Math.min(page * pageSize, total)} of {total} files
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span>Rows per page</span>
                  <select
                    value={pageSize}
                    onChange={(event) => {
                      setPageSize(Number(event.target.value));
                      setPage(1);
                    }}
                    className="rounded-md border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {[20, 40, 80, 120].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 rounded-md border border-input bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>
                  <span>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1 rounded-md border border-input bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
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
                  Preview
                </button>
                <button
                  onClick={() => {
                    const asset = media.find(m => m.id === contextMenu.itemId);
                    if (asset) {
                      navigator.clipboard.writeText(window.location.origin + asset.original_url);
                      toast.success('URL copied!');
                    }
                    setContextMenu(null);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy URL
                </button>
                <button
                  onClick={() => {
                    const asset = media.find(m => m.id === contextMenu.itemId);
                    if (asset) {
                      try {
                        if (!document.body) {
                          console.warn('document.body not available for download');
                          return;
                        }
                        
                        const link = document.createElement('a');
                        link.href = getAssetUrl(asset.url);
                        link.download = asset.file_name || 'download';
                        link.style.display = 'none';
                        link.style.position = 'absolute';
                        link.style.left = '-9999px';
                        
                        document.body.appendChild(link);
                        
                        // Trigger download
                        try {
                          link.click();
                        } catch (clickError) {
                          console.warn('Error clicking download link:', clickError);
                        }
                        
                        // Use setTimeout to ensure click completes before removal
                        setTimeout(() => {
                          try {
                            // Use modern remove() method if available
                            if (typeof link.remove === 'function') {
                              link.remove();
                            } else if (link.parentNode && document.body.contains(link)) {
                              // Fallback to removeChild with checks
                              const parent = link.parentNode;
                              if (parent && 
                                  typeof parent.removeChild === 'function' &&
                                  link.parentNode === parent &&
                                  parent.contains(link)) {
                                parent.removeChild(link);
                              }
                            }
                          } catch (e) {
                            // Silently ignore removal errors - element may already be removed
                            console.warn('Error removing download link:', e);
                          }
                        }, 200);
                      } catch (e) {
                        console.error('Error creating download link:', e);
                      }
                    }
                    setContextMenu(null);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
                <button
                  onClick={() => {
                    const asset = media.find(m => m.id === contextMenu.itemId);
                    if (asset) {
                      setRenameFileName(asset.file_name || '');
                      setShowRenameFileModal(contextMenu.itemId);
                    }
                    setContextMenu(null);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Rename
                </button>
                <button
                  onClick={() => {
                    setSelectedFiles(new Set([contextMenu.itemId]));
                    setShowMoveFilesModal(true);
                    setContextMenu(null);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
                >
                  <Move className="h-4 w-4" />
                  Move
                </button>
                <div className="border-t border-border my-1" />
                <button
                  onClick={() => {
                    handleDeleteFiles([contextMenu.itemId]);
                    setContextMenu(null);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
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
                  className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Rename
                </button>
                <div className="border-t border-border my-1" />
                <button
                  onClick={() => {
                    handleDeleteFolder(contextMenu.itemId);
                    setContextMenu(null);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
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
                src={getAssetUrl(previewFile.original_url) || getAssetUrl(previewFile.url)}
                alt={previewFile.file_name || 'Preview'}
                className="max-w-full h-auto mx-auto rounded-lg mb-4"
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium">{previewFile.format?.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Dimensions</p>
                  <p className="font-medium">{previewFile.width}x{previewFile.height}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Size</p>
                  <p className="font-medium">{previewFile.file_size ? `${(previewFile.file_size / 1024).toFixed(2)} KB` : '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Uploaded</p>
                  <p className="font-medium">{new Date(previewFile.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(getAssetUrl(previewFile.original_url) || getAssetUrl(previewFile.url));
                    toast.success('URL copied to clipboard!');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  Copy URL
                </button>
                <button
                  onClick={() => {
                    handleDeleteFiles([previewFile.id]);
                    setPreviewFile(null);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload via URL Modal */}
      {showUrlUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-md w-full">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <Link2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Thêm ảnh bằng link</h3>
                <p className="text-sm text-muted-foreground">
                  Dán URL ảnh (JPEG, PNG, GIF, WebP) công khai, truy cập trực tiếp. Ảnh sẽ được tải xuống và nén &lt;= 100KB tự động.
                </p>
              </div>
            </div>
            <input
              type="url"
              value={urlToUpload}
              onChange={(e) => setUrlToUpload(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background mt-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleUrlUpload();
                }
              }}
              autoFocus
            />
            <div className="flex gap-2 justify-end mt-4">
              <button
                onClick={() => {
                  setShowUrlUploadModal(false);
                  setUrlToUpload('');
                }}
                className="px-4 py-2 rounded-lg border border-input hover:bg-accent transition-colors"
                disabled={urlUploading}
              >
                Hủy
              </button>
              <button
                onClick={handleUrlUpload}
                disabled={!urlToUpload.trim() || urlUploading}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
              >
                {urlUploading && (
                  <span className="h-4 w-4 border-2 border-primary-foreground/60 border-t-transparent rounded-full animate-spin" />
                )}
                {urlUploading ? 'Đang tải...' : 'Tải ảnh'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Create New Folder</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background mb-4"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowNewFolderModal(false);
                  setNewFolderName('');
                }}
                className="px-4 py-2 rounded-lg border border-input hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Folder Modal */}
      {showRenameFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Rename Folder</h3>
            <input
              type="text"
              value={renameFolderName}
              onChange={(e) => setRenameFolderName(e.target.value)}
              placeholder="New folder name"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background mb-4"
              onKeyPress={(e) => e.key === 'Enter' && handleRenameFolder(showRenameFolderModal)}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowRenameFolderModal(null);
                  setRenameFolderName('');
                }}
                className="px-4 py-2 rounded-lg border border-input hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRenameFolder(showRenameFolderModal)}
                disabled={!renameFolderName.trim()}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename File Modal */}
      {showRenameFileModal && (() => {
        const fileToRename = media.find(m => m.id === showRenameFileModal);
        const currentFileName = fileToRename?.file_name || fileToRename?.url.split('/').pop() || '';
        const currentNameWithoutExt = currentFileName.replace(/\.[^/.]+$/, '');
        const displayName = renameFileName || currentNameWithoutExt;
        
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-card rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-bold mb-2">Rename File</h3>
              <p className="text-sm text-muted-foreground mb-4">Current: {currentFileName}</p>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setRenameFileName(e.target.value)}
                placeholder="New file name (without extension)"
                className="w-full px-3 py-2 rounded-lg border border-input bg-background mb-4"
                onKeyPress={(e) => e.key === 'Enter' && handleRenameFile(showRenameFileModal)}
                onFocus={(e) => {
                  if (!renameFileName && currentNameWithoutExt) {
                    setRenameFileName(currentNameWithoutExt);
                  }
                }}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowRenameFileModal(null);
                    setRenameFileName('');
                  }}
                  className="px-4 py-2 rounded-lg border border-input hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRenameFile(showRenameFileModal)}
                  disabled={!displayName.trim()}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Rename
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Move Files Modal */}
      {showMoveFilesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Move {selectedFiles.size} File(s)</h3>
            <div className="max-h-64 overflow-y-auto border border-border rounded-lg mb-4">
              <div
                onClick={() => handleMoveFiles(null)}
                className="px-4 py-2 hover:bg-accent cursor-pointer border-b border-border"
              >
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  <span className="font-medium">All Files (Root)</span>
                </div>
              </div>
              {folders.map(folder => (
                <div
                  key={folder.id}
                  onClick={() => handleMoveFiles(folder.id)}
                  className="px-4 py-2 hover:bg-accent cursor-pointer border-b border-border last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4" />
                    <span>{folder.name}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowMoveFilesModal(false)}
                className="px-4 py-2 rounded-lg border border-input hover:bg-accent transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
