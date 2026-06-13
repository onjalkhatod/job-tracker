const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {

  // 1. Cleanup in correct order (Interviews depend on Applications)
  await prisma.interview.deleteMany();
  await prisma.application.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('demo1234', 10);
  
  // 2. Create Demo User
  const user = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@trackr.com',
      password: hashedPassword,
    },
  });

  // 3. Prepare Application Data
  const companies = ['Google', 'Tech Solutions Inc', 'Vercel', 'Innovate Data', 'Spotify', 'Stripe', 'Startup X', 'Airbnb', 'Atlassian', 'Shopify', 'CloudScale', 'Discord', 'Notion', 'GitHub', 'BuildFast'];
  const statuses = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED'];

  for (let i = 0; i < companies.length; i++) {
    // Create the Application
    const app = await prisma.application.create({
      data: {
        userId: user.id,
        company: companies[i],
        role: 'Software Engineer',
        status: statuses[i % 5],
        // Use the field name exactly as it appears in your schema.prisma
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000),
      },
    });

    // 4. Create Interviews for specific records
    // Inside the for-loop where you create interviews
    if (i % 3 === 0) {
        const today = new Date();
        // Force the date to today at 16:00 (4:00 PM)
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

main()
  .catch((e) => {
    console.error("Seed error details:", e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());