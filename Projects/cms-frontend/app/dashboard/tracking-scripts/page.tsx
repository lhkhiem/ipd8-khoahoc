'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Code, Eye, EyeOff, Check, X } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { TrackingScript } from '@/types';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/api';

export default function TrackingScriptsPage() {
  const { user, hydrate } = useAuthStore();
  const [scripts, setScripts] = useState<TrackingScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<TrackingScript | null>(null);
  const [form, setForm] = useState<{
    name: string;
    type: 'analytics' | 'pixel' | 'custom' | 'tag-manager' | 'heatmap' | 'live-chat';
    provider: string;
    position: 'head' | 'body';
    script_code: string;
    is_active: boolean;
    load_strategy: 'sync' | 'async' | 'defer';
    pages: string[];
    priority: number;
    description: string;
  }>({
    name: '',
    type: 'analytics',
    provider: '',
    position: 'head',
    script_code: '',
    is_active: true,
    load_strategy: 'async',
    pages: ['all'],
    priority: 0,
    description: ''
  });

  useEffect(() => {
    if (!user) {
      hydrate().then(() => {
        if (!useAuthStore.getState().user) return (window.location.href = '/login');
        fetchScripts();
      });
    } else {
      fetchScripts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchScripts = async () => {
    try {
      setLoading(true);
      const response = await axios.get<{ success: boolean; data: TrackingScript[] }>(buildApiUrl('/api/tracking-scripts'), {
        withCredentials: true,
      });
      // Handle both response formats: { success: true, data: [...] } or { data: [...] }
      const scriptsData = response.data?.success ? response.data.data : (response.data as any)?.data || [];
      setScripts(Array.isArray(scriptsData) ? scriptsData : []);
    } catch (error) {
      console.error('Failed to fetch scripts:', error);
      toast.error('Failed to load tracking scripts');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: '',
      type: 'analytics',
      provider: '',
      position: 'head',
      script_code: '',
      is_active: true,
      load_strategy: 'async',
      pages: ['all'],
      priority: 0,
      description: ''
    });
    setShowDialog(true);
  };

  const openEdit = (script: TrackingScript) => {
    setEditing(script);
    setForm({
      name: script.name,
      type: script.type,
      provider: script.provider || '',
      position: script.position,
      script_code: script.script_code,
      is_active: script.is_active,
      load_strategy: script.load_strategy,
      pages: Array.isArray(script.pages) ? script.pages : (script.pages ? [script.pages] : ['all']),
      priority: script.priority || 0,
      description: script.description || ''
    });
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        const response = await axios.put(buildApiUrl(`/api/tracking-scripts/${editing.id}`), form, {
          withCredentials: true,
        });
        if (response.data?.success !== false) {
          toast.success('Tracking script updated successfully');
        } else {
          throw new Error(response.data?.error || 'Update failed');
        }
      } else {
        const response = await axios.post(buildApiUrl('/api/tracking-scripts'), form, {
          withCredentials: true,
        });
        if (response.data?.success !== false) {
          toast.success('Tracking script created successfully');
        } else {
          throw new Error(response.data?.error || 'Create failed');
        }
      }
      fetchScripts();
      setShowDialog(false);
    } catch (error: any) {
      console.error('Failed to save script:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message || 'Failed to save tracking script';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tracking script?')) return;

    try {
      const response = await axios.delete(buildApiUrl(`/api/tracking-scripts/${id}`), {
        withCredentials: true,
      });
      if (response.data?.success !== false) {
        toast.success('Tracking script deleted successfully');
        fetchScripts();
      } else {
        throw new Error(response.data?.error || 'Delete failed');
      }
    } catch (error: any) {
      console.error('Failed to delete script:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete tracking script';
      toast.error(errorMessage);
    }
  };

  const toggleActive = async (script: TrackingScript) => {
    try {
      const response = await axios.patch(
        buildApiUrl(`/api/tracking-scripts/${script.id}/toggle`),
        {},
        { withCredentials: true }
      );
      if (response.data?.success !== false) {
        toast.success(`Script ${!script.is_active ? 'activated' : 'deactivated'} successfully`);
        fetchScripts();
      } else {
        throw new Error(response.data?.error || 'Toggle failed');
      }
    } catch (error: any) {
      console.error('Failed to toggle script:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update script';
      toast.error(errorMessage);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      analytics: 'bg-blue-100 text-blue-800',
      pixel: 'bg-purple-100 text-purple-800',
      custom: 'bg-gray-100 text-gray-800',
      'tag-manager': 'bg-green-100 text-green-800',
      heatmap: 'bg-orange-100 text-orange-800',
      'live-chat': 'bg-pink-100 text-pink-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading scripts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tracking Scripts</h1>
          <p className="text-sm text-muted-foreground">
            Manage analytics and tracking codes
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Script
        </button>
      </div>

      {/* Scripts List */}
      {scripts.length === 0 ? (
        <EmptyState
          icon={Code}
          title="No tracking scripts"
          description="Add analytics, pixels, and other tracking codes"
        />
      ) : (
        <div className="space-y-4">
          {scripts.map((script) => (
            <div
              key={script.id}
              className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">{script.name}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(script.type)}`}>
                      {script.type}
                    </span>
                    {script.is_active ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <X className="h-3 w-3 mr-1" />
                        Inactive
                      </span>
                    )}
                  </div>
                  
                  {script.provider && (
                    <p className="text-sm text-muted-foreground mb-2">
                      Provider: {script.provider}
                    </p>
                  )}
                  
                  {script.description && (
                    <p className="text-sm text-muted-foreground mb-2">{script.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Position: {script.position}</span>
                    <span>Strategy: {script.load_strategy}</span>
                    <span>Priority: {script.priority || 0}</span>
                    <span>Pages: {Array.isArray(script.pages) ? script.pages.join(', ') : (script.pages || 'all')}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(script)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                  >
                    {script.is_active ? (
                      <>
                        <EyeOff className="h-4 w-4" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        Activate
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => openEdit(script)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(script.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-foreground">
              {editing ? 'Edit' : 'Add'} Tracking Script
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg"
                  >
                    <option value="analytics">Analytics</option>
                    <option value="pixel">Pixel</option>
                    <option value="custom">Custom</option>
                    <option value="tag-manager">Tag Manager</option>
                    <option value="heatmap">Heatmap</option>
                    <option value="live-chat">Live Chat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Provider</label>
                  <input
                    type="text"
                    value={form.provider}
                    onChange={(e) => setForm({ ...form, provider: e.target.value })}
                    placeholder="e.g. Google Analytics"
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Position</label>
                  <select
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value as any })}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg"
                  >
                    <option value="head">Head</option>
                    <option value="body">Body</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Load Strategy</label>
                  <select
                    value={form.load_strategy}
                    onChange={(e) => setForm({ ...form, load_strategy: e.target.value as any })}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg"
                  >
                    <option value="sync">Sync</option>
                    <option value="async">Async</option>
                    <option value="defer">Defer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Script Code</label>
                <textarea
                  value={form.script_code}
                  onChange={(e) => setForm({ ...form, script_code: e.target.value })}
                  rows={8}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg font-mono text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Priority</label>
                  <input
                    type="number"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg"
                    placeholder="0"
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Lower numbers load first</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Pages</label>
                  <input
                    type="text"
                    value={form.pages.join(', ')}
                    onChange={(e) => {
                      const pages = e.target.value
                        .split(',')
                        .map(p => p.trim())
                        .filter(p => p.length > 0);
                      setForm({ ...form, pages: pages.length > 0 ? pages : ['all'] });
                    }}
                    className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg"
                    placeholder="all, home, products, cart"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Comma-separated. Use "all" for all pages</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg"
                  placeholder="Optional description"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-foreground">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Active</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDialog(false)}
                    className="px-4 py-2 border border-input bg-background text-foreground rounded-lg hover:bg-accent transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    {editing ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

