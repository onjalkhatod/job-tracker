const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. GET ALL APPLICATIONS (Only for the logged-in user)
const getApplications = async (req, res, next) => {
  try {
    const applications = await prisma.application.findMany({
      where: { userId: req.user.userId } // Filtered tightly by the attached token ID
    });
    res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
};

// 2. POST NEW APPLICATION
const createApplication = async (req, res, next) => {
  try {
    const { company, role, status, notes } = req.body;

    if (!company || !role) {
      return res.status(400).json({ error: 'Company and role are required' });
    }

    const newApplication = await prisma.application.create({
      data: {
        company,
        role,
        status: status || 'APPLIED',
        notes,
        userId: req.user.userId // Linked safely to the authenticated user
      }
    });

    res.status(201).json(newApplication);
  } catch (error) {
    next(error);
  }
};

// 3. PUT (UPDATE) APPLICATION
const updateApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { company, role, status, notes } = req.body;

    // Ownership check: Find the application first
    const app = await prisma.application.findUnique({
      where: { id: parseInt(id) }
    });

    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Block if a user tries to modify someone else's tracking data
    if (app.userId !== req.user.userId) {
      return res.status(401).json({ error: 'Unauthorized adjustment attempt' });
    }

    const updatedApp = await prisma.application.update({
      where: { id: parseInt(id) },
      data: { company, role, status, notes }
    });

    res.status(200).json(updatedApp);
  } catch (error) {
    next(error);
  }
};

// 4. DELETE APPLICATION
const deleteApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    const app = await prisma.application.findUnique({
      where: { id: parseInt(id) }
    });

    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (app.userId !== req.user.userId) {
      return res.status(401).json({ error: 'Unauthorized deletion attempt' });
    }

    await prisma.application.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({ message: 'Application deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getApplicationStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const statsGroup = await prisma.application.groupBy({
      by: ['status'],
      where: { userId: userId },
      _count: { status: true }
    });

    const upcomingInterviewsCount = await prisma.interview.count({
      where: {
        application: { userId: userId },
        completed: false,
        date: { gte: new Date() }
      }
    });

    const statsMap = {
      total: 0,
      applied: 0,
      screening: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
      upcomingInterviews: upcomingInterviewsCount
    };

    statsGroup.forEach(item => {
      const lowerStatus = item.status.toLowerCase();
      if (lowerStatus in statsMap) {
        statsMap[lowerStatus] = item._count.status;
        statsMap.total += item._count.status;
      }
    });

    res.status(200).json(statsMap);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  getApplicationStats 
};