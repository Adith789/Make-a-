const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding BrightLoop ERP database...');

  // Admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@brightloop.com' },
    update: {},
    create: { email: 'admin@brightloop.com', password: adminPassword, name: 'Admin User', role: 'admin' }
  });

  // Sample customer
  const customerPassword = await bcrypt.hash('customer123', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@brightloop.com' },
    update: {},
    create: { email: 'customer@brightloop.com', password: customerPassword, name: 'Jane Doe', role: 'customer' }
  });

  // Plans
  const starterPlan = await prisma.plan.upsert({
    where: { id: 'plan-starter' },
    update: {},
    create: {
      id: 'plan-starter',
      name: 'Starter', description: 'Perfect for small teams',
      price: 999, intervalDays: 30,
      features: JSON.stringify(['Up to 5 users', '10GB Storage', 'Email Support', 'Basic Analytics'])
    }
  });

  const proPlan = await prisma.plan.upsert({
    where: { id: 'plan-pro' },
    update: {},
    create: {
      id: 'plan-pro',
      name: 'Professional', description: 'For growing businesses',
      price: 2999, intervalDays: 30,
      features: JSON.stringify(['Up to 25 users', '100GB Storage', 'Priority Support', 'Advanced Analytics', 'API Access'])
    }
  });

  const enterprisePlan = await prisma.plan.upsert({
    where: { id: 'plan-enterprise' },
    update: {},
    create: {
      id: 'plan-enterprise',
      name: 'Enterprise', description: 'For large organizations',
      price: 9999, intervalDays: 30,
      features: JSON.stringify(['Unlimited users', '1TB Storage', 'Dedicated Support', 'Custom Analytics', 'API Access', 'SLA Guarantee', 'Custom Integrations'])
    }
  });

  // Products
  const products = [
    { name: 'Business Analytics Suite', description: 'Real-time business intelligence platform', price: 4999, category: 'Software', sku: 'SW-001', stock: 100 },
    { name: 'Cloud Storage Pro', description: 'Scalable cloud storage solution', price: 1999, category: 'Infrastructure', sku: 'INF-001', stock: 50 },
    { name: 'CRM Enterprise', description: 'Customer relationship management system', price: 7999, category: 'Software', sku: 'SW-002', stock: 30 },
    { name: 'HR Management System', description: 'Complete HR solution', price: 3499, category: 'Software', sku: 'SW-003', stock: 75 },
    { name: 'Security Firewall Bundle', description: 'Advanced network security', price: 12999, category: 'Security', sku: 'SEC-001', stock: 20 },
  ];

  for (const p of products) {
    await prisma.product.upsert({ where: { sku: p.sku }, update: {}, create: p });
  }

  // Discounts
  await prisma.discount.upsert({
    where: { code: 'WELCOME20' },
    update: {},
    create: { code: 'WELCOME20', type: 'percent', value: 20, description: 'Welcome 20% off', maxUses: 100, expiresAt: new Date('2027-12-31') }
  });

  await prisma.discount.upsert({
    where: { code: 'FLAT500' },
    update: {},
    create: { code: 'FLAT500', type: 'fixed', value: 500, description: 'Flat ₹500 off', maxUses: 50, expiresAt: new Date('2027-06-30') }
  });

  // Sample subscription
  const endsAt = new Date();
  endsAt.setDate(endsAt.getDate() + 30);

  await prisma.subscription.create({
    data: { userId: customer.id, planId: starterPlan.id, status: 'active', price: starterPlan.price, endsAt }
  });

  console.log('✅ Seed complete!');
  console.log('👤 Admin: admin@brightloop.com / admin123');
  console.log('👤 Customer: customer@brightloop.com / customer123');
  console.log('🎟️  Discounts: WELCOME20 (20% off), FLAT500 (₹500 off)');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());
