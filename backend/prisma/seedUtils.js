const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function runSeedScript() {

  await prisma.interview.deleteMany();
  await prisma.application.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('demo1234', 10);
  
  const user = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@trackr.com',
      password: hashedPassword,
    },
  });

  const companies = ['Google', 'Tech Solutions Inc', 'Vercel', 'Innovate Data', 'Spotify', 'Stripe', 'Startup X', 'Airbnb', 'Atlassian', 'Shopify', 'CloudScale', 'Discord', 'Notion', 'GitHub', 'BuildFast'];
  const statuses = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED'];

  for (let i = 0; i < companies.length; i++) {
    const app = await prisma.application.create({
      data: {
        userId: user.id,
        company: companies[i],
        role: 'Software Engineer',
        status: statuses[i % 5],
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000),
      },
    });

    if (i % 3 === 0) {
        const today = new Date();
        today.setHours(16, 0, 0, 0); 

        await prisma.interview.create({
            data: {
            applicationId: app.id,
            date: today, 
            time: '4:00 PM',
            round: 'TECHNICAL',
            format: 'ONLINE',
            completed: false,
            },
        });
    }
  }
}

module.exports = { runSeedScript };