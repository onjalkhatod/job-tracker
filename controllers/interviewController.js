const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. POST /api/applications/:applicationId/interviews
const createInterview = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { date, time, round, format, location } = req.body;

    // Verify parent application ownership
    const app = await prisma.application.findUnique({
      where: { id: parseInt(applicationId) }
    });

    if (!app || app.userId !== req.user.userId) {
      return res.status(401).json({ error: 'Unauthorized or application not found' });
    }

    const newInterview = await prisma.interview.create({
      data: {
        applicationId: parseInt(applicationId),
        date: new Date(date), // Formats "YYYY-MM-DD" string cleanly to DateTime
        time,
        round,
        format,
        location,
        completed: false
      }
    });

    res.status(201).json(newInterview);
  } catch (error) {
    next(error);
  }
};

// 2. GET /api/applications/:applicationId/interviews
const getApplicationInterviews = async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    const app = await prisma.application.findUnique({
      where: { id: parseInt(applicationId) }
    });

    if (!app || app.userId !== req.user.userId) {
      return res.status(401).json({ error: 'Unauthorized or application not found' });
    }

    const interviews = await prisma.interview.findMany({
      where: { applicationId: parseInt(applicationId) },
      orderBy: { date: 'asc' }
    });

    res.status(200).json(interviews);
  } catch (error) {
    next(error);
  }
};

// 3. PUT /api/interviews/:id
const updateInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { time, date, round, format, location, completed } = req.body;

    const interview = await prisma.interview.findUnique({
      where: { id: parseInt(id) },
      include: { application: true }
    });

    if (!interview || interview.application.userId !== req.user.userId) {
      return res.status(401).json({ error: 'Unauthorized or interview not found' });
    }

    const updatedInterview = await prisma.interview.update({
      where: { id: parseInt(id) },
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
    next(error);
  }
};

// 4. DELETE /api/interviews/:id
const deleteInterview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const interview = await prisma.interview.findUnique({
      where: { id: parseInt(id) },
      include: { application: true }
    });

    if (!interview || interview.application.userId !== req.user.userId) {
      return res.status(401).json({ error: 'Unauthorized or interview not found' });
    }

    await prisma.interview.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({ message: 'Interview deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// 5. GET /api/interviews/upcoming (Next 7 days)
const getUpcomingInterviews = async (req, res, next) => {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    const upcoming = await prisma.interview.findMany({
      where: {
        application: { userId: req.user.userId },
        completed: false,
        date: {
          gte: now,
          lte: sevenDaysFromNow
        }
      },
      include: {
        application: true // Merges company name and role info with the response
      },
      orderBy: { date: 'asc' }
    });

    res.status(200).json(upcoming);
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