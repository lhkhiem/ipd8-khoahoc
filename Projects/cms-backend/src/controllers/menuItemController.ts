import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import sequelize from '../config/database';
import { v4 as uuidv4 } from 'uuid';

// Helper: Calculate menu item depth (max 3 levels)
async function getMenuItemDepth(parentId: string | null): Promise<number> {
  if (!parentId) return 1; // Root level

  let depth = 1;
  let currentId = parentId;

  while (currentId && depth < 4) {
    const query = `SELECT parent_id FROM menu_items WHERE id = :id`;
    const result: any = await sequelize.query(query, {
      replacements: { id: currentId },
      type: QueryTypes.SELECT
    });

    if (result.length === 0 || !result[0].parent_id) {
      break;
    }

    currentId = result[0].parent_id;
    depth++;
  }

  return depth + 1; // +1 for the new item
}

// Helper: Calculate max depth of item's subtree (including the item itself)
async function getSubtreeMaxDepth(itemId: string): Promise<number> {
  const query = `SELECT id FROM menu_items WHERE parent_id = :itemId`;
  const children: any = await sequelize.query(query, {
    replacements: { itemId },
    type: QueryTypes.SELECT
  });

  if (children.length === 0) {
    return 1; // Leaf node
  }

  const childrenDepths = await Promise.all(
    children.map((child: any) => getSubtreeMaxDepth(child.id))
  );

  return 1 + Math.max(...childrenDepths);
}

// Helper: Check if item can be moved to new parent without exceeding max depth
async function canMoveToParent(itemId: string, newParentId: string | null): Promise<{ canMove: boolean; reason?: string; totalDepth?: number }> {
  // Calculate new depth
  const newDepth = await getMenuItemDepth(newParentId);
  
  // Calculate max depth of item's subtree
  const subtreeDepth = await getSubtreeMaxDepth(itemId);
  
  // Total depth would be: newDepth + (subtreeDepth - 1)
  // Because subtreeDepth already counts the item itself
  const totalDepth = newDepth + subtreeDepth - 1;
  
  if (totalDepth > 3) {
    return {
      canMove: false,
      reason: `Branch would exceed max depth: would span levels ${newDepth} to ${totalDepth} (max 3 levels allowed)`,
      totalDepth
    };
  }
  
  return { canMove: true, totalDepth };
}

// Get all menu items for a location (with hierarchical structure)
export const getMenuItems = async (req: Request, res: Response) => {
  try {
    const { location_id } = req.query;

    if (!location_id) {
      return res.status(400).json({ error: 'location_id is required' });
    }

    const query = `
      SELECT * FROM menu_items
      WHERE menu_location_id = :location_id
      ORDER BY sort_order ASC, created_at ASC
    `;

    const items: any = await sequelize.query(query, {
      replacements: { location_id },
      type: QueryTypes.SELECT
    });

    // Build hierarchical structure
    const itemMap: any = {};
    const rootItems: any[] = [];

    // First pass: create map
    items.forEach((item: any) => {
      itemMap[item.id] = { ...item, children: [] };
    });

    // Second pass: build tree
    items.forEach((item: any) => {
      if (item.parent_id && itemMap[item.parent_id]) {
        itemMap[item.parent_id].children.push(itemMap[item.id]);
      } else {
        rootItems.push(itemMap[item.id]);
      }
    });

    res.json({ data: rootItems, flat: items });
  } catch (error) {
    console.error('Failed to fetch menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
};

// Get single menu item
export const getMenuItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = `SELECT * FROM menu_items WHERE id = :id`;

    const result: any = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.SELECT
    });

    if (result.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Failed to fetch menu item:', error);
    res.status(500).json({ error: 'Failed to fetch menu item' });
  }
};

// Create menu item
export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const {
      menu_location_id,
      parent_id,
      title,
      url,
      icon,
      type,
      entity_id,
      target,
      rel,
      css_classes,
      sort_order,
      is_active
    } = req.body;

    if (!menu_location_id || !title) {
      return res.status(400).json({ error: 'menu_location_id and title are required' });
    }

    // Validate depth (max 3 levels)
    const depth = await getMenuItemDepth(parent_id || null);
    if (depth > 3) {
      return res.status(400).json({ 
        error: 'Maximum menu depth exceeded',
        message: 'Menu items can only be nested up to 3 levels deep'
      });
    }

    const id = uuidv4();

    const query = `
      INSERT INTO menu_items (
        id, menu_location_id, parent_id, title, url, icon, type,
        entity_id, target, rel, css_classes, sort_order, is_active
      )
      VALUES (
        :id, :menu_location_id, :parent_id, :title, :url, :icon, :type,
        :entity_id, :target, :rel, :css_classes, :sort_order, :is_active
      )
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements: {
        id,
        menu_location_id,
        parent_id: parent_id || null,
        title,
        url: url || null,
        icon: icon || null,
        type: type || 'custom',
        entity_id: entity_id || null,
        target: target || '_self',
        rel: rel || null,
        css_classes: css_classes || null,
        sort_order: sort_order !== undefined ? sort_order : 0,
        is_active: is_active !== undefined ? is_active : true
      },
      type: QueryTypes.INSERT
    });

    res.status(201).json(result[0][0]);
  } catch (error) {
    console.error('Failed to create menu item:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
};

// Update menu item
export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      parent_id,
      title,
      url,
      icon,
      type,
      entity_id,
      target,
      rel,
      css_classes,
      sort_order,
      is_active
    } = req.body;

    const updateFields: string[] = [];
    const replacements: any = { id };

    if (parent_id !== undefined) {
      // Validate depth when changing parent - must consider item's subtree
      const moveValidation = await canMoveToParent(id, parent_id);
      if (!moveValidation.canMove) {
        return res.status(400).json({ 
          error: 'Maximum menu depth exceeded',
          message: moveValidation.reason || 'Menu items can only be nested up to 3 levels deep'
        });
      }
      updateFields.push('parent_id = :parent_id');
      replacements.parent_id = parent_id;
    }
    if (title !== undefined) {
      updateFields.push('title = :title');
      replacements.title = title;
    }
    if (url !== undefined) {
      updateFields.push('url = :url');
      replacements.url = url;
    }
    if (icon !== undefined) {
      updateFields.push('icon = :icon');
      replacements.icon = icon;
    }
    if (type !== undefined) {
      updateFields.push('type = :type');
      replacements.type = type;
    }
    if (entity_id !== undefined) {
      updateFields.push('entity_id = :entity_id');
      replacements.entity_id = entity_id;
    }
    if (target !== undefined) {
      updateFields.push('target = :target');
      replacements.target = target;
    }
    if (rel !== undefined) {
      updateFields.push('rel = :rel');
      replacements.rel = rel;
    }
    if (css_classes !== undefined) {
      updateFields.push('css_classes = :css_classes');
      replacements.css_classes = css_classes;
    }
    if (sort_order !== undefined) {
      updateFields.push('sort_order = :sort_order');
      replacements.sort_order = sort_order;
    }
    if (is_active !== undefined) {
      updateFields.push('is_active = :is_active');
      replacements.is_active = is_active;
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');

    if (updateFields.length === 1) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const query = `
      UPDATE menu_items
      SET ${updateFields.join(', ')}
      WHERE id = :id
      RETURNING *
    `;

    const result: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.UPDATE
    });

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(result[0][0]);
  } catch (error) {
    console.error('Failed to update menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
};

// Delete menu item
export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result: any = await sequelize.query(
      'DELETE FROM menu_items WHERE id = :id RETURNING *',
      {
        replacements: { id },
        type: QueryTypes.DELETE
      }
    );

    if (!result[0] || result[0].length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Failed to delete menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
};

// Bulk update sort order (for drag & drop)
export const updateMenuItemsOrder = async (req: Request, res: Response) => {
  try {
    const { items } = req.body; // Array of { id, sort_order, parent_id }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items array is required' });
    }

    // Use transaction for atomicity
    await sequelize.transaction(async (transaction) => {
      for (const item of items) {
        await sequelize.query(
          'UPDATE menu_items SET sort_order = :sort_order, parent_id = :parent_id WHERE id = :id',
          {
            replacements: {
              id: item.id,
              sort_order: item.sort_order,
              parent_id: item.parent_id || null
            },
            type: QueryTypes.UPDATE,
            transaction
          }
        );
      }
    });

    res.json({ message: 'Menu items order updated successfully' });
  } catch (error) {
    console.error('Failed to update menu items order:', error);
    res.status(500).json({ error: 'Failed to update menu items order' });
  }
};

