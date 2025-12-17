import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import ConsultationSubmission from '../models/ConsultationSubmission';
import User from '../models/User';
import { QueryTypes } from 'sequelize';
import sequelize from '../config/database';

// POST /api/consultations - Submit consultation form (public)
export const submitConsultation = async (req: Request, res: Response) => {
  try {
    const {
      name,
      phone,
      email,
      province,
      message,
    } = req.body;

    // Validation
    if (!name || !phone || !province) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'phone', 'province'],
      });
    }

    // Phone validation (basic)
    const phoneRegex = /^[0-9+\-\s()]+$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Email validation (if provided)
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email address' });
      }
    }

    // Get client IP and user agent
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    // Create consultation submission
    const consultation = await ConsultationSubmission.create({
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : null,
      province: province.trim(),
      message: message ? message.trim() : null,
      status: 'new',
      ip_address: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
      user_agent: userAgent,
    });

    res.status(201).json({
      success: true,
      message: 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.',
      id: consultation.id,
    });
  } catch (error: any) {
    console.error('[submitConsultation] Error:', {
      message: error?.message,
      code: error?.code,
      detail: error?.detail,
      stack: error?.stack,
      name: error?.name,
      requestBody: {
        name: req.body?.name,
        phone: req.body?.phone,
        email: req.body?.email,
        province: req.body?.province,
        hasMessage: !!req.body?.message,
      },
    });
    res.status(500).json({
      error: 'Failed to submit consultation form',
      details: process.env.NODE_ENV === 'development' ? {
        message: error?.message,
        code: error?.code,
        detail: error?.detail,
      } : undefined,
    });
  }
};

// GET /api/consultations - List consultation submissions (admin)
export const getConsultations = async (req: AuthRequest, res: Response) => {
  try {
    const {
      status,
      province,
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
      whereConditions.push('cs.status = :status');
      replacements.status = status;
    }

    if (province) {
      whereConditions.push('cs.province = :province');
      replacements.province = province;
    }

    if (search) {
      whereConditions.push(
        '(cs.name ILIKE :search OR cs.phone ILIKE :search OR cs.email ILIKE :search OR cs.message ILIKE :search)'
      );
      replacements.search = `%${search}%`;
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Validate sortBy and sortOrder
    const allowedSortBy = ['created_at', 'updated_at', 'status', 'province', 'name'];
    const validSortBy = allowedSortBy.includes(sortBy as string) ? sortBy : 'created_at';
    const validSortOrder = (sortOrder as string).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM consultation_submissions cs
      ${whereClause}
    `;
    const countResult: any = await sequelize.query(countQuery, {
      replacements,
      type: QueryTypes.SELECT,
    });
    const total = parseInt(countResult[0].total, 10);

    // Get submissions with user info
    const query = `
      SELECT 
        cs.*,
        assigned.name as assigned_to_name,
        replied.name as replied_by_name
      FROM consultation_submissions cs
      LEFT JOIN users assigned ON cs.assigned_to = assigned.id
      LEFT JOIN users replied ON cs.replied_by = replied.id
      ${whereClause}
      ORDER BY cs.${validSortBy} ${validSortOrder}
      LIMIT :limit OFFSET :offset
    `;

    replacements.limit = limitNum;
    replacements.offset = offset;

    const submissions: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    res.json({
      success: true,
      data: submissions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('[getConsultations] Error:', error);
    res.status(500).json({
      error: 'Failed to fetch consultation submissions',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// GET /api/consultations/:id - Get consultation submission detail (admin)
export const getConsultationById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const submission = await ConsultationSubmission.findByPk(id, {
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

    if (!submission) {
      return res.status(404).json({ error: 'Consultation submission not found' });
    }

    res.json({ success: true, data: submission });
  } catch (error: any) {
    console.error('[getConsultationById] Error:', error);
    res.status(500).json({
      error: 'Failed to fetch consultation submission',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// PUT /api/consultations/:id - Update consultation submission (admin)
export const updateConsultation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      status,
      assigned_to,
      reply_message,
    } = req.body;

    const submission = await ConsultationSubmission.findByPk(id);

    if (!submission) {
      return res.status(404).json({ error: 'Consultation submission not found' });
    }

    // Update status
    if (status) {
      submission.status = status;
    }

    // Update assigned_to
    if (assigned_to !== undefined) {
      submission.assigned_to = assigned_to || null;
    }

    // Add reply
    if (reply_message) {
      submission.reply_message = reply_message;
      submission.replied_at = new Date();
      submission.replied_by = req.user!.id;
      submission.status = 'replied';
    }

    await submission.save();

    res.json({
      success: true,
      message: 'Consultation submission updated successfully',
      data: submission,
    });
  } catch (error: any) {
    console.error('[updateConsultation] Error:', error);
    res.status(500).json({
      error: 'Failed to update consultation submission',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// DELETE /api/consultations/:id - Delete consultation submission (admin)
export const deleteConsultation = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const submission = await ConsultationSubmission.findByPk(id);

    if (!submission) {
      return res.status(404).json({ error: 'Consultation submission not found' });
    }

    await submission.destroy();

    res.json({
      success: true,
      message: 'Consultation submission deleted successfully',
    });
  } catch (error: any) {
    console.error('[deleteConsultation] Error:', error);
    res.status(500).json({
      error: 'Failed to delete consultation submission',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// GET /api/consultations/stats - Get statistics (admin)
export const getConsultationStats = async (req: AuthRequest, res: Response) => {
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
      FROM consultation_submissions
    `;

    const stats: any = await sequelize.query(statsQuery, {
      type: QueryTypes.SELECT,
    });

    const provinceStatsQuery = `
      SELECT 
        province,
        COUNT(*) as count
      FROM consultation_submissions
      GROUP BY province
      ORDER BY count DESC
      LIMIT 10
    `;

    const provinceStats: any = await sequelize.query(provinceStatsQuery, {
      type: QueryTypes.SELECT,
    });

    res.json({
      success: true,
      data: {
        ...stats[0],
        byProvince: provinceStats,
      },
    });
  } catch (error: any) {
    console.error('[getConsultationStats] Error:', error);
    res.status(500).json({
      error: 'Failed to fetch consultation statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

