import { Router } from 'express';
import { register, login, verify, logout } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify', verify);
router.post('/logout', logout);

export default router;

