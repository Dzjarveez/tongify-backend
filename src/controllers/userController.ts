import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '@/models/userModel';
import Token from '@/models/tokenModel';
import { JWT_SECRET } from '@/config/env';

// Регистрация
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
};

// Авторизация
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid email' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid password' });
      return;
    }

    const accessToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    await Token.create({ userId: user._id, token: refreshToken });

    res.status(200).json({ message: 'Login successful', accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

// Обновление токенов
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }

  try {
    // Проверяем наличие токена в базе данных
    const storedToken = await Token.findOne({ token: refreshToken });
    if (!storedToken) {
      res.status(403).json({ message: 'Invalid refresh token' });
      return;
    }

    const payload = jwt.verify(refreshToken, JWT_SECRET) as { id: string };
    const newAccessToken = jwt.sign({ id: payload.id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: 'Invalid refresh token' });
  }
};

// Logout
export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  try {
    // Удаляем refresh-токен из базы данных
    await Token.findOneAndDelete({ token: refreshToken });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error logging out', error });
  }
};
