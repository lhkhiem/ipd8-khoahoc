'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { X, Upload, Trash2, Image as ImageIcon, Folder, Link2 } from 'lucide-react';
import { buildApiUrl, getAssetUrl } from '@/lib/api';

interface Asset {
  id: string;
  url: string;
  thumb_url?: string;
  file_name?: string;
  width?: number;
  height?: number;
  format?: string;
  sizes?: any;
  folder_id?: string | null;
  created_at?: string;
  original_url?: string;
}

interface MediaFolder {
  id: string;
  name: string;
  parent_id: string | null;
  file_count?: number;
}

interface MediaPickerProps {
  value?: string | string[]; // Single ID or array of IDs
  onChange?: (value: string | string[]) => void;
  multiple?: boolean;
  label?: string;
  maxFiles?: number;
  previewSize?: number; // Size in pixels for preview thumbnails (default: 150)
  modalOnly?: boolean;
  // For CKEditor integration or SEO page (can return string URL or Asset object)
  isOpen?: boolean;
  onClose?: () => void;
  onSelect?: (imageUrl: string | Asset) => void;
}

export default function MediaPicker({
  value,
  onChange,
  multiple = false,
  label = 'Chọn hình ảnh',
  maxFiles = 10,
  previewSize = 150,
  modalOnly = false,
  // CKEditor mode
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  onSelect: externalOnSelect
}: MediaPickerProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Use external control if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalOnClose ? (value: boolean) => !value && externalOnClose() : setInternalIsOpen;
  
  // CKEditor mode (when onSelect is provided)
  const isCKEditorMode = !!externalOnSelect;
  // Modal-only mode (explicit prop or when isOpen is provided but no label/preview needed)
  const isModalOnlyMode = modalOnly || (externalIsOpen !== undefined && !label && !value);
  const [media, setMedia] = useState<Asset[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortField, setSortField] = useState<'name' | 'date' | 'size' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; itemId: string; type: 'file' | 'folder' } | null>(null);
  const [previewFile, setPreviewFile] = useState<Asset | null>(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameFileId, setRenameFileId] = useState<string | null>(null);
  const [renameFileName, setRenameFileName] = useState('');
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const [showUrlUploadModal, setShowUrlUploadModal] = useState(false);
  const [urlToUpload, setUrlToUpload] = useState('');
  const [urlUploading, setUrlUploading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const portalTarget = mounted ? document.body : null;

  // Fetch selected assets based on value prop
  useEffect(() => {
    let isMounted = true;
    
    console.log('MediaPicker value changed:', value);
    
    if (!value || (Array.isArray(value) && value.length === 0)) {
      if (isMounted) {
        setSelectedAssets([]);
      }
      return;
    }

    const ids = Array.isArray(value) ? value.filter(id => id) : [value];
    if (ids.length === 0) {
      if (isMounted) {
        setSelectedAssets([]);
      }
      return;
    }

    // Fetch assets by IDs
    const fetchAssets = async () => {
      try {
        console.log('Fetching assets for IDs:', ids);
        const promises = ids.map((id) =>
          axios
            .get(buildApiUrl(`/api/assets/${id}`), {
              withCredentials: true,
            })
            .then((res) => ({ status: 'fulfilled' as const, value: res.data as Asset }))
            .catch((error) => {
              console.warn(`Failed to fetch asset ${id}:`, error?.response?.status);
              return { status: 'rejected' as const };
            })
        );

        const settled = await Promise.all(promises);
        if (!isMounted) return;
        
        const assets = settled
          .filter((entry): entry is { status: 'fulfilled'; value: Asset } => entry.status === 'fulfilled')
          .map((entry) => entry.value);

        console.log('Fetched assets:', assets);
        setSelectedAssets(assets);
      } catch (error) {
        if (!isMounted) return;
        console.error('Failed to fetch assets:', error);
        // If fetch fails, just continue without selected assets preview
        setSelectedAssets([]);
      }
    };

    fetchAssets();
    
    return () => {
      isMounted = false;
    };
  }, [value]);

  // Refs để tránh fetch đồng thời và debounce
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef(false);
  
  // Track failed images để tránh retry liên tục
  const failedImagesRef = useRef<Set<string>>(new Set());
  
  // Handler để xử lý lỗi ảnh (404, etc.)
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    const src = img.src;
    
    // Đánh dấu ảnh này đã fail để tránh retry
    failedImagesRef.current.add(src);
    
    // Thay thế bằng placeholder hoặc ẩn ảnh
    img.style.display = 'none';
    // Hoặc có thể set một placeholder image
    // img.src = '/placeholder-image.png';
  }, []);

  const fetchFolders = useCallback(async () => {
    try {
      const response = await axios.get(buildApiUrl('/api/media/folders'), {
        withCredentials: true
      });
      const raw = response.data as any;
      if (Array.isArray(raw?.folders)) {
        setFolders(raw.folders as MediaFolder[]);
      } else if (Array.isArray(raw)) {
        setFolders(raw as MediaFolder[]);
      } else {
        setFolders([]);
      }
    } catch (error) {
      console.error('Failed to fetch folders:', error);
    }
  }, []);

  const fetchMedia = useCallback(async (currentPage: number, currentPageSize: number, currentFolderId: string | null, currentSearchQuery: string) => {
    // Tránh fetch đồng thời
    if (isFetchingRef.current) {
      return;
    }
    
    isFetchingRef.current = true;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(currentPage));
      params.append('pageSize', String(currentPageSize));
      if (currentFolderId !== null) {
        params.append('folder_id', currentFolderId);
      }
      if (currentSearchQuery.trim()) {
        params.append('search', currentSearchQuery.trim());
      }
      
      const response = await axios.get(buildApiUrl(`/api/media?${params}`), {
        withCredentials: true
      });
      const raw = response.data as any;
      const mediaFiles = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
      setMedia(mediaFiles as Asset[]);
      if (typeof raw?.total === 'number') {
        setTotal(raw.total);
      } else if (Array.isArray(raw)) {
        setTotal(raw.length);
      }
      if (typeof raw?.totalPages === 'number') {
        setTotalPages(raw.totalPages);
      } else if (typeof raw?.total === 'number') {
        setTotalPages(Math.max(1, Math.ceil(raw.total / currentPageSize)));
      } else if (Array.isArray(raw)) {
        setTotalPages(Math.max(1, Math.ceil(raw.length / currentPageSize)));
      }
    } catch (error) {
      console.error('Failed to fetch media:', error);
      setMedia([]);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Debounced search query state
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Debounce search query (300ms)
  useEffect(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    fetchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Reset page khi folder hoặc search thay đổi (nhưng không khi page thay đổi do user)
  useEffect(() => {
    if (isOpen) {
      setPage(1);
    }
  }, [selectedFolderId, isOpen, debouncedSearchQuery]);

  // Fetch folders and media when modal opens or dependencies change
  useEffect(() => {
    if (!isOpen) return;
    
    let isMounted = true;
    
    // Fetch folders ngay lập tức
    fetchFolders();
    
    // Fetch media với debounced search query
    fetchMedia(page, pageSize, selectedFolderId, debouncedSearchQuery);
    
    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedFolderId, page, pageSize, debouncedSearchQuery, fetchFolders, fetchMedia]);

  useEffect(() => {
    if (!isOpen) {
      setPage(1);
      setTotal(0);
      setTotalPages(1);
    }
  }, [isOpen]);

  const handleOpen = () => {
    if (externalIsOpen === undefined) {
      setInternalIsOpen(true);
      setPage(1);
    }
  };

  const handleClose = () => {
    // Reset folder selection when closing
    setSelectedFolderId(null);
    setSearchQuery('');
    setPage(1);
    setTotal(0);
    setTotalPages(1);
    setShowNewFolderModal(false);
    setNewFolderName('');
    
    if (externalOnClose) {
      externalOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const handleSelect = (asset: Asset) => {
    // CKEditor mode - insert image URL
    if (isCKEditorMode && externalOnSelect) {
      const imageUrl = getAssetUrl(asset.sizes?.medium?.url || asset.url);
      externalOnSelect(imageUrl);
      if (externalOnClose) externalOnClose();
      return;
    }
    
    // If onSelect is provided (e.g., from SEO page), call it with asset object
    if (externalOnSelect) {
      externalOnSelect(asset);
      if (externalOnClose) externalOnClose();
      return;
    }
    
    // Normal mode - select asset ID(s)
    if (!onChange) return;
    
    if (multiple) {
      const currentIds = Array.isArray(value) ? value : [];
      const isSelected = currentIds.includes(asset.id);
      
      if (isSelected) {
        const newIds = currentIds.filter(id => id !== asset.id);
        onChange(newIds);
      } else {
        if (currentIds.length < maxFiles) {
          onChange([...currentIds, asset.id]);
        }
      }
    } else {
      onChange(asset.id);
      handleClose();
    }
  };

  const handleRemove = (assetId: string) => {
    if (!onChange) return;
    
    if (multiple) {
      const currentIds = Array.isArray(value) ? value : [];
      onChange(currentIds.filter(id => id !== assetId));
    } else {
      onChange('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
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
      alert(`File quá lớn (giới hạn 100MB): ${oversizedFiles.join(', ')}`);
      e.target.value = ''; // Reset input
      return;
    }

    // Show warning for large files
    if (largeFiles.length > 0) {
      const proceed = window.confirm(
        `Cảnh báo: Các file sau có dung lượng >= 10MB sẽ được nén và chuyển đổi sang .webp:\n${largeFiles.join('\n')}\n\nBạn có muốn tiếp tục?`
      );
      if (!proceed) {
        e.target.value = ''; // Reset input
        return;
      }
    }

    setUploading(true);
    try {
      for (const file of fileArray) {
        const formData = new FormData();
        formData.append('file', file);
        if (selectedFolderId) {
          formData.append('folder_id', selectedFolderId);
        }

        try {
          await axios.post(buildApiUrl('/api/media/upload'), formData, {
            withCredentials: true,
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            maxContentLength: 100 * 1024 * 1024, // 100MB
            maxBodyLength: 100 * 1024 * 1024, // 100MB
          });
        } catch (axiosError: any) {
          const errorMessage = axiosError.response?.data?.error || 
                              axiosError.message || 
                              'Upload failed';
          throw new Error(errorMessage);
        }
      }

      // Refresh media list and folders
      fetchFolders();
      fetchMedia(page, pageSize, selectedFolderId, debouncedSearchQuery);
    } catch (error: any) {
      console.error('Failed to upload files:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Upload failed';
      alert(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleUrlUpload = async () => {
    const trimmedUrl = urlToUpload.trim();
    if (!trimmedUrl) {
      alert('Vui lòng nhập URL ảnh hợp lệ');
      return;
    }

    try {
      new URL(trimmedUrl);
    } catch {
      alert('URL không hợp lệ');
      return;
    }

    setUrlUploading(true);
    setUploading(true);
    try {
      const response = await axios.post(
        buildApiUrl('/api/media/upload/by-url'),
        {
          url: trimmedUrl,
          folder_id: selectedFolderId || null,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      if (response.status !== 200 && response.status !== 201) {
        throw new Error('Không thể tải ảnh từ link');
      }

      setShowUrlUploadModal(false);
      setUrlToUpload('');
      fetchFolders();
      fetchMedia(page, pageSize, selectedFolderId, debouncedSearchQuery);
    } catch (error: any) {
      console.error('[handleUrlUpload] Error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Không thể tải ảnh';
      alert(errorMessage);
    } finally {
      setUrlUploading(false);
      setUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      return;
    }

    try {
      const response = await axios.post(
        buildApiUrl('/api/media/folders'),
        {
          name: newFolderName.trim(),
          parent_id: selectedFolderId || null,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        },
      );

      setNewFolderName('');
      setShowNewFolderModal(false);
      if (selectedFolderId) {
        setExpandedFolders((prev) => {
          const next = new Set(prev);
          next.add(selectedFolderId);
          return next;
        });
      }
      const createdFolderId = response.data?.folder?.id as string | undefined;
      if (createdFolderId) {
        setSelectedFolderId(createdFolderId);
      }
      await fetchFolders();
      await fetchMedia(page, pageSize, selectedFolderId, debouncedSearchQuery);
    } catch (error) {
      console.error('Failed to create folder:', error);
      alert('Failed to create folder. Please try again.');
    }
  };

  const toggleOperationalSelection = (assetId: string) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(assetId)) {
        next.delete(assetId);
      } else {
        next.add(assetId);
      }
      return next;
    });
  };

  const clearOperationalSelection = () => {
    setSelectedFiles(new Set());
  };

  const handleRenameFile = async () => {
    if (!renameFileId || !renameFileName.trim()) {
      return;
    }
    try {
      await axios.post(
        buildApiUrl(`/api/media/${renameFileId}/rename`),
        { newName: renameFileName.trim() },
        { withCredentials: true },
      );
      setRenameFileId(null);
      setRenameFileName('');
      setShowRenameModal(false);
      await fetchMedia(page, pageSize, selectedFolderId, debouncedSearchQuery);
      await fetchFolders();
    } catch (error) {
      console.error('Failed to rename file:', error);
      alert('Failed to rename file.');
    }
  };

  const handleDeleteFiles = async (fileIds: string[]) => {
    if (!fileIds.length) return;
    if (!confirm(`Delete ${fileIds.length} file(s)?`)) return;
    try {
      await Promise.all(
        fileIds.map((id) =>
          axios.delete(buildApiUrl(`/api/media/${id}`), {
            withCredentials: true,
          }),
        ),
      );
      clearOperationalSelection();
      await fetchMedia(page, pageSize, selectedFolderId, debouncedSearchQuery);
      await fetchFolders();
    } catch (error) {
      console.error('Failed to delete files:', error);
      alert('Failed to delete files.');
    }
  };

  const handleMoveFiles = async (targetFolderId: string | null) => {
    if (!selectedFiles.size) return;
    try {
      await Promise.all(
        Array.from(selectedFiles).map((id) =>
          axios.put(
            buildApiUrl(`/api/media/${id}`),
            { folder_id: targetFolderId },
            { withCredentials: true },
          ),
        ),
      );
      clearOperationalSelection();
      setShowMoveModal(false);
      await fetchMedia(page, pageSize, selectedFolderId, debouncedSearchQuery);
      await fetchFolders();
    } catch (error) {
      console.error('Failed to move files:', error);
      alert('Failed to move files.');
    }
  };

  const currentIds = Array.isArray(value) ? value : (value ? [value] : []);

  const handleMediaTileClick = (asset: Asset, event: React.MouseEvent) => {
    if (event.shiftKey || event.ctrlKey || event.metaKey) {
      event.preventDefault();
      toggleOperationalSelection(asset.id);
      return;
    }
    handleSelect(asset);
  };

  const renderMediaPreview = (asset: Asset, isSelected: boolean) => (
    <div
      key={asset.id}
      className={`relative group rounded-lg border-2 overflow-hidden aspect-square cursor-pointer transition-all ${
        isSelected ? 'border-primary ring-2 ring-primary' : 'border-border hover:border-primary/50'
      }`}
      onClick={(event) => handleMediaTileClick(asset, event)}
      onContextMenu={(event) => {
        event.preventDefault();
        if (!selectedFiles.has(asset.id)) {
          setSelectedFiles(new Set([asset.id]));
        }
        setContextMenu({ x: event.clientX, y: event.clientY, itemId: asset.id, type: 'file' });
      }}
    >
      <img
        src={getAssetUrl(asset.sizes?.thumb?.url || asset.thumb_url || asset.url)}
        alt={asset.file_name || 'Media'}
        className="w-full h-full object-cover"
        onError={handleImageError}
        loading="lazy"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent text-white text-xs px-2 py-1 truncate">
        {asset.file_name || asset.url.split('/').pop()}
      </div>
      {isSelected && (
        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
            ✓
          </div>
        </div>
      )}
    </div>
  );

  const sortedMedia = useMemo(() => {
    const data = [...media];
    data.sort((a, b) => {
      let aVal: any = 0;
      let bVal: any = 0;
      switch (sortField) {
        case 'name':
          aVal = (a.file_name || a.url).toLowerCase();
          bVal = (b.file_name || b.url).toLowerCase();
          break;
        case 'size':
          aVal = a.width && a.height ? a.width * a.height : 0;
          bVal = b.width && b.height ? b.width * b.height : 0;
          break;
        case 'type':
          aVal = a.format || '';
          bVal = b.format || '';
          break;
        case 'date':
        default:
          aVal = new Date(a.created_at ?? 0).getTime();
          bVal = new Date(b.created_at ?? 0).getTime();
          break;
      }
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [media, sortField, sortOrder]);

  const folderTree = useMemo(() => {
    const buildTree = (parentId: string | null): (MediaFolder & { children: MediaFolder[] })[] => {
      return folders
        .filter((folder) => folder.parent_id === parentId)
        .map((folder) => ({
          ...folder,
          children: buildTree(folder.id),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    };

    return buildTree(null);
  }, [folders]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const renderFolderTree = (nodes: (MediaFolder & { children: MediaFolder[] })[], level = 0) => {
    return nodes.map((folder) => {
      const isExpanded = expandedFolders.has(folder.id);
      const isSelected = selectedFolderId === folder.id;
      const hasChildren = folder.children.length > 0;

      return (
        <div key={folder.id}>
          <button
            type="button"
            onClick={() => setSelectedFolderId(folder.id)}
            className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            }`}
            style={{ paddingLeft: `${level * 16 + 12}px` }}
          >
            {hasChildren ? (
              <span
                role="button"
                className="w-4 h-4 flex items-center justify-center rounded hover:bg-accent/60"
                onClick={(event) => {
                  event.stopPropagation();
                  toggleFolder(folder.id);
                }}
              >
                {isExpanded ? '▾' : '▸'}
              </span>
            ) : (
              <span className="w-4" />
            )}
            <Folder className="w-4 h-4" />
            <span className="flex-1 truncate">{folder.name}</span>
            {folder.file_count !== undefined && (
              <span className="text-xs opacity-60">{folder.file_count}</span>
            )}
          </button>
          {hasChildren && isExpanded && renderFolderTree(folder.children, level + 1)}
        </div>
      );
    });
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const copyUrlToClipboard = (asset: Asset) => {
    try {
      navigator.clipboard.writeText(getAssetUrl(asset.original_url || asset.url));
      alert('URL copied to clipboard');
    } catch (error) {
      console.error('Failed to copy URL:', error);
      alert('Failed to copy URL');
    }
  };

  // In modal-only mode, only render the modal, nothing else
  if (isModalOnlyMode) {
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <div className="bg-card border border-border rounded-lg shadow-lg flex flex-col w-full max-w-7xl h-full max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="text-lg font-semibold">Thư viện Media</h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setNewFolderName('');
                      setShowNewFolderModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 border border-input rounded-md text-sm hover:bg-accent transition-colors"
                  >
                    <Folder className="w-4 h-4" />
                    Thư mục mới
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUrlUploadModal(true)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 border border-input rounded-md text-sm hover:bg-accent transition-colors"
                  >
                    <Link2 className="w-4 h-4" />
                    Thêm bằng link
                  </button>
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors text-sm">
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Đang tải lên...' : 'Tải lên'}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      onClick={(e) => e.stopPropagation()}
                      disabled={uploading}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="p-1.5 hover:bg-muted rounded-md transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content with Sidebar */}
              <div className="flex-1 flex overflow-hidden">
                {/* Folders Sidebar */}
                <div className="w-56 border-r border-border bg-muted/30 overflow-y-auto p-3 space-y-1">
                  <button
                    type="button"
                    onClick={() => setSelectedFolderId(null)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
                      selectedFolderId === null
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    Tất cả file
                  </button>
                  {renderFolderTree(folderTree)}
                </div>

                {/* Media Grid */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Tìm kiếm file..."
                        value={searchQuery}
                        onChange={(event) => {
                          setSearchQuery(event.target.value);
                          setPage(1);
                        }}
                        className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setViewMode('grid')}
                          className={`p-2 rounded-md border ${
                            viewMode === 'grid'
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-input hover:bg-accent'
                          }`}
                        >
                          Lưới
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode('list')}
                          className={`p-2 rounded-md border ${
                            viewMode === 'list'
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-input hover:bg-accent'
                          }`}
                        >
                          Danh sách
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto min-h-0">
                    {loading ? (
                      <div className="flex items-center justify-center h-64 text-muted-foreground">
                        Đang tải...
                      </div>
                    ) : sortedMedia.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                        <p>Chưa có file media</p>
                        <p className="text-sm">Tải lên một số hình ảnh để bắt đầu</p>
                      </div>
                    ) : viewMode === 'grid' ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {sortedMedia.map((asset) => {
                          const isSelected = currentIds.includes(asset.id);
                          return (
                            <button
                              key={asset.id}
                              type="button"
                              onClick={() => handleSelect(asset)}
                              className={`relative group rounded-lg border-2 overflow-hidden aspect-square cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-primary ring-2 ring-primary'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <img
                                src={getAssetUrl(asset.sizes?.thumb?.url || asset.thumb_url || asset.url)}
                                alt={asset.file_name || 'Media'}
                                className="w-full h-full object-cover"
                                onError={handleImageError}
                                loading="lazy"
                              />
                              {isSelected && (
                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                                    ✓
                                  </div>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
                        <table className="min-w-full divide-y divide-border">
                          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                            <tr>
                              <th className="px-4 py-2 text-left">Xem trước</th>
                              <th
                                className="px-4 py-2 text-left cursor-pointer hover:text-foreground"
                                onClick={() => handleSort('name')}
                              >
                                Tên {sortField === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
                              </th>
                              <th
                                className="px-4 py-2 text-left cursor-pointer hover:text-foreground"
                                onClick={() => handleSort('date')}
                              >
                                Ngày {sortField === 'date' && (sortOrder === 'asc' ? '▲' : '▼')}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border text-sm">
                            {sortedMedia.map((asset) => (
                              <tr
                                key={asset.id}
                                className="hover:bg-muted/30 cursor-pointer"
                                onClick={() => handleSelect(asset)}
                              >
                                <td className="px-4 py-2">
                                  <img
                                    src={getAssetUrl(asset.sizes?.thumb?.url || asset.thumb_url || asset.url)}
                                    alt={asset.file_name || 'Media'}
                                    className="h-10 w-10 object-cover rounded"
                                    onError={handleImageError}
                                    loading="lazy"
                                  />
                                </td>
                                <td className="px-4 py-2 truncate">{asset.file_name || asset.url.split('/').pop()}</td>
                                <td className="px-4 py-2 text-muted-foreground">
                                  {new Date(asset.created_at ?? 0).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-muted-foreground pt-4 border-t border-border">
                    <div>
                      Showing {(page - 1) * pageSize + 1}–
                      {Math.min(page * pageSize, total)} of {total} files
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
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
                        type="button"
                        onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={page >= totalPages}
                        className="px-3 py-1 rounded-md border border-input bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              {multiple && (
                <div className="p-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {currentIds.length} / {maxFiles} selected
                    </div>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      Xong
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modals for isModalOnlyMode */}
        {portalTarget && showNewFolderModal
          ? createPortal(
            <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/60 p-4">
              <div className="bg-card rounded-lg border border-border shadow-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">Thư mục mới</h3>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(event) => setNewFolderName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleCreateFolder();
                    }
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Tên thư mục"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewFolderModal(false);
                      setNewFolderName('');
                    }}
                    className="px-4 py-2 rounded-md border border-input hover:bg-accent"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateFolder}
                    disabled={!newFolderName.trim()}
                    className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
            , portalTarget)
          : null}

        {portalTarget && showUrlUploadModal
          ? createPortal(
            <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/60 p-4">
              <div className="bg-card rounded-lg border border-border shadow-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">Thêm bằng link</h3>
                <input
                  type="text"
                  value={urlToUpload}
                  onChange={(event) => setUrlToUpload(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleUrlUpload();
                    }
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Nhập URL hình ảnh..."
                  disabled={urlUploading}
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUrlUploadModal(false);
                      setUrlToUpload('');
                    }}
                    disabled={urlUploading}
                    className="px-4 py-2 rounded-md border border-input hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleUrlUpload}
                    disabled={!urlToUpload.trim() || urlUploading}
                    className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {urlUploading ? 'Đang tải...' : 'Thêm'}
                  </button>
                </div>
              </div>
            </div>
            , portalTarget)
          : null}
      </>
    );
  }

  return (
    <div className="space-y-2">
      {/* Only show preview and button in normal mode, not CKEditor mode */}
      {!isCKEditorMode && !isModalOnlyMode && label && (
        <label className="text-sm font-medium text-foreground">
          {label}
          {multiple && maxFiles && ` (Max: ${maxFiles})`}
        </label>
      )}

      {/* Selected Images Preview */}
      {!isCKEditorMode && !isModalOnlyMode && selectedAssets.length > 0 && (
        <div className={`flex flex-wrap gap-3 ${multiple ? '' : `max-w-[${previewSize}px]`}`}>
          {selectedAssets.map((asset) => (
            <div 
              key={asset.id} 
              className="relative group rounded-lg border border-border overflow-hidden" 
              style={{ width: `${previewSize}px`, height: `${previewSize}px` }}
            >
              <img
                src={getAssetUrl(asset.sizes?.thumb?.url || asset.thumb_url || asset.url)}
                alt={asset.file_name || 'Selected'}
                className="w-full h-full object-cover"
                onError={handleImageError}
                loading="lazy"
              />
              <button
                type="button"
                onClick={() => handleRemove(asset.id)}
                className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Select Button - Only in normal mode */}
      {!isCKEditorMode && !isModalOnlyMode && (!multiple || (multiple && currentIds.length < maxFiles)) && (
        <button
          type="button"
          onClick={handleOpen}
          className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors"
        >
          <ImageIcon className="w-4 h-4" />
          {selectedAssets.length > 0 
            ? (multiple ? 'Thêm hình ảnh' : 'Đổi hình ảnh')
            : 'Chọn hình ảnh'
          }
        </button>
      )}

      {/* Media Library Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-lg shadow-lg flex flex-col w-full max-w-7xl h-full max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold">Media Library</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setNewFolderName('');
                    setShowNewFolderModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 border border-input rounded-md text-sm hover:bg-accent transition-colors"
                >
                  <Folder className="w-4 h-4" />
                  New Folder
                </button>
                <button
                  type="button"
                  onClick={() => setShowUrlUploadModal(true)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 border border-input rounded-md text-sm hover:bg-accent transition-colors"
                >
                  <Link2 className="w-4 h-4" />
                  Thêm bằng link
                </button>
                <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors text-sm">
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Upload'}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    onClick={(e) => e.stopPropagation()}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 hover:bg-accent rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content with Sidebar */}
            <div className="flex-1 flex overflow-hidden">
              {/* Folder Sidebar */}
              <div className="w-56 border-r border-border bg-muted/30 overflow-y-auto p-3 space-y-1">
                <button
                  type="button"
                  onClick={() => setSelectedFolderId(null)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
                    selectedFolderId === null
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  All Files
                </button>
                {renderFolderTree(folderTree)}
              </div>

              {/* Media Grid */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Search files..."
                      value={searchQuery}
                      onChange={(event) => {
                        setSearchQuery(event.target.value);
                        setPage(1);
                      }}
                      className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <div className="flex items-center gap-2">
                  <button
                    type="button"
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md border ${
                          viewMode === 'grid'
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-input hover:bg-accent'
                    }`}
                  >
                        Grid
                  </button>
                      <button
                        type="button"
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md border ${
                          viewMode === 'list'
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-input hover:bg-accent'
                        }`}
                      >
                        List
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Rows</span>
                    <select
                      value={pageSize}
                      onChange={(event) => {
                        setPageSize(Number(event.target.value));
                        setPage(1);
                      }}
                      className="rounded-md border border-input bg-background px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {[20, 30, 40, 60].map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0">
                  {loading ? (
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                      Loading...
                    </div>
                  ) : sortedMedia.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                      <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                      <p>No media files yet</p>
                      <p className="text-sm">Upload some images to get started</p>
                    </div>
                  ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {sortedMedia.map((asset) => renderMediaPreview(asset, currentIds.includes(asset.id)))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
                      <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                          <tr>
                            <th className="px-4 py-2 text-left w-12">
                              <input
                                type="checkbox"
                                checked={selectedFiles.size === sortedMedia.length && sortedMedia.length > 0}
                                onChange={(event) =>
                                  event.target.checked
                                    ? setSelectedFiles(new Set(sortedMedia.map((item) => item.id)))
                                    : clearOperationalSelection()
                                }
                                className="w-4 h-4"
                              />
                            </th>
                            <th className="px-4 py-2 text-left">Preview</th>
                            <th
                              className="px-4 py-2 text-left cursor-pointer hover:text-foreground"
                              onClick={() => handleSort('name')}
                            >
                              Name {sortField === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
                            </th>
                            <th
                              className="px-4 py-2 text-left cursor-pointer hover:text-foreground"
                              onClick={() => handleSort('type')}
                            >
                              Type {sortField === 'type' && (sortOrder === 'asc' ? '▲' : '▼')}
                            </th>
                            <th
                              className="px-4 py-2 text-left cursor-pointer hover:text-foreground"
                              onClick={() => handleSort('size')}
                            >
                              Size {sortField === 'size' && (sortOrder === 'asc' ? '▲' : '▼')}
                            </th>
                            <th
                              className="px-4 py-2 text-left cursor-pointer hover:text-foreground"
                              onClick={() => handleSort('date')}
                            >
                              Date {sortField === 'date' && (sortOrder === 'asc' ? '▲' : '▼')}
                            </th>
                            <th className="px-4 py-2 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-sm">
                          {sortedMedia.map((asset) => (
                            <tr key={asset.id} className="hover:bg-muted/30">
                              <td className="px-4 py-2">
                                <input
                                  type="checkbox"
                                  checked={selectedFiles.has(asset.id)}
                                  onChange={() => toggleOperationalSelection(asset.id)}
                                  className="w-4 h-4"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <img
                                  src={getAssetUrl(asset.sizes?.thumb?.url || asset.thumb_url || asset.url)}
                                  alt={asset.file_name || 'Media'}
                                  className="h-10 w-10 object-cover rounded"
                                  onError={handleImageError}
                                  loading="lazy"
                                />
                              </td>
                              <td className="px-4 py-2 truncate">{asset.file_name || asset.url.split('/').pop()}</td>
                              <td className="px-4 py-2 uppercase text-muted-foreground">{asset.format}</td>
                              <td className="px-4 py-2 text-muted-foreground">
                                {asset.width && asset.height ? `${asset.width}×${asset.height}` : '—'}
                              </td>
                              <td className="px-4 py-2 text-muted-foreground">
                                {new Date(asset.created_at ?? 0).toLocaleString()}
                              </td>
                              <td className="px-4 py-2">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setPreviewFile(asset)}
                                    className="text-xs px-2 py-1 rounded-md border border-input hover:bg-accent"
                                  >
                                    Xem trước
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => copyUrlToClipboard(asset)}
                                    className="text-xs px-2 py-1 rounded-md border border-input hover:bg-accent"
                                  >
                                    Sao chép URL
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.preventDefault();
                                      if (!selectedFiles.has(asset.id)) {
                                        setSelectedFiles(new Set([asset.id]));
                                      }
                                      setContextMenu({
                                        x: event.clientX,
                                        y: event.clientY,
                                        itemId: asset.id,
                                        type: 'file',
                                      });
                                    }}
                                    className="text-xs px-2 py-1 rounded-md border border-input hover:bg-accent"
                                  >
                                    More
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-muted-foreground pt-4 border-t border-border">
                  <div>
                    Showing {(page - 1) * pageSize + 1}–
                    {Math.min(page * pageSize, total)} of {total} files
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
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
                      type="button"
                      onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={page >= totalPages}
                      className="px-3 py-1 rounded-md border border-input bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            {multiple && (
              <div className="p-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {currentIds.length} / {maxFiles} selected
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {portalTarget && contextMenu
        ? createPortal(
        <>
          <div className="fixed inset-0 z-[70]" onClick={() => setContextMenu(null)} />
          <div
            className="fixed z-[71] bg-card border border-border rounded-lg shadow-lg py-1 text-sm"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              type="button"
              onClick={() => {
                const asset = sortedMedia.find((item) => item.id === contextMenu.itemId);
                if (asset) setPreviewFile(asset);
                setContextMenu(null);
              }}
              className="block w-full px-4 py-2 text-left hover:bg-accent"
            >
              Preview
            </button>
            <button
              type="button"
              onClick={() => {
                const asset = sortedMedia.find((item) => item.id === contextMenu.itemId);
                if (asset) {
                  const key = asset.folder_id || null;
                  setSelectedFolderId(key);
                }
                setContextMenu(null);
              }}
              className="block w-full px-4 py-2 text-left hover:bg-accent"
            >
              Go to Folder
            </button>
            <button
              type="button"
              onClick={() => {
                const asset = sortedMedia.find((item) => item.id === contextMenu.itemId);
                if (asset) copyUrlToClipboard(asset);
                setContextMenu(null);
              }}
              className="block w-full px-4 py-2 text-left hover:bg-accent"
            >
              Copy URL
            </button>
            <button
              type="button"
              onClick={() => {
                const asset = sortedMedia.find((item) => item.id === contextMenu.itemId);
                if (asset) {
                  setRenameFileId(asset.id);
                  setRenameFileName(asset.file_name || asset.url.split('/').pop() || '');
                  setShowRenameModal(true);
                }
                setContextMenu(null);
              }}
              className="block w-full px-4 py-2 text-left hover:bg-accent"
            >
              Đổi tên
            </button>
            <button
              type="button"
              onClick={() => {
                if (!selectedFiles.has(contextMenu.itemId)) {
                  setSelectedFiles(new Set([contextMenu.itemId]));
                }
                setShowMoveModal(true);
                setContextMenu(null);
              }}
              className="block w-full px-4 py-2 text-left hover:bg-accent"
            >
              Di chuyển
            </button>
            <div className="border-t border-border my-1" />
            <button
              type="button"
              onClick={() => {
                const ids = selectedFiles.size ? Array.from(selectedFiles) : [contextMenu.itemId];
                handleDeleteFiles(ids);
                setContextMenu(null);
              }}
              className="block w-full px-4 py-2 text-left text-destructive hover:bg-destructive/10"
            >
              Xóa
            </button>
          </div>
        </>
        , portalTarget)
        : null}

      {portalTarget && previewFile
        ? createPortal(
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-6" onClick={() => setPreviewFile(null)}>
          <div className="relative bg-card rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewFile(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-background hover:bg-accent"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">{previewFile.file_name || previewFile.url.split('/').pop()}</h3>
              <img
                src={getAssetUrl(previewFile.original_url || previewFile.url)}
                alt={previewFile.file_name || 'Xem trước'}
                className="w-full h-auto rounded-lg"
                onError={handleImageError}
                loading="lazy"
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Loại</p>
                  <p className="font-medium">{previewFile.format?.toUpperCase() || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Kích thước</p>
                  <p className="font-medium">{previewFile.width && previewFile.height ? `${previewFile.width}×${previewFile.height}` : '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Thư mục</p>
                  <p className="font-medium">{previewFile.folder_id || 'Root'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Đã tải lên</p>
                  <p className="font-medium">{new Date(previewFile.created_at ?? 0).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => copyUrlToClipboard(previewFile)}
                  className="px-4 py-2 rounded-md border border-input hover:bg-accent"
                >
                  Copy URL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteFiles([previewFile.id]);
                    setPreviewFile(null);
                  }}
                  className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
        , portalTarget)
        : null}

      {portalTarget && showRenameModal
        ? createPortal(
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card rounded-lg border border-border shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Đổi tên file</h3>
            <input
              type="text"
              value={renameFileName}
              onChange={(event) => setRenameFileName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleRenameFile();
                }
              }}
              className="w-full rounded-md border border-input bg-background px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Tên file"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowRenameModal(false);
                  setRenameFileId(null);
                  setRenameFileName('');
                }}
                className="px-4 py-2 rounded-md border border-input hover:bg-accent"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRenameFile}
                disabled={!renameFileName.trim()}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Đổi tên
              </button>
            </div>
          </div>
        </div>
        , portalTarget)
        : null}

      {portalTarget && showNewFolderModal
        ? createPortal(
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card rounded-lg border border-border shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Thư mục mới</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(event) => setNewFolderName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleCreateFolder();
                }
              }}
              className="w-full rounded-md border border-input bg-background px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Tên thư mục"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowNewFolderModal(false);
                  setNewFolderName('');
                }}
                className="px-4 py-2 rounded-md border border-input hover:bg-accent"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
        , portalTarget)
        : null}

      {portalTarget && showMoveModal
        ? createPortal(
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card rounded-lg border border-border shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Di chuyển {selectedFiles.size} file</h3>
            <div className="max-h-64 overflow-y-auto border border-border rounded-lg mb-4">
              <button
                type="button"
                onClick={() => handleMoveFiles(null)}
                className="w-full text-left px-4 py-2 border-b border-border hover:bg-accent text-sm"
              >
                Root (All Files)
              </button>
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => handleMoveFiles(folder.id)}
                  className="w-full text-left px-4 py-2 border-b border-border hover:bg-accent text-sm"
                >
                  {folder.name}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowMoveModal(false)}
                className="px-4 py-2 rounded-md border border-input hover:bg-accent"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
        , portalTarget)
        : null}

      {portalTarget && showUrlUploadModal
        ? createPortal(
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-card rounded-lg border border-border shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Thêm bằng link</h3>
            <input
              type="text"
              value={urlToUpload}
              onChange={(event) => setUrlToUpload(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleUrlUpload();
                }
              }}
              className="w-full rounded-md border border-input bg-background px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Nhập URL ảnh..."
              disabled={urlUploading}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowUrlUploadModal(false);
                  setUrlToUpload('');
                }}
                disabled={urlUploading}
                className="px-4 py-2 rounded-md border border-input hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUrlUpload}
                disabled={!urlToUpload.trim() || urlUploading}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {urlUploading ? 'Đang tải...' : 'Thêm'}
              </button>
            </div>
          </div>
        </div>
        , portalTarget)
        : null}

    </div>
  );
}
