import prisma from '../config/prisma.js'

export const getSettings = async (req, res) => {
  try {
    let settings = await prisma.settings.findUnique({
      where: { userId: req.user.id },
    })

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          userId: req.user.id,
        },
      })
    }

    res.json(settings)
  } catch (error) {
    console.error('Get settings error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateSettings = async (req, res) => {
  try {
    const { logo, background, banners } = req.body

    const settings = await prisma.settings.upsert({
      where: { userId: req.user.id },
      update: {
        logo,
        background,
        banners,
      },
      create: {
        userId: req.user.id,
        logo,
        background,
        banners,
      },
    })

    res.json(settings)
  } catch (error) {
    console.error('Update settings error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
