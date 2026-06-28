import express from 'express'
import { authenticateToken } from '../middleware/authMiddleware.js'
import { getSettings, updateSettings } from '../controllers/settingsController.js'

const router = express.Router()

router.get('/', authenticateToken, getSettings)
router.put('/', authenticateToken, updateSettings)

export default router
