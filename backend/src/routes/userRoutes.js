import express from 'express'
import { authenticateToken } from '../middleware/authMiddleware.js'
import {
  getProfile,
  updateProfile,
  getDnsConnections,
  createDnsConnection,
  updateDnsConnection,
  deleteDnsConnection,
} from '../controllers/userController.js'

const router = express.Router()

router.get('/profile', authenticateToken, getProfile)
router.put('/profile', authenticateToken, updateProfile)
router.get('/dns', authenticateToken, getDnsConnections)
router.post('/dns', authenticateToken, createDnsConnection)
router.put('/dns/:id', authenticateToken, updateDnsConnection)
router.delete('/dns/:id', authenticateToken, deleteDnsConnection)

export default router
