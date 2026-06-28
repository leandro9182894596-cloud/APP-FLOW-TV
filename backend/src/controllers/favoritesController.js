import prisma from '../config/prisma.js'

export const getFavorites = async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
    })
    res.json(favorites)
  } catch (error) {
    console.error('Get favorites error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createFavorite = async (req, res) => {
  try {
    const { contentType, contentId, title, poster } = req.body

    const favorite = await prisma.favorite.create({
      data: {
        userId: req.user.id,
        contentType,
        contentId,
        title,
        poster,
      },
    })

    res.status(201).json(favorite)
  } catch (error) {
    console.error('Create favorite error:', error)
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Already in favorites' })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteFavorite = async (req, res) => {
  try {
    const { contentType, contentId } = req.params

    await prisma.favorite.deleteMany({
      where: {
        userId: req.user.id,
        contentType,
        contentId: parseInt(contentId),
      },
    })

    res.json({ message: 'Favorite removed successfully' })
  } catch (error) {
    console.error('Delete favorite error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
