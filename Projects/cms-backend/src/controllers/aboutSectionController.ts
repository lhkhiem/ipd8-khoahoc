import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import AboutSection from '../models/AboutSection';
import { Op } from 'sequelize';

// Get all about sections
export const getAllAboutSections = async (req: Request, res: Response) => {
  try {
    const { active_only, section_key } = req.query;
    
    const where: any = {};
    if (active_only === 'true') {
      where.is_active = true;
    }
    if (section_key) {
      where.section_key = section_key;
    }
    
    const sections = await AboutSection.findAll({
      where,
      order: [['order_index', 'ASC'], ['created_at', 'DESC']],
    });
    
    res.json({ success: true, data: sections });
  } catch (error: any) {
    console.error('[getAllAboutSections] Error:', error.message);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch about sections',
      message: error.message 
    });
  }
};

// Get about section by ID
export const getAboutSectionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const section = await AboutSection.findByPk(id);
    
    if (!section) {
      return res.status(404).json({ error: 'About section not found' });
    }
    
    res.json(section);
  } catch (error: any) {
    console.error('[getAboutSectionById] Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch about section',
      message: error.message 
    });
  }
};

// Get about section by key
export const getAboutSectionByKey = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    
    const section = await AboutSection.findOne({
      where: { section_key: key, is_active: true },
    });
    
    if (!section) {
      return res.status(404).json({ error: 'About section not found' });
    }
    
    res.json(section);
  } catch (error: any) {
    console.error('[getAboutSectionByKey] Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch about section',
      message: error.message 
    });
  }
};

// Create about section
export const createAboutSection = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      section_key, 
      title, 
      content, 
      image_url, 
      button_text, 
      button_link, 
      list_items, 
      order_index, 
      is_active 
    } = req.body;
    
    if (!section_key || section_key.trim() === '') {
      return res.status(400).json({ error: 'Section key is required' });
    }
    
    // Check if section_key already exists
    const existing = await AboutSection.findOne({
      where: { section_key: section_key.trim() },
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Section key already exists' });
    }
    
    const section = await AboutSection.create({
      section_key: section_key.trim(),
      title: title && title.trim() ? title.trim() : null,
      content: content && content.trim() ? content.trim() : null,
      image_url: image_url && image_url.trim() ? image_url.trim() : null,
      button_text: button_text && button_text.trim() ? button_text.trim() : null,
      button_link: button_link && button_link.trim() ? button_link.trim() : null,
      list_items: list_items || null,
      order_index: order_index !== undefined ? order_index : 0,
      is_active: is_active !== undefined ? is_active : true,
    });
    
    res.status(201).json(section);
  } catch (error: any) {
    console.error('[createAboutSection] Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to create about section',
      message: error.message 
    });
  }
};

// Update about section
export const updateAboutSection = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      section_key, 
      title, 
      content, 
      image_url, 
      button_text, 
      button_link, 
      list_items, 
      order_index, 
      is_active 
    } = req.body;
    
    const section = await AboutSection.findByPk(id);
    
    if (!section) {
      return res.status(404).json({ error: 'About section not found' });
    }
    
    // If section_key is being updated, check for duplicates
    if (section_key && section_key !== section.section_key) {
      const existing = await AboutSection.findOne({
        where: { 
          section_key: section_key.trim(),
          id: { [Op.ne]: id },
        },
      });
      
      if (existing) {
        return res.status(400).json({ error: 'Section key already exists' });
      }
    }
    
    const updateData: any = {};
    if (section_key !== undefined) updateData.section_key = section_key.trim();
    if (title !== undefined) updateData.title = title && title.trim() ? title.trim() : null;
    if (content !== undefined) updateData.content = content && content.trim() ? content.trim() : null;
    if (image_url !== undefined) updateData.image_url = image_url && image_url.trim() ? image_url.trim() : null;
    if (button_text !== undefined) updateData.button_text = button_text && button_text.trim() ? button_text.trim() : null;
    if (button_link !== undefined) updateData.button_link = button_link && button_link.trim() ? button_link.trim() : null;
    if (list_items !== undefined) updateData.list_items = list_items || null;
    if (order_index !== undefined) updateData.order_index = order_index;
    if (is_active !== undefined) updateData.is_active = is_active;
    
    await section.update(updateData);
    
    res.json(section);
  } catch (error: any) {
    console.error('[updateAboutSection] Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to update about section',
      message: error.message 
    });
  }
};

// Delete about section
export const deleteAboutSection = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const section = await AboutSection.findByPk(id);
    
    if (!section) {
      return res.status(404).json({ error: 'About section not found' });
    }
    
    await section.destroy();
    
    res.json({ message: 'About section deleted successfully' });
  } catch (error: any) {
    console.error('[deleteAboutSection] Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to delete about section',
      message: error.message 
    });
  }
};




