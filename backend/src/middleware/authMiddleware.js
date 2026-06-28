import prisma from '../config/prisma.js'
import { verifyAccessToken } from '../services/authService.js'

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Token not provided' })
  }

  try {
    const decoded = verifyAccessToken(token)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' })
  }
}

export const isAdmin = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Token not provided' })
  }

  try {
    const decoded = verifyAccessToken(token)
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.userId },
    })

    if (!admin) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    req.admin = admin
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' })
  }
}
