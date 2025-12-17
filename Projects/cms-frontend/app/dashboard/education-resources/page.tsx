'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, ArrowLeft, Search, ArrowUpDown, ArrowUp, ArrowDown, Pencil, Trash2, Grid, List, Calendar, BookOpen, Video, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { buildApiUrl, buildBackendUrl } from '@/lib/api';

interface EducationResource {
  id: string;
  title: string;
  description?: string | null;
  image_url: string;
  link_url: string;
  link_text?: string | null;
  duration?: string | null;
  ceus?: string | null;
  level?: string | null;
  resource_type?: string | null;
  is_featured: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

type SortField = 'title' | 'resource_type' | 'level' | 'created_at' | 'sort_order';
type SortOrder = 'asc' | 'desc';

export default function EducationResourcesPage() {
  const [resources, setResources] = useState<EducationResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('sort_order');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [pageSize, setPageSize] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const router = useRouter();

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl('/api/homepage/education-resources'), {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch education resources');
      }
      
      const data = await response.json();
      const items = data?.data || [];
      setResources(items);
    } catch (error) {
      console.error('Failed to fetch education resources:', error);
      toast.error('Failed to load education resources');
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const response = await fetch(buildApiUrl(`/api/homepage/education-resources/${id}`), {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete resource');
      }
      
      toast.success('Resource deleted successfully');
      setResources(prevResources => prevResources.filter(r => r.id !== id));
    } catch (error) {
      console.error('Failed to delete resource:', error);
      toast.error('Failed to delete resource');
    }
  };

  const handleStatusChange = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(buildApiUrl(`/api/homepage/education-resources/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_active: isActive }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      toast.success(`Resource ${isActive ? 'activated' : 'deactivated'}`);
      setResources(prevResources => 
        prevResources.map(r => r.id === id ? { ...r, is_active: isActive } : r)
      );
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Filter and sort resources
  const filteredAndSortedResources = useMemo(() => {
    let filtered = resources.filter(resource => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        resource.title.toLowerCase().includes(query) ||
        (resource.description || '').toLowerCase().includes(query) ||
        (resource.level || '').toLowerCase().includes(query);
      
      const matchesType = !typeFilter || resource.resource_type === typeFilter;
      
      return matchesSearch && matchesType;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'title') {
        aVal = a.title.toLowerCase();
        bVal = b.title.toLowerCase();
      } else if (sortField === 'created_at') {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      } else if (sortField === 'sort_order') {
        aVal = a.sort_order || 0;
        bVal = b.sort_order || 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [resources, searchQuery, typeFilter, sortField, sortOrder]);

  // Paginate
  const paginatedResources = useMemo(() => {
    if (pageSize === 0) return filteredAndSortedResources;
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedResources.slice(start, start + pageSize);
  }, [filteredAndSortedResources, currentPage, pageSize]);

  const totalPages = pageSize === 0 ? 1 : Math.ceil(filteredAndSortedResources.length / pageSize);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-40" />;
    return sortOrder === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1" />
      : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  const getResourceTypeIcon = (type?: string | null) => {
    switch (type) {
      case 'course':
        return <BookOpen className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'article':
        return <FileText className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getResourceTypeLabel = (type?: string | null) => {
    switch (type) {
      case 'course':
        return 'Course';
      case 'video':
        return 'Video';
      case 'article':
        return 'Article';
      default:
        return 'Course';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Education Resources</h1>
          <p className="text-sm text-muted-foreground">
            {filteredAndSortedResources.length} {filteredAndSortedResources.length === 1 ? 'resource' : 'resources'} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <Link href="/dashboard/education-resources/new" className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" />
            New Resource
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title, description, or level..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">All Types</option>
            <option value="course">Course</option>
            <option value="video">Video</option>
            <option value="article">Article</option>
          </select>
          <label className="text-sm text-muted-foreground whitespace-nowrap">Show:</label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={0}>All</option>
          </select>
          <div className="flex items-center gap-1 border border-input rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-l-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-accent text-accent-foreground' 
                  : 'text-muted-foreground hover:bg-muted'
              }`}
              title="List View"
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-r-lg transition-colors ${
                viewMode === 'card' 
                  ? 'bg-accent text-accent-foreground' 
                  : 'text-muted-foreground hover:bg-muted'
              }`}
              title="Card View"
            >
              <Grid className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading resources...</p>
        </div>
      ) : resources.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <BookOpen className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-card-foreground mb-2">No resources yet</h3>
          <p className="text-sm text-muted-foreground">Get started by creating a new education resource.</p>
          <div className="mt-6">
            <Link href="/dashboard/education-resources/new" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              New Resource
            </Link>
          </div>
        </div>
      ) : filteredAndSortedResources.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No resources match your search criteria.</p>
        </div>
      ) : (
        <>
          {viewMode === 'list' ? (
            <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50">
                    <tr>
                      <th 
                        onClick={() => handleSort('title')}
                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/70 transition-colors"
                      >
                        <div className="flex items-center">
                          Title
                          <SortIcon field="title" />
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('resource_type')}
                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/70 transition-colors"
                      >
                        <div className="flex items-center">
                          Type
                          <SortIcon field="resource_type" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Duration
                      </th>
                      <th 
                        onClick={() => handleSort('sort_order')}
                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/70 transition-colors"
                      >
                        <div className="flex items-center">
                          Order
                          <SortIcon field="sort_order" />
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('created_at')}
                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/70 transition-colors"
                      >
                        <div className="flex items-center">
                          Date
                          <SortIcon field="created_at" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {paginatedResources.map((resource) => {
                      const imageUrl = resource.image_url?.startsWith('http') 
                        ? resource.image_url 
                        : resource.image_url ? buildBackendUrl(resource.image_url) : null;
                      
                      return (
                        <tr key={resource.id} className="hover:bg-accent/40 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {imageUrl && (
                                <img
                                  src={imageUrl}
                                  alt={resource.title}
                                  className="h-10 w-10 rounded object-cover"
                                />
                              )}
                              <div>
                                <div className="text-sm font-medium text-foreground max-w-xs truncate">
                                  {resource.title}
                                </div>
                                {resource.is_featured && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-primary/10 text-primary mt-1">
                                    Featured
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1 text-sm text-foreground">
                              {getResourceTypeIcon(resource.resource_type)}
                              {getResourceTypeLabel(resource.resource_type)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-foreground">
                              {resource.level || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-muted-foreground">
                              {resource.duration || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-muted-foreground">
                              {resource.sort_order}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {new Date(resource.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={resource.is_active}
                                onChange={(e) => handleStatusChange(resource.id, e.target.checked)}
                                className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-primary/50"
                              />
                              <span className="text-sm text-foreground">
                                {resource.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </label>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <Link 
                                href={`/dashboard/education-resources/${resource.id}`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                <span>Edit</span>
                              </Link>
                              <button
                                onClick={() => handleDelete(resource.id, resource.title)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedResources.map((resource) => {
                const imageUrl = resource.image_url?.startsWith('http') 
                  ? resource.image_url 
                  : resource.image_url ? buildBackendUrl(resource.image_url) : null;
                
                return (
                  <div 
                    key={resource.id} 
                    className="group rounded-lg border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
                  >
                    {/* Featured Image */}
                    {imageUrl ? (
                      <div className="aspect-video w-full overflow-hidden bg-muted">
                        <img
                          src={imageUrl}
                          alt={resource.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video w-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}

                    {/* Card Content */}
                    <div className="flex-1 flex flex-col p-4">
                      {/* Type Badge */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-primary/10 text-primary">
                          {getResourceTypeIcon(resource.resource_type)}
                          {getResourceTypeLabel(resource.resource_type)}
                        </div>
                        {resource.is_featured && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-foreground line-clamp-2 mb-2 min-h-[3rem]">
                        {resource.title}
                      </h3>

                      {/* Description */}
                      {resource.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                          {resource.description}
                        </p>
                      )}

                      {/* Meta Information */}
                      <div className="space-y-2 mt-auto pt-3 border-t border-border">
                        {/* Level */}
                        {resource.level && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Level</span>
                            <span className="text-sm text-foreground">{resource.level}</span>
                          </div>
                        )}

                        {/* Duration */}
                        {resource.duration && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Duration</span>
                            <span className="text-sm text-foreground">{resource.duration}</span>
                          </div>
                        )}

                        {/* CEUs */}
                        {resource.ceus && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">CEUs</span>
                            <span className="text-sm text-foreground">{resource.ceus}</span>
                          </div>
                        )}

                        {/* Status */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Status</span>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={resource.is_active}
                              onChange={(e) => handleStatusChange(resource.id, e.target.checked)}
                              onClick={(e) => e.stopPropagation()}
                              className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-primary/50"
                            />
                            <span className="text-xs text-foreground">
                              {resource.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </label>
                        </div>

                        {/* Date */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Date
                          </span>
                          <span className="text-xs text-foreground">
                            {new Date(resource.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer - Actions */}
                    <div className="p-4 pt-0 flex items-center gap-2">
                      <Link 
                        href={`/dashboard/education-resources/${resource.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors text-sm"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(resource.id, resource.title)}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-md bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors text-sm"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pageSize > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-card border border-border rounded-lg">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredAndSortedResources.length)} of {filteredAndSortedResources.length} resources
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                    })
                    .map((page, idx, arr) => (
                      <span key={page}>
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="px-2 text-muted-foreground">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1.5 rounded-md transition-colors ${
                            currentPage === page
                              ? 'bg-primary text-primary-foreground'
                              : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                          }`}
                        >
                          {page}
                        </button>
                      </span>
                    ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

