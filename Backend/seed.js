/**
 * ==============================================================================
 * Database Seed Script
 * ==============================================================================
 * Seeds the MongoDB database with realistic demo accounts and sample tasks.
 * Useful for viva demonstrations, manual UI exploration, and Postman testing.
 * 
 * Run with: node backend/seed.js
 */

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');
const User = require('./models/User');
const Task = require('./models/Task');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskflow_db';
    console.log(`[Seed] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('[Seed] Clearing existing demo records...');
    await User.deleteMany({ email: { $in: ['alice_demo@university.edu', 'bob_demo@university.edu'] } });

    console.log('[Seed] Creating demo user: Alice Johnson...');
    const alice = await User.create({
      name: 'Alice Johnson',
      email: 'alice_demo@university.edu',
      password: 'Password123!'
    });

    console.log('[Seed] Creating demo user: Bob Smith...');
    const bob = await User.create({
      name: 'Bob Smith',
      email: 'bob_demo@university.edu',
      password: 'Password123!'
    });

    console.log('[Seed] Creating sample tasks for Alice...');
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    await Task.create([
      {
        title: 'Complete MCA Backend Lab Assignment',
        description: 'Implement JWT authentication, Mongoose schemas, Express middleware, and REST CRUD endpoints.',
        priority: 'High',
        status: 'In Progress',
        deadline: new Date(now + 2 * day),
        userId: alice._id
      },
      {
        title: 'Study Bcrypt Hashing & Salt Rounds',
        description: 'Research one-way hashing functions, cost factors, rainbow table attack defenses, and timing attacks.',
        priority: 'Medium',
        status: 'Pending',
        deadline: new Date(now + 5 * day),
        userId: alice._id
      },
      {
        title: 'Configure MongoDB Compound Indexes',
        description: 'Add compound index on { userId: 1, status: 1 } and { userId: 1, createdAt: -1 } for query optimization.',
        priority: 'Low',
        status: 'Completed',
        deadline: new Date(now - 1 * day),
        userId: alice._id
      },
      {
        title: 'Design REST API Postman Collection',
        description: 'Document registration, login, and all task endpoints with proper JSON request bodies and status codes.',
        priority: 'High',
        status: 'Completed',
        deadline: new Date(now - 2 * day),
        userId: alice._id
      },
      {
        title: 'Prepare Viva & Presentation Slides',
        description: 'Summarize architectural diagrams, middleware pipeline, IDOR security protection, and JWT payload inspection.',
        priority: 'High',
        status: 'Pending',
        deadline: new Date(now + 1 * day),
        userId: alice._id
      }
    ]);

    console.log('[Seed] Creating private task for Bob (for IDOR verification)...');
    await Task.create({
      title: "Bob's Confidential Project Plan",
      description: 'Private project details only Bob should be able to view and manage.',
      priority: 'High',
      status: 'Pending',
      deadline: new Date(now + 10 * day),
      userId: bob._id
    });

    console.log('\n======================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Demo Credentials for Testing:');
    console.log('User 1:');
    console.log('  Email:    alice_demo@university.edu');
    console.log('  Password: Password123!');
    console.log('User 2 (for IDOR testing):');
    console.log('  Email:    bob_demo@university.edu');
    console.log('  Password: Password123!');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  }
};

seedDatabase();

