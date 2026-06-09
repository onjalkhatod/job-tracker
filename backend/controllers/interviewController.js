const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. POST /api/applications/:applicationId/interviews
const createInterview = async (req, res, next) => {
  try {
    // 🛠️ FAIL-SAFE FIX: Fallback to 'id' if 'applicationId' is not parsed by the router
    const applicationId = req.params.applicationId || req.params.id;
    const { date, time, round, notes, completed, format } = req.body;

    // Fail-safe validation check
    if (!date || !time || !round || !format) {
      return res.status(400).json({ error: "Missing required tracking values (date, time, round, and format)." });
    }

    const parsedAppId = parseInt(applicationId);
    
    // Check if the parsed ID is completely broken
    if (!parsedAppId || isNaN(parsedAppId)) {
      console.error("❌ Broken ID received in backend params:", req.params);
      return res.status(400).json({ error: "Invalid application ID format passed to the server." });
    }

    try {
      const newInterview = await prisma.interview.create({
        data: {
          date: new Date(date),        // Ensures it maps to standard PostgreSQL DateTime
          time: time,
          round: round,                
          notes: notes || "",
          completed: completed || false,
          format: format,              
          application: {
            connect: {
              id: parsedAppId          // Fixed verified integer literal
            }
          }
        }
      });

      return res.status(201).json(newInterview);

    } catch (prismaError) {
      console.error("❌ Prisma Database Field Error Details:", prismaError.message);
      return res.status(400).json({ 
        error: "Database integrity violation.",
        details: prismaError.message 
      });
    }

  } catch (error) {
    console.error('Global Controller Crash:', error);
    next(error);
  }
};

// 2. GET /api/applications/:applicationId/interviews
const getApplicationInterviews = async (req, res, next) => {
  try {
    const applicationId = req.params.applicationId || req.params.id;
    const parsedAppId = parseInt(applicationId);

    const interviews = await prisma.interview.findMany({
      where: { applicationId: parsedAppId },
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

    // 1. Get ALL upcoming interviews (Fail-safe)
    const upcoming = await prisma.interview.findMany({
      where: {
        completed: false,
        date: { gte: now, lte: sevenDaysFromNow }
      },
      include: { application: true },
      orderBy: { date: 'asc' }
    });

    // 2. Filter manually to ensure isolation by user
    // We only return records where the application exists and matches the current user
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