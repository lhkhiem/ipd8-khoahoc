import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { listUsers, createUser, updateUser, deleteUser } from '../controllers/usersController';

const router = Router();

router.get('/', authMiddleware, listUsers);
router.post('/', authMiddleware, createUser);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);

export default router;
