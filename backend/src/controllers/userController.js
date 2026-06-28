import prisma from '../config/prisma.js'

export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        profiles: true,
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const { username, avatarUrl } = req.body

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        username,
        avatarUrl,
        profiles: {
          update: {
            username,
            avatarUrl,
          },
        },
      },
    })

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getDnsConnections = async (req, res) => {
  try {
    const connections = await prisma.dnsConnection.findMany({
      where: { userId: req.user.id },
    })
    res.json(connections)
  } catch (error) {
    console.error('Get DNS connections error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const createDnsConnection = async (req, res) => {
  try {
    const { dnsUrl, username, password } = req.body

    const connection = await prisma.dnsConnection.create({
      data: {
        userId: req.user.id,
        dnsUrl,
        username,
        password,
      },
    })

    res.status(201).json(connection)
  } catch (error) {
    console.error('Create DNS connection error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const updateDnsConnection = async (req, res) => {
  try {
    const { id } = req.params
    const { dnsUrl, username, password } = req.body

    const connection = await prisma.dnsConnection.update({
      where: { id, userId: req.user.id },
      data: {
        dnsUrl,
        username,
        password,
      },
    })

    res.json(connection)
  } catch (error) {
    console.error('Update DNS connection error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const deleteDnsConnection = async (req, res) => {
  try {
    const { id } = req.params

    await prisma.dnsConnection.delete({
      where: { id, userId: req.user.id },
    })

    res.json({ message: 'Connection deleted successfully' })
  } catch (error) {
    console.error('Delete DNS connection error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
