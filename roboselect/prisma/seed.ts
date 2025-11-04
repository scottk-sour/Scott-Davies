import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@roboselect.co.uk' },
    update: {},
    create: {
      email: 'admin@roboselect.co.uk',
      password: hashedPassword,
      name: 'Admin User',
      role: 'SUPER_ADMIN',
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create manufacturers
  const pudu = await prisma.manufacturer.upsert({
    where: { slug: 'pudu' },
    update: {},
    create: {
      name: 'Pudu Robotics',
      slug: 'pudu',
      description: 'Leading manufacturer of commercial service robots',
      website: 'https://www.pudurobotics.com',
    },
  });

  const keenon = await prisma.manufacturer.upsert({
    where: { slug: 'keenon' },
    update: {},
    create: {
      name: 'Keenon Robotics',
      slug: 'keenon',
      description: 'Innovative service robot solutions',
      website: 'https://www.keenonrobot.com',
    },
  });
  console.log('✅ Created manufacturers');

  // Create industries
  const industries = [
    { name: 'Hotels', slug: 'hotels', description: 'Hotel and accommodation services' },
    { name: 'Restaurants', slug: 'restaurants', description: 'Restaurants and dining establishments' },
    { name: 'Cafes', slug: 'cafes', description: 'Cafes and coffee shops' },
    { name: 'Care Homes', slug: 'care-homes', description: 'Care homes and elderly care facilities' },
    { name: 'Hospitals', slug: 'hospitals', description: 'Hospitals and medical facilities' },
  ];

  for (const industry of industries) {
    await prisma.industry.upsert({
      where: { slug: industry.slug },
      update: {},
      create: industry,
    });
  }
  console.log('✅ Created industries');

  // Create robot types
  const robotTypes = [
    { name: 'Delivery Robot', slug: 'delivery', description: 'Delivers food, drinks, and items' },
    { name: 'Cleaning Robot', slug: 'cleaning', description: 'Autonomous floor cleaning' },
    { name: 'Reception Robot', slug: 'reception', description: 'Greeting and reception services' },
    { name: 'Disinfection Robot', slug: 'disinfection', description: 'UV-C disinfection' },
  ];

  for (const type of robotTypes) {
    await prisma.robotType.upsert({
      where: { slug: type.slug },
      update: {},
      create: type,
    });
  }
  console.log('✅ Created robot types');

  // Create sample robot - BellaBot
  const deliveryType = await prisma.robotType.findUnique({ where: { slug: 'delivery' } });
  const hotelsIndustry = await prisma.industry.findUnique({ where: { slug: 'hotels' } });
  const restaurantsIndustry = await prisma.industry.findUnique({ where: { slug: 'restaurants' } });

  const bellabot = await prisma.robot.upsert({
    where: { slug: 'bellabot' },
    update: {},
    create: {
      name: 'BellaBot',
      slug: 'bellabot',
      model: 'BellaBot Pro',
      tagline: 'The cutest delivery robot with interactive features',
      description: 'BellaBot is an advanced delivery robot designed for restaurants, hotels, and cafes. With its cat-like appearance and interactive features, it not only delivers food and drinks efficiently but also provides a memorable experience for guests.',
      manufacturerId: pudu.id,
      priceUpfront: 1299900, // £12,999 in pence
      price2Year: 59900, // £599/month
      price3Year: 42900, // £429/month
      price5Year: 29900, // £299/month
      featured: true,
      active: true,
      features: [
        'Four trays with 10kg capacity each',
        'Interactive touchscreen display',
        'Obstacle avoidance with multi-sensor fusion',
        'Automatic charging',
        'Voice interaction',
        'Express delivery mode',
        '3D SLAM navigation',
        'WiFi and 4G connectivity',
      ],
      specifications: {
        dimensions: { height: '129cm', width: '56.5cm', depth: '54cm' },
        weight: '56kg',
        payload: '40kg (10kg per tray)',
        battery: '40Ah lithium battery',
        chargingTime: '4.5 hours',
        runtime: '12+ hours',
        speed: '1.2 m/s',
        navigation: '3D SLAM',
        sensors: 'Lidar, depth cameras, ultrasonic',
        connectivity: 'WiFi, 4G',
        warranty: '2 years',
      },
    },
  });

  // Link robot to industries
  if (hotelsIndustry) {
    await prisma.robotIndustry.upsert({
      where: {
        robotId_industryId: {
          robotId: bellabot.id,
          industryId: hotelsIndustry.id,
        },
      },
      update: {},
      create: {
        robotId: bellabot.id,
        industryId: hotelsIndustry.id,
      },
    });
  }

  if (restaurantsIndustry) {
    await prisma.robotIndustry.upsert({
      where: {
        robotId_industryId: {
          robotId: bellabot.id,
          industryId: restaurantsIndustry.id,
        },
      },
      update: {},
      create: {
        robotId: bellabot.id,
        industryId: restaurantsIndustry.id,
      },
    });
  }

  // Link robot to types
  if (deliveryType) {
    await prisma.robotRobotType.upsert({
      where: {
        robotId_typeId: {
          robotId: bellabot.id,
          typeId: deliveryType.id,
        },
      },
      update: {},
      create: {
        robotId: bellabot.id,
        typeId: deliveryType.id,
      },
    });
  }

  console.log('✅ Created sample robot: BellaBot');

  // Create email templates
  const emailTemplates = [
    {
      name: 'quote-sent',
      subject: 'Your Robot Quote from RoboSelect',
      htmlBody: '<p>Thank you for your interest...</p>',
      textBody: 'Thank you for your interest...',
      variables: ['customerName', 'quoteNumber', 'pdfUrl'],
    },
    {
      name: 'demo-confirmation',
      subject: 'Demo Confirmed - RoboSelect',
      htmlBody: '<p>Your demo is confirmed...</p>',
      textBody: 'Your demo is confirmed...',
      variables: ['customerName', 'demoDate', 'demoTime', 'robotName'],
    },
  ];

  for (const template of emailTemplates) {
    await prisma.emailTemplate.upsert({
      where: { name: template.name },
      update: {},
      create: template,
    });
  }
  console.log('✅ Created email templates');

  console.log('');
  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('📧 Admin login:');
  console.log('   Email: admin@roboselect.co.uk');
  console.log('   Password: admin123');
  console.log('');
  console.log('⚠️  Remember to change the admin password in production!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
