'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, GripVertical, Edit2, Trash2, Save, ExternalLink, MoveVertical } from 'lucide-react';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/api';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MenuItem {
  id: string;
  title: string;
  url?: string;
  type: string;
  icon?: string;
  target: string;
  sort_order: number;
  parent_id?: string;
  is_active: boolean;
  children?: MenuItem[];
  depth?: number;
}

interface MenuLocation {
  id: string;
  name: string;
  slug: string;
}

// Helper: Calculate item depth
function calculateDepth(item: MenuItem, items: MenuItem[]): number {
  if (!item.parent_id) return 1;
  
  let depth = 1;
  let currentParentId = item.parent_id;
  const visited = new Set<string>();
  
  while (currentParentId && depth < 10) { // Max 10 iterations as safety
    // Prevent circular references
    if (visited.has(currentParentId)) {
      console.warn('Circular reference detected in menu hierarchy:', currentParentId);
      break;
    }
    visited.add(currentParentId);
    
    const parent = items.find(i => i.id === currentParentId);
    if (!parent || !parent.parent_id) break;
    currentParentId = parent.parent_id;
    depth++;
  }
  
  return depth + 1;
}

// Helper: Check if item can have children (depth < 3)
function canHaveChildren(item: MenuItem, items: MenuItem[]): boolean {
  const depth = calculateDepth(item, items);
  return depth < 3;
}

// Helper: Calculate max depth of subtree (including item itself)
function getSubtreeMaxDepth(itemId: string, items: MenuItem[], visited: Set<string> = new Set()): number {
  // Prevent infinite recursion from circular references
  if (visited.has(itemId)) {
    console.warn('Circular reference detected in menu items:', itemId);
    return 1;
  }
  
  visited.add(itemId);
  
  const children = items.filter(i => i.parent_id === itemId);
  
  if (children.length === 0) {
    return 1; // Leaf node
  }
  
  const childrenDepths = children.map(child => getSubtreeMaxDepth(child.id, items, visited));
  return 1 + Math.max(...childrenDepths);
}

// Helper: Check if item can be moved to new parent without exceeding max depth
function canMoveToParent(item: MenuItem, newParentId: string | null, items: MenuItem[]): boolean {
  // Calculate new depth
  let newDepth = 1;
  if (newParentId) {
    const parent = items.find(i => i.id === newParentId);
    if (parent) {
      newDepth = calculateDepth(parent, items) + 1;
    }
  }
  
  // Calculate max depth of item's subtree
  const subtreeDepth = getSubtreeMaxDepth(item.id, items);
  
  // Total depth would be: newDepth + (subtreeDepth - 1)
  // Because subtreeDepth already counts the item itself
  const totalDepth = newDepth + subtreeDepth - 1;
  
  return totalDepth <= 3;
}

// Helper: Sort items hierarchically (parent before children)
function sortItemsHierarchically(items: MenuItem[]): MenuItem[] {
  const result: MenuItem[] = [];
  const itemMap = new Map<string, MenuItem>();
  const processedIds = new Set<string>();
  
  // Build map
  items.forEach(item => itemMap.set(item.id, item));
  
  // Recursive function to add item and its children
  const addItemAndChildren = (item: MenuItem, level: number = 1) => {
    // Prevent infinite loops
    if (processedIds.has(item.id)) return;
    processedIds.add(item.id);
    
    // Add depth info
    result.push({ ...item, depth: level });
    
    // Find and add children, sorted by sort_order
    const children = items
      .filter(i => i.parent_id === item.id)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    
    children.forEach(child => addItemAndChildren(child, level + 1));
  };
  
  // Find TRUE root items (no parent OR parent doesn't exist)
  const rootItems = items
    .filter(item => {
      if (!item.parent_id) return true; // No parent = root
      // Check if parent exists
      const parentExists = itemMap.has(item.parent_id);
      return !parentExists; // Orphan = treat as root
    })
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  
  rootItems.forEach(item => addItemAndChildren(item, 1));
  
  // Add any remaining items that weren't processed (shouldn't happen, but safety)
  items.forEach(item => {
    if (!processedIds.has(item.id)) {
      console.warn('Orphan item detected:', item.title, item.id);
      result.push({ ...item, depth: 1 }); // Add as root
    }
  });
  
  return result;
}

// Sortable menu item component  
function SortableMenuItem({ item, onEdit, onDelete, onMove, items }: { 
  item: MenuItem; 
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onMove: (item: MenuItem) => void;
  items: MenuItem[];
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Use pre-calculated depth from sortItemsHierarchically
  const depth = item.depth || calculateDepth(item, items);
  const indentClass = depth === 1 ? '' : depth === 2 ? 'ml-8' : 'ml-16';
  const depthLabel = depth === 1 ? '' : depth === 2 ? 'Level 2' : 'Level 3';
  const depthColor = depth === 1 ? '' : depth === 2 ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow ${indentClass}`}
    >
      {/* Drag Handle */}
      <button
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-foreground truncate">{item.title}</h4>
          {depthLabel && (
            <span className={`px-2 py-0.5 text-xs font-medium rounded ${depthColor}`}>
              {depthLabel}
            </span>
          )}
          {!item.is_active && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800">
              Hidden
            </span>
          )}
          {item.target === '_blank' && (
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="truncate">{item.url || '/'}</span>
          <span className="px-2 py-0.5 text-xs rounded bg-muted">{item.type}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onMove(item)}
          className="px-3 py-2 rounded-md bg-secondary/50 hover:bg-secondary transition-colors"
          title="Move to different level/group"
        >
          <MoveVertical className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onEdit(item)}
          className="px-3 py-2 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
          title="Edit"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="px-3 py-2 rounded-md bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function MenuEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [location, setLocation] = useState<MenuLocation | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [movingItem, setMovingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    type: 'custom',
    target: '_self',
    icon: '',
    parent_id: '',
    is_active: true
  });
  const [submitting, setSubmitting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchLocation();
    fetchMenuItems();
  }, [id]);

  const fetchLocation = async () => {
    try {
      const response = await fetch(buildApiUrl(`/api/menu-locations/${id}`), {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch menu location');

      const data = await response.json();
      setLocation(data);
    } catch (error) {
      console.error('Failed to fetch menu location:', error);
      toast.error('Failed to load menu location');
    }
  };

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl(`/api/menu-items?location_id=${id}`), {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch menu items');

      const data = await response.json();
      const flatItems = data.flat || [];
      
      // Sort hierarchically: Level 1 → Level 2 → Level 3
      const sortedItems = sortItemsHierarchically(flatItems);
      setItems(sortedItems);
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const draggedItem = items.find(i => i.id === active.id);
    const overItem = items.find(i => i.id === over.id);

    if (!draggedItem || !overItem) return;

    // 🔒 RULE: Can ONLY reorder within same parent (same level, same branch)
    const sameParent = (draggedItem.parent_id || null) === (overItem.parent_id || null);

    if (!sameParent) {
      // Different parent/branch - REJECT
      toast.error('❌ Can only reorder items within the same level and branch. Use "Move" button to change parent.');
      return;
    }

    // Same level, same branch - reorder with auto-save
    try {
      setSaving(true);
      
      // Update local state first for immediate feedback
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });

      // Get siblings in the new order
      const siblings = items.filter(i => (i.parent_id || null) === (draggedItem.parent_id || null));
      const oldIndex = siblings.findIndex((i) => i.id === active.id);
      const newIndex = siblings.findIndex((i) => i.id === over.id);
      const reorderedSiblings = arrayMove(siblings, oldIndex, newIndex);

      // Build bulk update payload
      const updates = reorderedSiblings.map((item, index) => ({
        id: item.id,
        sort_order: index,
        parent_id: item.parent_id || null
      }));

      // Save to backend (backend expects { items: [...] })
      const response = await fetch(buildApiUrl('/api/menu-items/bulk/update-order'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ items: updates })
      });

      if (!response.ok) {
        throw new Error('Failed to save order');
      }

      // Reload to get fresh hierarchical data with children in correct order
      await fetchMenuItems();
      
      toast.success('✅ Reordered successfully - All children moved with parent');
    } catch (error: any) {
      console.error('Failed to save order:', error);
      toast.error('Failed to save order');
      // Reload to revert
      await fetchMenuItems();
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOrder = async () => {
    try {
      setSaving(true);
      
      // Build update payload - group by parent to maintain hierarchy
      const itemsByParent = new Map<string | null, MenuItem[]>();
      
      items.forEach(item => {
        const parentKey = item.parent_id || 'root';
        if (!itemsByParent.has(parentKey)) {
          itemsByParent.set(parentKey, []);
        }
        itemsByParent.get(parentKey)!.push(item);
      });
      
      // Assign sort_order within each parent group
      const updates: any[] = [];
      itemsByParent.forEach((siblings, parentKey) => {
        siblings.forEach((item, index) => {
          updates.push({
            id: item.id,
            sort_order: index,
            parent_id: item.parent_id || null
          });
        });
      });

      const response = await fetch(buildApiUrl('/api/menu-items/bulk/update-order'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ items: updates })
      });

      if (!response.ok) throw new Error('Failed to save order');

      toast.success('Menu order saved successfully');
      fetchMenuItems();
    } catch (error) {
      console.error('Failed to save order:', error);
      toast.error('Failed to save menu order');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      const response = await fetch(buildApiUrl(`/api/menu-items/${id}`), {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to delete menu item');

      toast.success('Menu item deleted successfully');
      setItems(items.filter(i => i.id !== id));
    } catch (error) {
      console.error('Failed to delete menu item:', error);
      toast.error('Failed to delete menu item');
    }
  };

  const handleCreateMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      toast.error('Title is required');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(buildApiUrl('/api/menu-items'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          menu_location_id: id,
          parent_id: formData.parent_id || null,
          sort_order: items.length
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Failed to create menu item');
      }

      toast.success('Menu item created successfully');
      setShowAddModal(false);
      setFormData({
        title: '',
        url: '',
        type: 'custom',
        target: '_self',
        icon: '',
        parent_id: '',
        is_active: true
      });
      fetchMenuItems();
    } catch (error: any) {
      console.error('Failed to create menu item:', error);
      toast.error(error.message || 'Failed to create menu item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      url: item.url || '',
      type: item.type,
      target: item.target,
      icon: item.icon || '',
      parent_id: item.parent_id || '',
      is_active: item.is_active
    });
  };

  const handleMoveItem = async (newParentId: string | null) => {
    if (!movingItem) return;

    try {
      setSubmitting(true);
      const response = await fetch(buildApiUrl(`/api/menu-items/${movingItem.id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          parent_id: newParentId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Failed to move menu item');
      }

      toast.success('Menu item moved successfully');
      setMovingItem(null);
      fetchMenuItems();
    } catch (error: any) {
      console.error('Failed to move menu item:', error);
      toast.error(error.message || 'Failed to move menu item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingItem || !formData.title) {
      toast.error('Title is required');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(buildApiUrl(`/api/menu-items/${editingItem.id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          parent_id: formData.parent_id || null
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Failed to update menu item');
      }

      toast.success('Menu item updated successfully');
      setEditingItem(null);
      setFormData({
        title: '',
        url: '',
        type: 'custom',
        target: '_self',
        icon: '',
        parent_id: '',
        is_active: true
      });
      fetchMenuItems();
    } catch (error: any) {
      console.error('Failed to update menu item:', error);
      toast.error(error.message || 'Failed to update menu item');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/menus"
            className="p-2 rounded-lg border border-input bg-background hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {location?.name || 'Menu'} Editor
            </h1>
            <p className="text-sm text-muted-foreground">
              Drag and drop to reorder menu items
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveOrder}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Order'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        </div>
      </div>

      {/* Menu Items List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading menu items...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <h3 className="text-lg font-medium text-card-foreground mb-2">No menu items yet</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Add your first menu item to start building your navigation.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Menu Item
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map(i => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {items.map((item) => (
                <SortableMenuItem
                  key={item.id}
                  item={item}
                  items={items}
                  onEdit={handleEditItem}
                  onMove={setMovingItem}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add/Edit Menu Item Modal */}
      {(showAddModal || editingItem) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-card rounded-lg p-6 max-w-2xl w-full my-8 shadow-xl">
            <h2 className="text-xl font-bold text-foreground mb-6">
              {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
            </h2>
            
            <form onSubmit={editingItem ? handleUpdateMenuItem : handleCreateMenuItem} className="space-y-4">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                  Title <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g., Home, About Us, Contact"
                  required
                />
              </div>

              {/* URL */}
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-foreground mb-2">
                  URL
                </label>
                <input
                  type="text"
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g., /, /about, /contact, https://example.com"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty for # or use absolute/relative URLs
                </p>
              </div>

              {/* Type and Target Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Type */}
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-foreground mb-2">
                    Type
                  </label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="custom">Custom URL</option>
                    <option value="category">Product Category</option>
                    <option value="product">Product</option>
                    <option value="post">Blog Post</option>
                    <option value="page">Page</option>
                  </select>
                </div>

                {/* Target */}
                <div>
                  <label htmlFor="target" className="block text-sm font-medium text-foreground mb-2">
                    Target
                  </label>
                  <select
                    id="target"
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="_self">Same Tab</option>
                    <option value="_blank">New Tab</option>
                  </select>
                </div>
              </div>

              {/* Parent Item (for nested menus) */}
              <div>
                <label htmlFor="parent_id" className="block text-sm font-medium text-foreground mb-2">
                  Parent Item (Optional - Max 3 Levels)
                </label>
                <select
                  id="parent_id"
                  value={formData.parent_id}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">None (Top Level)</option>
                  {items
                    .filter(i => !editingItem || i.id !== editingItem.id)
                    .map(item => {
                      const depth = item.depth || calculateDepth(item, items);
                      const prefix = depth === 1 ? '' : depth === 2 ? '└─ ' : '└──── ';
                      
                      // Check if this item can be parent based on current editing/creating item
                      let canBeParent = true;
                      let reason = '';
                      
                      if (editingItem) {
                        // When editing, check if moving to this parent would exceed depth
                        canBeParent = canMoveToParent(editingItem, item.id, items);
                        if (!canBeParent) {
                          const subtreeDepth = getSubtreeMaxDepth(editingItem.id, items);
                          const newDepth = depth + 1;
                          if (subtreeDepth > 1) {
                            reason = `(Branch would span L${newDepth} → L${newDepth + subtreeDepth - 1})`;
                          } else {
                            reason = '(Max depth reached)';
                          }
                        } else {
                          reason = `(Level ${depth})`;
                        }
                      } else {
                        // When creating new item, just check parent depth
                        canBeParent = depth < 3;
                        reason = canBeParent ? `(Level ${depth})` : '(Max depth reached)';
                      }
                      
                      return (
                        <option 
                          key={item.id} 
                          value={item.id}
                          disabled={!canBeParent}
                        >
                          {prefix}{item.title} {reason}
                        </option>
                      );
                    })
                  }
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Select a parent to create submenu. Maximum 3 levels allowed.
                  {editingItem && getSubtreeMaxDepth(editingItem.id, items) > 1 && (
                    <span className="block text-blue-600 mt-1">
                      ℹ️ This item has children ({getSubtreeMaxDepth(editingItem.id, items)} level branch)
                    </span>
                  )}
                </p>
              </div>

              {/* Icon (optional) */}
              <div>
                <label htmlFor="icon" className="block text-sm font-medium text-foreground mb-2">
                  Icon (Optional)
                </label>
                <input
                  type="text"
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g., home, menu, shopping-cart"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Icon name from your icon library
                </p>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-primary/50"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-foreground">
                  Active (Visible in menu)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingItem(null);
                    setFormData({
                      title: '',
                      url: '',
                      type: 'custom',
                      target: '_self',
                      icon: '',
                      parent_id: '',
                      is_active: true
                    });
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-input bg-background hover:bg-accent transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : (editingItem ? 'Update Item' : 'Add Item')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Move Item Modal */}
          {movingItem && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-card rounded-lg p-6 max-w-lg w-full mx-4 shadow-xl">
                <h2 className="text-xl font-bold text-foreground mb-4">
                  Move Menu Item: <span className="text-primary">{movingItem.title}</span>
                </h2>

                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-2">
                    Choose a new parent for this item to change its level or group.
                  </p>
                  {(() => {
                    const subtreeDepth = getSubtreeMaxDepth(movingItem.id, items);
                    if (subtreeDepth > 1) {
                      return (
                        <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md mb-4">
                          <p className="text-xs text-blue-700">
                            ℹ️ This item has {subtreeDepth - 1} level(s) of children. Total branch depth: {subtreeDepth} level(s)
                          </p>
                        </div>
                      );
                    }
                  })()}

                  <div className="space-y-2">
                    {/* Move to Top Level */}
                    {(() => {
                      const canMove = canMoveToParent(movingItem, null, items);
                      const subtreeDepth = getSubtreeMaxDepth(movingItem.id, items);
                      const isCurrent = !movingItem.parent_id;
                      
                      return (
                        <button
                          onClick={() => handleMoveItem(null)}
                          disabled={!canMove || submitting}
                          className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                            isCurrent
                              ? 'border-primary bg-primary/10 text-primary'
                              : canMove
                              ? 'border-border hover:border-primary/50 hover:bg-accent'
                              : 'border-border bg-muted/50 opacity-50 cursor-not-allowed'
                          } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">Top Level (Level 1)</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {canMove 
                                  ? subtreeDepth > 1 
                                    ? `Branch will span ${subtreeDepth} level(s) (1 → ${subtreeDepth})`
                                    : 'Make this a root menu item'
                                  : `Cannot move: Branch would exceed max depth (need ${subtreeDepth} levels)`
                                }
                              </div>
                            </div>
                            {isCurrent && (
                              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                                Current
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })()}

                    {/* Move under other items */}
                    {items
                      .filter(i => i.id !== movingItem.id)
                      .map(item => {
                        const depth = item.depth || calculateDepth(item, items);
                        const canMove = canMoveToParent(movingItem, item.id, items);
                        const isCurrent = movingItem.parent_id === item.id;
                        const indent = depth === 1 ? '' : depth === 2 ? 'ml-4' : 'ml-8';
                        const prefix = depth === 1 ? '' : depth === 2 ? '└─ ' : '└──── ';
                        const newDepth = depth + 1;
                        const subtreeDepth = getSubtreeMaxDepth(movingItem.id, items);
                        const wouldExceed = newDepth + subtreeDepth - 1 > 3;
                        
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleMoveItem(item.id)}
                            disabled={!canMove || submitting}
                            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${indent} ${
                              isCurrent
                                ? 'border-primary bg-primary/10 text-primary'
                                : canMove
                                ? 'border-border hover:border-primary/50 hover:bg-accent'
                                : 'border-border bg-muted/50 opacity-50 cursor-not-allowed'
                            } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">
                                  {prefix}{item.title}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {canMove 
                                    ? subtreeDepth > 1
                                      ? `Will become Level ${newDepth}, branch spans ${newDepth} → ${newDepth + subtreeDepth - 1}`
                                      : `Will become Level ${newDepth}`
                                    : wouldExceed
                                    ? `Cannot move: Branch would span ${newDepth} → ${newDepth + subtreeDepth - 1} (exceeds limit)`
                                    : 'Cannot move here'
                                  }
                                </div>
                              </div>
                              {isCurrent && (
                                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded ml-2">
                                  Current
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })
                    }
                  </div>
                </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setMovingItem(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-input bg-background hover:bg-accent transition-colors"
                disabled={submitting}
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

