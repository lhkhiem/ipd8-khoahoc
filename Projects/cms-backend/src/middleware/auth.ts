// Middleware xác thực JWT
// - Kiểm tra token trong Authorization header
// - Verify token và lưu thông tin user vào request
// - Trả về lỗi 401 nếu token không hợp lệ

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { getJWTSecret } from '../utils/jwtSecret';

// Mở rộng interface Request để thêm thuộc tính user
export interface AuthRequest extends Request {
  user?: any;  // Thông tin user sau khi verify token
}

function parseCookie(header?: string) {
  if (!header) return {} as Record<string, string>;
  return header.split(';').reduce((acc: Record<string, string>, part) => {
    const [k, ...v] = part.trim().split('=');
    acc[k] = decodeURIComponent(v.join('='));
    return acc;
  }, {});
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const bearer = req.headers.authorization?.split(' ')[1];
  const cookies = parseCookie(req.headers.cookie as string | undefined);
  const token = bearer || cookies['token'];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const jwtSecret = getJWTSecret();
    const decoded: any = jwt.verify(token, jwtSecret);
    // Enrich with current role from DB in case role changed after token issuance
    let role = decoded.role;
    if (!role && decoded.id) {
      const u = await User.findByPk(decoded.id, { attributes: ['role'] });
      role = (u as any)?.role;
    }
    req.user = { id: decoded.id, email: decoded.email, role };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

