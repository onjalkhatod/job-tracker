const prisma = require('../prismaClient');

async function findOwnedInterview(interviewId, userId) {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: { application: true },
  });
  if (!interview) return { reason: 'NOT_FOUND' };
  if (interview.application.userId !== userId) return { reason: 'FORBIDDEN' };
  return { reason: null };
}

async function findOwnedApplication(applicationId, userId) {
  const application = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!application) return { reason: 'NOT_FOUND' };
  if (application.userId !== userId) return { reason: 'FORBIDDEN' };
  return { reason: null };
}

// POST /api/applications/:applicationId/interviews
// POST /api/applications/:applicationId/interviews
const createInterview = async (req, res, next) => {
  try {
    const { applicationId } = req.params; 
    const { date, time, round, notes, completed, format, location } = req.body;

    
    if (!applicationId || !date || !time || !round || !format) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const parsedAppId = parseInt(applicationId);
    
    if (isNaN(parsedAppId)) {
      return res.status(400).json({ error: "Invalid application ID." });
    }

    const { reason } = await findOwnedApplication(parsedAppId, req.user.userId);
    if (reason === 'NOT_FOUND') return res.status(404).json({ error: "Application not found." });
    if (reason === 'FORBIDDEN') return res.status(403).json({ error: "You do not have permission to modify this application." });

    const newInterview = await prisma.interview.create({
      data: {
        date: new Date(date),        
        time: time,
        round: round,                
        notes: notes || "",
        completed: completed || false,
        format: format,
        location: location || "",
        application: {
          connect: { id: parsedAppId }
        }
      }
    });

    return res.status(201).json(newInterview);
  } catch (error) {
    console.error('Controller Error:', error);
    next(error);
  }
};

// GET /api/applications/:applicationId/interviews
const getApplicationInterviews = async (req, res, next) => {
  try {
    const applicationId = req.params.applicationId || req.params.id;
    const parsedAppId = parseInt(applicationId);
  
    if (isNaN(parsedAppId)) {
      return res.status(400).json({ error: "Invalid application ID." });
    }

    const { reason } = await findOwnedApplication(parsedAppId, req.user.userId);
    if (reason === 'NOT_FOUND') return res.status(404).json({ error: "Application not found." });
    if (reason === 'FORBIDDEN') return res.status(403).json({ error: "You do not have permission to view this application." });

    const interviews = await prisma.interview.findMany({
      where: { applicationId: parsedAppId },
      orderBy: { date: 'asc' }
    });

    res.status(200).json(interviews);
  } catch (error) {
    next(error);
  }
};

// PUT /api/interviews/:id
const updateInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { time, date, round, format, location, completed } = req.body;

    const interviewId = parseInt(id);

    const existingInterview = await prisma.interview.findUnique({
      where: { id: interviewId },
    });

    const { reason } = await findOwnedInterview(interviewId, req.user.userId);
    if (reason === 'NOT_FOUND') {
      return res.status(404).json({ 
        error: "Interview not found.", 
        message: `No interview record with ID ${interviewId} exists in the database.` 
      });
    }
    if (reason === 'FORBIDDEN') {
      return res.status(403).json({ error: "You do not have permission to modify this interview." });
    }

    const updatedInterview = await prisma.interview.update({
      where: { id: interviewId },
      data: {
        time,
        date: date ? new Date(date) : undefined,
        round,
        format,
        location,
        completed
      }
    });

    res.status(200).json(updatedInterview);
  } catch (error) {
    console.error("FULL PRISMA ERROR:", error);
    res.status(400).json({ 
      error: "Failed to update interview.", 
      details: error.message 
    });
  }
};

// DELETE /api/interviews/:id
const deleteInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const interviewId = parseInt(id);

    if (isNaN(interviewId)) {
      return res.status(400).json({ error: "Invalid interview ID." });
    }

    const { reason } = await findOwnedInterview(interviewId, req.user.userId);
    if (reason === 'NOT_FOUND') return res.status(404).json({ error: "Interview not found." });
    if (reason === 'FORBIDDEN') return res.status(403).json({ error: "You do not have permission to delete this interview." });

    await prisma.interview.delete({
      where: { id: interviewId }
    });

    res.status(200).json({ message: 'Interview deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// GET /api/interviews/upcoming (Next 7 days)
const getUpcomingInterviews = async (req, res, next) => {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    const upcoming = await prisma.interview.findMany({
      where: {
        completed: false,
        date: { gte: now, lte: sevenDaysFromNow },
        application: { userId: req.user.userId },
      },
      include: { application: true },
      orderBy: { date: 'asc' }
    });

res.status(200).json(upcoming);
res.status(200).json(upcoming);

    const filtered = upcoming.filter(i => i.application && i.application.userId === req.user?.id);

    res.status(200).json(filtered);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInterview,
  getApplicationInterviews,
  updateInterview,
  deleteInterview,
  getUpcomingInterviews
};