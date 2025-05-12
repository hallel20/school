import { Router } from 'express';
import { GET, POST, PUT, DELETE, RESTORE, GET_BY_ID } from '../controllers/faculty';
import { verifyToken } from '../middleware/auth';
import { hasRole } from '../middleware/auth';

const router = Router();
router.get('/', verifyToken, GET);
router.post('/', verifyToken, hasRole('Admin'), POST);
router.get('/:id', verifyToken, GET_BY_ID);
router.put('/:id', verifyToken, hasRole('Admin'), PUT);
router.delete('/:id', verifyToken, hasRole('Admin'), DELETE);
router.post('/:id/restore', verifyToken, hasRole('Admin'), RESTORE);

export default router;