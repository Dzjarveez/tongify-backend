import { Router } from 'express';
import { registerUser, loginUser, refreshToken, logoutUser } from '@/controllers/userController';

const router = Router();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.post('/token', refreshToken);

router.post('/logout', logoutUser);

export default router;
