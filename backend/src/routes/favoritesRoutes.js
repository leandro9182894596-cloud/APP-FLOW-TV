import express from 'express'
import { authenticateToken } from '../middleware/authMiddleware.js'
import {
  getFavorites,
  createFavorite,
  deleteFavorite,
} from '../controllers/favoritesController.js'

const router = express.Router()

router.get('/', authenticateToken, getFavorites)
router.post('/', authenticateToken, createFavorite)
router.delete('/:contentType/:contentId', authenticateToken, deleteFavorite)

export default router
