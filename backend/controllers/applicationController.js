const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. GET ALL APPLICATIONS (Only for the logged-in user)
const getApplications = async (req, res) => {
  try {
    console.log("UserID:", req.user.userId)
    const applications = await prisma.application.findMany({
      where: { userId: req.user.userId }
    });
    console.log("DEBUG: Found applications count:", applications.length); 
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

const getApplicationStats = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: { userId: req.user.userId }
    });

    // Generate accurate counts
    const counts = {
      APPLIED: applications.filter(a => a.status === 'APPLIED').length,
      SCREENING: applications.filter(a => a.status === 'SCREENING').length,
      INTERVIEW: applications.filter(a => a.status === 'INTERVIEW').length,
      OFFER: applications.filter(a => a.status === 'OFFER').length,
      REJECTED: applications.filter(a => a.status === 'REJECTED').length,
    };

    res.json({
      totalApplied: applications.length,
      inProgress: counts.SCREENING + counts.INTERVIEW,
      offers: counts.OFFER,
      rejected: counts.REJECTED,
      upcomingInterviews: counts.INTERVIEW, 
      byStatus: [
        { name: 'Applied', count: counts.APPLIED },
        { name: 'Screening', count: counts.SCREENING },
        { name: 'Interview', count: counts.INTERVIEW },
        { name: 'Offers', count: counts.OFFER },
        { name: 'Rejected', count: counts.REJECTED },
      ],
      monthlyTrends: [{ month: 'Current', count: applications.length }]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const application = await prisma.application.findUnique({
      where: { id: parseInt(id) },
      include: {
        interviews: true // 🛠️ CRITICAL: If this line is missing, your frontend view breaks when matching lists!
      }
    });

    if (!application) {
      return res.status(404).json({ error: "Application tracking card parameters not found." });
    }

    res.status(200).json(application);
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  getApplicationStats,
  getApplicationById  
};