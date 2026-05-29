const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. GET ALL APPLICATIONS (Only for the logged-in user)
const getApplications = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: { userId: req.user.userId } // Filtered tightly by the attached token ID
    });
    res.status(200).json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while fetching applications' });
  }
};

// 2. POST NEW APPLICATION
const createApplication = async (req, res) => {
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
    console.error(error);
    res.status(500).json({ error: 'Server error while creating application' });
  }
};

// 3. PUT (UPDATE) APPLICATION
const updateApplication = async (req, res) => {
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
    console.error(error);
    res.status(500).json({ error: 'Server error while updating application' });
  }
};

// 4. DELETE APPLICATION
const deleteApplication = async (req, res) => {
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
    console.error(error);
    res.status(500).json({ error: 'Server error while deleting application' });
  }
};

module.exports = {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication
};