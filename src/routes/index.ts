import { Router } from 'express';
import userRoutes from '@/routes/userRoutes';

const router = Router();

router.get('/', (req, res) => {
  res.send('Server is running...');
});

router.use('/user', userRoutes);

export default router;
