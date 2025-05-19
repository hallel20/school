import { Router } from 'express';
import { GET, POST, PUT, DELETE, RESTORE, GET_BY_ID } from '../controllers/faculty';
import { verifyAdmin, verifyToken } from '../middleware/auth';

const router = Router();
router.get('/', verifyToken, GET);
router.post('/', verifyToken, verifyAdmin, POST);
router.get('/:id', verifyToken, GET_BY_ID);
router.put('/:id', verifyToken, verifyAdmin, PUT);
router.delete('/:id', verifyToken, verifyAdmin, DELETE);
router.post('/:id/restore', verifyToken, verifyAdmin, RESTORE);

export default router;