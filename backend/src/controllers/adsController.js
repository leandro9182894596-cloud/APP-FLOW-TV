import prisma from '../config/prisma.js'

export const getAds = async (req, res) => {
  try {
    const now = new Date()
    const ads = await prisma.ads.findMany({
      where: {
        active: true,
        OR: [
          { startDate: null },
          { startDate: { lte: now } },
        ],
        OR: [
          { endDate: null },
          { endDate: { gte: now } },
        ],
      },
    })
    res.json(ads)
  } catch (error) {
    console.error('Get ads error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
