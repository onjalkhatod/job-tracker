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

    // 1. Fetch all raw applications belonging to this authenticated user
    const applications = await prisma.application.findMany({
      where: { userId }
    });

    // 2. Compute live analytical counts for your stat cards matrix
    const totalApplied = applications.length;
    const inProgress = applications.filter(app => app.status === 'SCREENING' || app.status === 'INTERVIEW').length;
    const offers = applications.filter(app => app.status === 'OFFER').length;
    const rejected = applications.filter(app => app.status === 'REJECTED').length;
    const upcomingInterviews = applications.filter(app => app.status === 'INTERVIEW').length;

    // 3. Structure Pipeline Breakdown array format required by your frontend BarChart
    const byStatus = [
      { name: 'Applied', count: applications.filter(app => app.status === 'APPLIED').length },
      { name: 'Screening', count: applications.filter(app => app.status === 'SCREENING').length },
      { name: 'Interview', count: upcomingInterviews },
      { name: 'Offers', count: offers },
      { name: 'Rejected', count: rejected },
    ];

    // 4. Group data chronologically by month for your high-density AreaChart trend line
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyGroups = {};

    applications.forEach(app => {
      const date = app.appliedDate ? new Date(app.appliedDate) : new Date();
      const monthName = months[date.getMonth()];
      monthlyGroups[monthName] = (monthlyGroups[monthName] || 0) + 1;
    });

    // Format trends object mapping arrays safely for the Recharts engine data key properties
    const monthlyTrends = Object.keys(monthlyGroups).map(month => ({
      month,
      count: monthlyGroups[month]
    }));

    // If the database timeline is clean but empty, send down stable coordinates so charts don't crash
    const finalTrends = monthlyTrends.length > 0 ? monthlyTrends : [
      { month: 'Apr', count: 0 },
      { month: 'May', count: 0 },
      { month: 'Jun', count: 0 }
    ];

    // 5. Transmit final unified JSON telemetry data structure back down to frontend useQuery hook
    res.status(200).json({
      totalApplied,
      inProgress,
      offers,
      rejected,
      upcomingInterviews,
      byStatus,
      monthlyTrends: finalTrends
    });

  } catch (error) {
    next(error);
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