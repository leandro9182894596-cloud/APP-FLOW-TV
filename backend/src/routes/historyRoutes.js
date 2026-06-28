import express from 'express'
import { authenticateToken } from '../middleware/authMiddleware.js'
import {
  getHistory,
  upsertHistory,
  deleteHistoryItem,
  clearHistory,
} from '../controllers/historyController.js'

const router = express.Router()

router.get('/', authenticateToken, getHistory)
router.post('/', authenticateToken, upsertHistory)
router.delete('/:contentType/:contentId', authenticateToken, deleteHistoryItem)
router.delete('/', authenticateToken, clearHistory)

export default router
