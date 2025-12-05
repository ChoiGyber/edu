import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. 초기 Admin 계정 생성
  const adminEmail = 'admin@safety-edu.com';
  const adminPassword = 'admin';

  // 기존 admin 계정 확인
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('✅ Admin account already exists');
  } else {
    // 비밀번호 해싱
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: '시스템 관리자',
        phone: '010-0000-0000',
        companyName: '안전교육 플랫폼',
        industry: 'CONSTRUCTION',
        role: 'ADMIN',
        passwordHash,
        preferredLanguages: ['ko'],
        isActive: true,
      },
    });

    console.log('✅ Created admin account:');
    console.log('   Email:', adminEmail);
    console.log('   Password:', adminPassword);
    console.log('   ⚠️  IMPORTANT: Change this password after first login!');
  }

  // 2. 시스템 설정 기본값 생성
  console.log('\n📝 Creating system settings...');

  const defaultSettings = [
    {
      key: 'NEXTAUTH_URL',
      value: {
        encrypted: false,
        plainValue: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      },
    },
  ];

  for (const setting of defaultSettings) {
    const existing = await prisma.systemSetting.findUnique({
      where: { key: setting.key },
    });

    if (!existing) {
      await prisma.systemSetting.create({
        data: setting,
      });
      console.log(`   ✅ Created setting: ${setting.key}`);
    }
  }

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📌 Next steps:');
  console.log('   1. Login with admin@safety-edu.com / admin');
  console.log('   2. Go to /dashboard/settings');
  console.log('   3. Configure OAuth, R2, and other settings');
  console.log('   4. Change admin password in /dashboard/users');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
