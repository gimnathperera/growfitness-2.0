import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/modules/auth/auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  User,
  UserDocument,
  Kid,
  KidDocument,
  Session,
  SessionDocument,
  Location,
  LocationDocument,
  Invoice,
  InvoiceDocument,
  Banner,
  BannerDocument,
  FreeSessionRequest,
  FreeSessionRequestDocument,
  RescheduleRequest,
  RescheduleRequestDocument,
  ExtraSessionRequest,
  ExtraSessionRequestDocument,
  AuditLog,
  AuditLogDocument,
  Code,
  CodeDocument,
  Quiz,
  QuizDocument,
  Report,
  ReportDocument,
} from '../src/infra/database/schemas';
import {
  UserRole,
  UserStatus,
  SessionType,
  SessionStatus,
  InvoiceType,
  InvoiceStatus,
  RequestStatus,
  BannerTargetAudience,
} from '@grow-fitness/shared-types';
import { CodeType, CodeStatus } from '../src/infra/database/schemas/code.schema';
import { QuestionType } from '../src/infra/database/schemas/quiz.schema';
import { ReportType, ReportStatus } from '../src/infra/database/schemas/report.schema';

const DEFAULT_PASSWORD = 'password123';

async function seedDatabase() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);

  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
  const kidModel = app.get<Model<KidDocument>>(getModelToken(Kid.name));
  const sessionModel = app.get<Model<SessionDocument>>(getModelToken(Session.name));
  const locationModel = app.get<Model<LocationDocument>>(getModelToken(Location.name));
  const invoiceModel = app.get<Model<InvoiceDocument>>(getModelToken(Invoice.name));
  const bannerModel = app.get<Model<BannerDocument>>(getModelToken(Banner.name));
  const freeSessionRequestModel = app.get<Model<FreeSessionRequestDocument>>(
    getModelToken(FreeSessionRequest.name)
  );
  const rescheduleRequestModel = app.get<Model<RescheduleRequestDocument>>(
    getModelToken(RescheduleRequest.name)
  );
  const extraSessionRequestModel = app.get<Model<ExtraSessionRequestDocument>>(
    getModelToken(ExtraSessionRequest.name)
  );
  const auditLogModel = app.get<Model<AuditLogDocument>>(getModelToken(AuditLog.name));
  const codeModel = app.get<Model<CodeDocument>>(getModelToken(Code.name));
  const quizModel = app.get<Model<QuizDocument>>(getModelToken(Quiz.name));
  const reportModel = app.get<Model<ReportDocument>>(getModelToken(Report.name));

  try {
    console.log('\n🌱 Starting database seeding...\n');

    // Check if data already exists (optional - can be controlled by flag)
    const existingUsers = await userModel.countDocuments().exec();
    if (existingUsers > 0) {
      console.log('⚠️  Database already contains data.');
      console.log('   Skipping seed to prevent overwriting existing data.');
      console.log('   Use --force flag to seed anyway (not implemented in this version).\n');
      await app.close();
      return;
    }

    const passwordHash = await authService.hashPassword(DEFAULT_PASSWORD);

    // 1. Seed Locations
    console.log('📍 Creating locations...');
    const locations = await locationModel.insertMany([
      {
        name: 'Main Fitness Center',
        address: '123 Fitness St, San Francisco, CA 94102',
        geo: { lat: 37.7749, lng: -122.4194 },
        isActive: true,
      },
      {
        name: 'Downtown Studio',
        address: '456 Market St, San Francisco, CA 94103',
        geo: { lat: 37.7849, lng: -122.4094 },
        isActive: true,
      },
      {
        name: 'Marina Branch',
        address: '789 Marina Blvd, San Francisco, CA 94123',
        geo: { lat: 37.8049, lng: -122.4394 },
        isActive: true,
      },
    ]);
    console.log(`   ✓ Created ${locations.length} locations`);

    // 2. Seed Coaches
    console.log('\n👨‍🏫 Creating coaches...');
    const coaches = await userModel.insertMany([
      {
        role: UserRole.COACH,
        email: 'coach.john@example.com',
        phone: '+14155551001',
        passwordHash,
        status: UserStatus.ACTIVE,
        coachProfile: { name: 'John Smith' },
      },
      {
        role: UserRole.COACH,
        email: 'coach.sarah@example.com',
        phone: '+14155551002',
        passwordHash,
        status: UserStatus.ACTIVE,
        coachProfile: { name: 'Sarah Johnson' },
      },
      {
        role: UserRole.COACH,
        email: 'coach.mike@example.com',
        phone: '+14155551003',
        passwordHash,
        status: UserStatus.ACTIVE,
        coachProfile: { name: 'Mike Davis' },
      },
    ]);
    console.log(`   ✓ Created ${coaches.length} coaches`);

    // 3. Seed Parents
    console.log('\n👨‍👩‍👧 Creating parents...');
    const parents = await userModel.insertMany([
      {
        role: UserRole.PARENT,
        email: 'parent.alice@example.com',
        phone: '+14155551011',
        passwordHash,
        status: UserStatus.ACTIVE,
        parentProfile: { name: 'Alice Williams', location: 'San Francisco, CA' },
      },
      {
        role: UserRole.PARENT,
        email: 'parent.bob@example.com',
        phone: '+14155551012',
        passwordHash,
        status: UserStatus.ACTIVE,
        parentProfile: { name: 'Bob Anderson', location: 'Oakland, CA' },
      },
      {
        role: UserRole.PARENT,
        email: 'parent.carol@example.com',
        phone: '+14155551013',
        passwordHash,
        status: UserStatus.ACTIVE,
        parentProfile: { name: 'Carol Martinez', location: 'Berkeley, CA' },
      },
      {
        role: UserRole.PARENT,
        email: 'parent.david@example.com',
        phone: '+14155551014',
        passwordHash,
        status: UserStatus.ACTIVE,
        parentProfile: { name: 'David Lee', location: 'San Francisco, CA' },
      },
    ]);
    console.log(`   ✓ Created ${parents.length} parents`);

    // 4. Seed Kids
    console.log('\n👶 Creating kids...');
    const kids = await kidModel.insertMany([
      {
        parentId: parents[0]._id,
        name: 'Emma Williams',
        gender: 'Female',
        birthDate: new Date('2018-05-15'),
        goal: 'Improve coordination and flexibility',
        currentlyInSports: true,
        medicalConditions: [],
        sessionType: SessionType.INDIVIDUAL,
      },
      {
        parentId: parents[0]._id,
        name: 'Olivia Williams',
        gender: 'Female',
        birthDate: new Date('2020-03-20'),
        goal: 'Build strength and confidence',
        currentlyInSports: false,
        medicalConditions: ['Mild asthma'],
        sessionType: SessionType.INDIVIDUAL,
      },
      {
        parentId: parents[1]._id,
        name: 'Lucas Anderson',
        gender: 'Male',
        birthDate: new Date('2019-08-10'),
        goal: 'Develop motor skills',
        currentlyInSports: true,
        medicalConditions: [],
        sessionType: SessionType.GROUP,
      },
      {
        parentId: parents[2]._id,
        name: 'Sophia Martinez',
        gender: 'Female',
        birthDate: new Date('2017-11-25'),
        goal: 'Competitive training',
        currentlyInSports: true,
        medicalConditions: [],
        sessionType: SessionType.INDIVIDUAL,
      },
      {
        parentId: parents[3]._id,
        name: 'Noah Lee',
        gender: 'Male',
        birthDate: new Date('2021-01-12'),
        goal: 'Fun fitness activities',
        currentlyInSports: false,
        medicalConditions: [],
        sessionType: SessionType.GROUP,
      },
      {
        parentId: parents[3]._id,
        name: 'Mia Lee',
        gender: 'Female',
        birthDate: new Date('2019-06-18'),
        goal: 'Social interaction through sports',
        currentlyInSports: true,
        medicalConditions: [],
        sessionType: SessionType.GROUP,
      },
    ]);
    console.log(`   ✓ Created ${kids.length} kids`);

    // 5. Seed Sessions
    console.log('\n🏃 Creating sessions...');
    const now = new Date();
    const sessions = await sessionModel.insertMany([
      {
        type: SessionType.INDIVIDUAL,
        coachId: coaches[0]._id,
        locationId: locations[0]._id,
        dateTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
        duration: 60,
        capacity: 1,
        kidId: kids[0]._id,
        status: SessionStatus.SCHEDULED,
        isFreeSession: false,
      },
      {
        type: SessionType.GROUP,
        coachId: coaches[1]._id,
        locationId: locations[1]._id,
        dateTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        duration: 90,
        capacity: 8,
        kids: [kids[2]._id, kids[4]._id, kids[5]._id],
        status: SessionStatus.CONFIRMED,
        isFreeSession: false,
      },
      {
        type: SessionType.INDIVIDUAL,
        coachId: coaches[0]._id,
        locationId: locations[0]._id,
        dateTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        duration: 60,
        capacity: 1,
        kidId: kids[3]._id,
        status: SessionStatus.SCHEDULED,
        isFreeSession: false,
      },
      {
        type: SessionType.GROUP,
        coachId: coaches[2]._id,
        locationId: locations[2]._id,
        dateTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // Next week
        duration: 90,
        capacity: 10,
        kids: [kids[2]._id, kids[5]._id],
        status: SessionStatus.SCHEDULED,
        isFreeSession: true,
      },
      {
        type: SessionType.INDIVIDUAL,
        coachId: coaches[1]._id,
        locationId: locations[1]._id,
        dateTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // Past session
        duration: 60,
        capacity: 1,
        kidId: kids[0]._id,
        status: SessionStatus.COMPLETED,
        isFreeSession: false,
      },
    ]);
    console.log(`   ✓ Created ${sessions.length} sessions`);

    // 6. Seed Invoices
    console.log('\n💰 Creating invoices...');
    const invoices = await invoiceModel.insertMany([
      {
        type: InvoiceType.PARENT_INVOICE,
        parentId: parents[0]._id,
        items: [
          { description: 'Individual Session - Emma Williams', amount: 75 },
          { description: 'Individual Session - Olivia Williams', amount: 75 },
        ],
        totalAmount: 150,
        status: InvoiceStatus.PENDING,
        dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
      {
        type: InvoiceType.PARENT_INVOICE,
        parentId: parents[1]._id,
        items: [{ description: 'Group Session - Lucas Anderson', amount: 50 }],
        totalAmount: 50,
        status: InvoiceStatus.PAID,
        dueDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        paidAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        type: InvoiceType.COACH_PAYOUT,
        coachId: coaches[0]._id,
        items: [{ description: 'Session payout for January', amount: 1200 }],
        totalAmount: 1200,
        status: InvoiceStatus.PENDING,
        dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        type: InvoiceType.PARENT_INVOICE,
        parentId: parents[3]._id,
        items: [
          { description: 'Group Session - Noah Lee', amount: 50 },
          { description: 'Group Session - Mia Lee', amount: 50 },
        ],
        totalAmount: 100,
        status: InvoiceStatus.OVERDUE,
        dueDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
    ]);
    console.log(`   ✓ Created ${invoices.length} invoices`);

    // 7. Seed Banners
    console.log('\n📢 Creating banners...');
    const banners = await bannerModel.insertMany([
      {
        imageUrl: 'https://example.com/banners/summer-camp.jpg',
        active: true,
        order: 0,
        targetAudience: BannerTargetAudience.ALL,
      },
      {
        imageUrl: 'https://example.com/banners/parent-workshop.jpg',
        active: true,
        order: 1,
        targetAudience: BannerTargetAudience.PARENT,
      },
      {
        imageUrl: 'https://example.com/banners/coach-training.jpg',
        active: true,
        order: 2,
        targetAudience: BannerTargetAudience.COACH,
      },
      {
        imageUrl: 'https://example.com/banners/new-programs.jpg',
        active: false,
        order: 3,
        targetAudience: BannerTargetAudience.ALL,
      },
    ]);
    console.log(`   ✓ Created ${banners.length} banners`);

    // 8. Seed Free Session Requests
    console.log('\n🎁 Creating free session requests...');
    const freeSessionRequests = await freeSessionRequestModel.insertMany([
      {
        parentName: 'Jennifer Brown',
        phone: '+14155552001',
        email: 'jennifer.brown@example.com',
        kidName: 'Alex Brown',
        sessionType: SessionType.INDIVIDUAL,
        selectedSessionId: sessions[3]._id,
        status: RequestStatus.SELECTED,
      },
      {
        parentName: 'Robert Taylor',
        phone: '+14155552002',
        email: 'robert.taylor@example.com',
        kidName: 'Zoe Taylor',
        sessionType: SessionType.GROUP,
        status: RequestStatus.PENDING,
      },
    ]);
    console.log(`   ✓ Created ${freeSessionRequests.length} free session requests`);

    // 9. Seed Reschedule Requests
    console.log('\n🔄 Creating reschedule requests...');
    const rescheduleRequests = await rescheduleRequestModel.insertMany([
      {
        sessionId: sessions[0]._id,
        requestedBy: parents[0]._id,
        newDateTime: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
        reason: 'Family emergency, need to reschedule',
        status: RequestStatus.PENDING,
      },
      {
        sessionId: sessions[2]._id,
        requestedBy: parents[2]._id,
        newDateTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        reason: 'Prefer afternoon time slot',
        status: RequestStatus.APPROVED,
        processedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
    ]);
    console.log(`   ✓ Created ${rescheduleRequests.length} reschedule requests`);

    // 10. Seed Extra Session Requests
    console.log('\n➕ Creating extra session requests...');
    const extraSessionRequests = await extraSessionRequestModel.insertMany([
      {
        parentId: parents[1]._id,
        kidId: kids[2]._id,
        coachId: coaches[1]._id,
        sessionType: SessionType.GROUP,
        locationId: locations[1]._id,
        preferredDateTime: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        status: RequestStatus.PENDING,
      },
      {
        parentId: parents[3]._id,
        kidId: kids[4]._id,
        coachId: coaches[2]._id,
        sessionType: SessionType.INDIVIDUAL,
        locationId: locations[2]._id,
        preferredDateTime: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
        status: RequestStatus.APPROVED,
      },
    ]);
    console.log(`   ✓ Created ${extraSessionRequests.length} extra session requests`);

    // 11. Seed Audit Logs
    console.log('\n📋 Creating audit logs...');
    const adminUser = await userModel.findOne({ role: UserRole.ADMIN }).exec();
    const adminId = adminUser?._id || parents[0]._id; // Fallback to first parent if no admin

    const auditLogs = await auditLogModel.insertMany([
      {
        actorId: adminId,
        action: 'CREATE_USER',
        entityType: 'User',
        entityId: coaches[0]._id,
        metadata: { email: coaches[0].email, role: UserRole.COACH },
        timestamp: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        actorId: adminId,
        action: 'CREATE_SESSION',
        entityType: 'Session',
        entityId: sessions[0]._id,
        metadata: { type: SessionType.INDIVIDUAL, coachId: coaches[0]._id.toString() },
        timestamp: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        actorId: adminId,
        action: 'CREATE_INVOICE',
        entityType: 'Invoice',
        entityId: invoices[0]._id,
        metadata: { type: InvoiceType.PARENT_INVOICE, totalAmount: 150 },
        timestamp: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        actorId: adminId,
        action: 'UPDATE_INVOICE_PAYMENT_STATUS',
        entityType: 'Invoice',
        entityId: invoices[1]._id,
        metadata: { status: InvoiceStatus.PAID },
        timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
    ]);
    console.log(`   ✓ Created ${auditLogs.length} audit logs`);

    // 12. Seed Codes
    console.log('\n🎟️  Creating codes...');
    const codes = await codeModel.insertMany([
      {
        code: 'SUMMER2024',
        type: CodeType.DISCOUNT,
        discountPercentage: 20,
        status: CodeStatus.ACTIVE,
        expiryDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        usageLimit: 100,
        usageCount: 15,
        description: 'Summer promotion - 20% off all sessions',
      },
      {
        code: 'FIRSTFREE',
        type: CodeType.PROMO,
        discountAmount: 75,
        status: CodeStatus.ACTIVE,
        expiryDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
        usageLimit: 50,
        usageCount: 8,
        description: 'First session free for new members',
      },
      {
        code: 'REFER50',
        type: CodeType.REFERRAL,
        discountAmount: 50,
        status: CodeStatus.ACTIVE,
        expiryDate: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000),
        usageLimit: 200,
        usageCount: 32,
        description: 'Referral code - $50 off for both referrer and referee',
      },
      {
        code: 'WINTER15',
        type: CodeType.DISCOUNT,
        discountPercentage: 15,
        status: CodeStatus.EXPIRED,
        expiryDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // Expired
        usageLimit: 50,
        usageCount: 45,
        description: 'Winter promotion - expired',
      },
    ]);
    console.log(`   ✓ Created ${codes.length} codes`);

    // 13. Seed Quizzes
    console.log('\n📝 Creating quizzes...');
    const quizzes = await quizModel.insertMany([
      {
        title: 'Fitness Knowledge Quiz',
        description: 'Test your knowledge about fitness and exercise',
        questions: [
          {
            question: 'What is the recommended daily water intake for children?',
            type: QuestionType.MULTIPLE_CHOICE,
            options: ['4-6 cups', '6-8 cups', '8-10 cups', '10-12 cups'],
            correctAnswer: '6-8 cups',
            points: 10,
          },
          {
            question: 'Stretching before exercise is important.',
            type: QuestionType.TRUE_FALSE,
            correctAnswer: 'True',
            points: 5,
          },
          {
            question: 'What are the three main components of fitness?',
            type: QuestionType.SHORT_ANSWER,
            correctAnswer: 'Cardiovascular, Strength, Flexibility',
            points: 15,
          },
        ],
        targetAudience: BannerTargetAudience.ALL,
        isActive: true,
        passingScore: 70,
      },
      {
        title: 'Nutrition Basics for Parents',
        description: 'Quiz to test knowledge about children nutrition',
        questions: [
          {
            question: 'How many servings of fruits and vegetables should children have daily?',
            type: QuestionType.MULTIPLE_CHOICE,
            options: ['2-3 servings', '3-4 servings', '4-5 servings', '5-6 servings'],
            correctAnswer: '5-6 servings',
            points: 10,
          },
          {
            question: 'Protein is only important for adults.',
            type: QuestionType.TRUE_FALSE,
            correctAnswer: 'False',
            points: 5,
          },
        ],
        targetAudience: BannerTargetAudience.PARENT,
        isActive: true,
        passingScore: 60,
      },
      {
        title: 'Coaching Techniques Assessment',
        description: 'Assessment for coaches on effective coaching methods',
        questions: [
          {
            question: 'What is the most important aspect when coaching children?',
            type: QuestionType.MULTIPLE_CHOICE,
            options: ['Winning', 'Having fun', 'Discipline', 'Competition'],
            correctAnswer: 'Having fun',
            points: 20,
          },
          {
            question: 'Positive reinforcement is more effective than punishment for children.',
            type: QuestionType.TRUE_FALSE,
            correctAnswer: 'True',
            points: 10,
          },
        ],
        targetAudience: BannerTargetAudience.COACH,
        isActive: true,
        passingScore: 80,
      },
    ]);
    console.log(`   ✓ Created ${quizzes.length} quizzes`);

    // 14. Seed Reports
    console.log('\n📊 Creating reports...');
    const reports = await reportModel.insertMany([
      {
        type: ReportType.ATTENDANCE,
        title: 'Monthly Attendance Report - January 2024',
        description: 'Attendance statistics for all sessions in January',
        startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        status: ReportStatus.GENERATED,
        data: {
          totalSessions: 45,
          totalAttendees: 120,
          averageAttendance: 2.67,
          attendanceRate: 85.5,
        },
        generatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        type: ReportType.FINANCIAL,
        title: 'Financial Summary - Q1 2024',
        description: 'Quarterly financial overview',
        startDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        status: ReportStatus.GENERATED,
        data: {
          totalRevenue: 12500,
          totalExpenses: 8500,
          netProfit: 4000,
          invoicesPaid: 45,
          invoicesPending: 12,
        },
        generatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        type: ReportType.PERFORMANCE,
        title: 'Kid Performance Report - Emma Williams',
        description: 'Performance tracking for individual kid',
        filters: { kidId: kids[0]._id.toString() },
        status: ReportStatus.PENDING,
      },
      {
        type: ReportType.SESSION_SUMMARY,
        title: 'Weekly Session Summary',
        description: 'Summary of all sessions for the current week',
        startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime()),
        status: ReportStatus.GENERATED,
        data: {
          totalSessions: 12,
          groupSessions: 8,
          individualSessions: 4,
          totalKids: 18,
        },
        generatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
    ]);
    console.log(`   ✓ Created ${reports.length} reports`);

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📝 Summary:');
    console.log(`   - ${locations.length} locations`);
    console.log(`   - ${coaches.length} coaches`);
    console.log(`   - ${parents.length} parents`);
    console.log(`   - ${kids.length} kids`);
    console.log(`   - ${sessions.length} sessions`);
    console.log(`   - ${invoices.length} invoices`);
    console.log(`   - ${banners.length} banners`);
    console.log(`   - ${freeSessionRequests.length} free session requests`);
    console.log(`   - ${rescheduleRequests.length} reschedule requests`);
    console.log(`   - ${extraSessionRequests.length} extra session requests`);
    console.log(`   - ${auditLogs.length} audit logs`);
    console.log(`   - ${codes.length} codes`);
    console.log(`   - ${quizzes.length} quizzes`);
    console.log(`   - ${reports.length} reports`);
    console.log('\n💡 Default password for all users: ' + DEFAULT_PASSWORD);
    console.log('   (Please change passwords after first login)\n');

    await app.close();
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    await app.close();
    process.exit(1);
  }
}

seedDatabase().catch(error => {
  console.error('Failed to seed database:', error);
  process.exit(1);
});
