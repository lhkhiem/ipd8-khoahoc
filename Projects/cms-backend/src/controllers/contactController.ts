import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import ContactMessage from '../models/ContactMessage';
import User from '../models/User';
import { QueryTypes } from 'sequelize';
import sequelize from '../config/database';
import { emailService } from '../services/email';
import { logActivity } from './activityLogController';
import {
  getContactNotificationTemplate,
  getContactConfirmationTemplate,
  getContactReplyTemplate,
} from '../utils/emailTemplates';

// POST /api/contacts - Submit contact form (public)
export const submitContact = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      subject,
      message,
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['firstName', 'lastName', 'email', 'subject', 'message'],
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Get client IP and user agent
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    // Create contact message
    const contactMessage = await ContactMessage.create({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : null,
      subject: subject.trim(),
      message: message.trim(),
      status: 'new',
      ip_address: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
      user_agent: userAgent,
    });

    // Send emails (non-blocking - don't fail if email fails)
    try {
      // Get admin email from settings
      const settingsResult: any = await sequelize.query(
        "SELECT value FROM settings WHERE namespace = 'general'",
        { type: 'SELECT' as any }
      );
      const generalSettings = settingsResult?.[0]?.value || {};
      const adminEmail = generalSettings.adminEmail || 'admin@pressup.com';

      const contactData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : undefined,
        subject: subject.trim(),
        message: message.trim(),
        createdAt: contactMessage.created_at,
      };

      // Send notification to admin
      if (emailService.isEnabled() && adminEmail) {
        const adminEmailHtml = getContactNotificationTemplate(contactData);
        emailService.sendEmail({
          to: adminEmail,
          subject: `New Contact Form Submission: ${subject.trim()}`,
          html: adminEmailHtml,
          replyTo: email.trim().toLowerCase(),
        }).catch((error) => {
          console.error('[submitContact] Failed to send admin notification:', error);
        });
      }

      // Send confirmation to customer
      if (emailService.isEnabled()) {
        const customerEmailHtml = getContactConfirmationTemplate(contactData);
        emailService.sendEmail({
          to: email.trim().toLowerCase(),
          subject: 'Thank You for Contacting Us',
          html: customerEmailHtml,
        }).catch((error) => {
          console.error('[submitContact] Failed to send customer confirmation:', error);
        });
      }
    } catch (emailError) {
      // Log but don't fail the request if email fails
      console.error('[submitContact] Email error:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      id: contactMessage.id,
    });
  } catch (error: any) {
    console.error('[submitContact] Error:', error);
    res.status(500).json({
      error: 'Failed to submit contact form',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// GET /api/contacts - List contact messages (admin)
export const getContacts = async (req: AuthRequest, res: Response) => {
  try {
    const {
      status,
      subject,
      search,
      page = '1',
      limit = '20',
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // Build WHERE clause
    const whereConditions: string[] = [];
    const replacements: any = {};

    if (status) {
      whereConditions.push('cm.status = :status');
      replacements.status = status;
    }

    if (subject) {
      whereConditions.push('cm.subject = :subject');
      replacements.subject = subject;
    }

    if (search) {
      whereConditions.push(
        '(cm.first_name ILIKE :search OR cm.last_name ILIKE :search OR cm.email ILIKE :search OR cm.message ILIKE :search)'
      );
      replacements.search = `%${search}%`;
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Validate sortBy and sortOrder
    const allowedSortBy = ['created_at', 'updated_at', 'status', 'subject', 'email'];
    const validSortBy = allowedSortBy.includes(sortBy as string) ? sortBy : 'created_at';
    const validSortOrder = (sortOrder as string).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM contact_messages cm
      ${whereClause}
    `;
    const countResult: any = await sequelize.query(countQuery, {
      replacements,
      type: QueryTypes.SELECT,
    });
    const total = parseInt(countResult[0].total, 10);

    // Get messages with user info
    const query = `
      SELECT 
        cm.*,
        assigned.name as assigned_to_name,
        replied.name as replied_by_name
      FROM contact_messages cm
      LEFT JOIN users assigned ON cm.assigned_to = assigned.id
      LEFT JOIN users replied ON cm.replied_by = replied.id
      ${whereClause}
      ORDER BY cm.${validSortBy} ${validSortOrder}
      LIMIT :limit OFFSET :offset
    `;

    replacements.limit = limitNum;
    replacements.offset = offset;

    const messages: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    res.json({
      success: true,
      data: messages,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('[getContacts] Error:', error);
    res.status(500).json({
      error: 'Failed to fetch contact messages',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// GET /api/contacts/:id - Get contact message detail (admin)
export const getContactById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const message = await ContactMessage.findByPk(id, {
      include: [
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'name', 'email'],
          required: false,
        },
        {
          model: User,
          as: 'repliedByUser',
          attributes: ['id', 'name', 'email'],
          required: false,
        },
      ],
    });

    if (!message) {
      return res.status(404).json({ error: 'Contact message not found' });
    }

    res.json({ success: true, data: message });
  } catch (error: any) {
    console.error('[getContactById] Error:', error);
    res.status(500).json({
      error: 'Failed to fetch contact message',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// PUT /api/contacts/:id - Update contact message (admin)
export const updateContact = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      status,
      assigned_to,
      reply_message,
    } = req.body;

    const message = await ContactMessage.findByPk(id);

    if (!message) {
      return res.status(404).json({ error: 'Contact message not found' });
    }

    // Update status
    if (status) {
      message.status = status;
    }

    // Update assigned_to
    if (assigned_to !== undefined) {
      message.assigned_to = assigned_to || null;
    }

    // Add reply
    if (reply_message) {
      message.reply_message = reply_message;
      message.replied_at = new Date();
      message.replied_by = req.user!.id;
      message.status = 'replied';
    }

    await message.save();

    // Log activity
    const contactName = `${message.first_name} ${message.last_name}`;
    const action = reply_message ? 'reply' : 'update';
    const description = reply_message 
      ? `Replied to contact message from "${contactName}"` 
      : `Updated contact message from "${contactName}"`;
    await logActivity(req, action, 'contact', id, contactName, description);

    // Send reply email to customer (non-blocking)
    if (reply_message && emailService.isEnabled()) {
      try {
        // Get admin user info
        const adminUser = await User.findByPk(req.user!.id, {
          attributes: ['id', 'name', 'email'],
        });

        const subjectLabels: Record<string, string> = {
          product: 'Product Inquiry',
          order: 'Order Status',
          support: 'Technical Support',
          'spa-development': 'Spa Development Services',
          partnership: 'Partnership Opportunities',
          other: 'Other',
        };

        const replyData = {
          customerName: `${message.first_name} ${message.last_name}`,
          customerEmail: message.email,
          originalSubject: message.subject,
          originalMessage: message.message,
          replyMessage: reply_message,
          adminName: adminUser?.name || 'Customer Service Team',
          adminEmail: adminUser?.email || undefined,
          repliedAt: message.replied_at || new Date(),
        };

        const replyEmailHtml = getContactReplyTemplate(replyData);
        const subjectLabel = subjectLabels[message.subject] || message.subject;

        emailService.sendEmail({
          to: message.email,
          subject: `Re: ${subjectLabel}`,
          html: replyEmailHtml,
          replyTo: adminUser?.email || undefined,
        }).catch((error) => {
          console.error('[updateContact] Failed to send reply email:', error);
        });
      } catch (emailError) {
        // Log but don't fail the request if email fails
        console.error('[updateContact] Email error:', emailError);
      }
    }

    res.json({
      success: true,
      message: 'Contact message updated successfully',
      data: message,
    });
  } catch (error: any) {
    console.error('[updateContact] Error:', error);
    res.status(500).json({
      error: 'Failed to update contact message',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// DELETE /api/contacts/:id - Delete contact message (admin)
export const deleteContact = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const message = await ContactMessage.findByPk(id);

    if (!message) {
      return res.status(404).json({ error: 'Contact message not found' });
    }

    const contactName = `${message.first_name} ${message.last_name}`;
    await message.destroy();

    // Log activity
    await logActivity(req, 'delete', 'contact', id, contactName, `Deleted contact message from "${contactName}"`);

    res.json({
      success: true,
      message: 'Contact message deleted successfully',
    });
  } catch (error: any) {
    console.error('[deleteContact] Error:', error);
    res.status(500).json({
      error: 'Failed to delete contact message',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// GET /api/contacts/stats - Get statistics (admin)
export const getContactStats = async (req: AuthRequest, res: Response) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'new') as new_count,
        COUNT(*) FILTER (WHERE status = 'read') as read_count,
        COUNT(*) FILTER (WHERE status = 'replied') as replied_count,
        COUNT(*) FILTER (WHERE status = 'archived') as archived_count,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as last_7_days,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as last_30_days
      FROM contact_messages
    `;

    const stats: any = await sequelize.query(statsQuery, {
      type: QueryTypes.SELECT,
    });

    const subjectStatsQuery = `
      SELECT 
        subject,
        COUNT(*) as count
      FROM contact_messages
      GROUP BY subject
      ORDER BY count DESC
    `;

    const subjectStats: any = await sequelize.query(subjectStatsQuery, {
      type: QueryTypes.SELECT,
    });

    res.json({
      success: true,
      data: {
        ...stats[0],
        bySubject: subjectStats,
      },
    });
  } catch (error: any) {
    console.error('[getContactStats] Error:', error);
    res.status(500).json({
      error: 'Failed to fetch contact statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

