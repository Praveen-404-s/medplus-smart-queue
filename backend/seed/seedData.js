const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const Admin = require('../models/Admin');
const Project = require('../models/Project');
const Contact = require('../models/Contact');

const initialProjects = [
  {
    title: 'Smart Queue AI System',
    description: 'An intelligent AI-driven queue scheduling system optimizing service flow, estimated wait times, and server workload balancing using predictive algorithms.',
    technologies: ['Python', 'React', 'Node.js', 'Machine Learning', 'MongoDB'],
    githubLink: 'https://github.com/praveen/smart-queue-ai',
    liveLink: 'https://smart-queue-ai.demo.app',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'AI Medical Image Classifier',
    description: 'Deep learning medical diagnostic platform trained on radiological scans to identify abnormal features with automated report highlights.',
    technologies: ['Python', 'Machine Learning', 'HTML', 'CSS', 'JavaScript'],
    githubLink: 'https://github.com/praveen/ai-medical-classifier',
    liveLink: 'https://ai-med-classifier.demo.app',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Personal Portfolio Management System',
    description: 'Full-stack responsive personal portfolio with MongoDB backend, JWT admin portal, real-time message management, and project filtering.',
    technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript'],
    githubLink: 'https://github.com/praveen/portfolio-management-system',
    liveLink: 'https://praveen-portfolio.demo.app',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Automated Crop Disease Detector',
    description: 'Computer vision web application facilitating rapid diagnostic scans of crop leaves to assist farmers with early intervention strategies.',
    technologies: ['Python', 'C', 'Machine Learning', 'React', 'HTML'],
    githubLink: 'https://github.com/praveen/crop-pathology-ai',
    liveLink: 'https://crop-pathology.demo.app',
    image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800&q=80',
  },
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio_db';
    await mongoose.connect(mongoUri);
    console.log('🌱 Connected to MongoDB for Seeding...');

    // Seed Admin
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@praveen.com').toLowerCase();
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPass, 10);
      await Admin.create({
        email: adminEmail,
        password: hashedPassword,
      });
      console.log(`✅ Default Admin created: ${adminEmail}`);
    } else {
      console.log(`ℹ️ Admin user already exists: ${adminEmail}`);
    }

    // Seed Projects
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      await Project.insertMany(initialProjects);
      console.log(`✅ Seeded ${initialProjects.length} initial projects.`);
    } else {
      console.log(`ℹ️ Projects already exist in database (${projectCount} found).`);
    }

    // Seed initial contact message if empty
    const contactCount = await Contact.countDocuments();
    if (contactCount === 0) {
      await Contact.create({
        name: 'Sarah Connor',
        email: 'sarah@techrecruiter.com',
        message: 'Impressed by your AI & Data Science projects! We would love to talk about an internship opportunity at our lab.',
      });
      console.log(`✅ Seeded 1 sample contact message.`);
    }

    console.log('🎉 Database seeding complete!');
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
  }
};

if (require.main === module) {
  seedDB().then(() => mongoose.connection.close());
}

module.exports = { seedDB };
