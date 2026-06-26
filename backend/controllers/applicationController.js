const prisma = require('../prismaClient');
const getApplications = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: { userId: req.user.userId },
      include: { interviews: true }
    });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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
        userId: req.user.userId
      }
    });

    res.status(201).json(newApplication);
  } catch (error) {
    next(error);
  }
};

const updateApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { company, role, status, notes } = req.body;

    const app = await prisma.application.findUnique({
      where: { id: parseInt(id) }
    });

    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }

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
    const parsedId = parseInt(id);

    if (isNaN(parsedId)) {
      return res.status(400).json({ error: "Invalid application ID." });
    }


    const application = await prisma.application.findUnique({
      where: { id: parseInt(id) },
      include: {
        interviews: true 
      }
    });

    if (!application) {
      return res.status(404).json({ error: "Application tracking card parameters not found." });
    }

    if (application.userId !== req.user.userId) {
      return res.status(403).json({ error: "You do not have permission to view this application." });
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