// In-memory fallback data store if MongoDB server is offline
const bcrypt = require('bcryptjs');

let memoryProjects = [
  {
    _id: 'p1',
    id: 'p1',
    title: 'Smart Queue AI System',
    description: 'An AI-powered intelligent queue management system built to optimize user wait times and service dispatching with real-time analytics.',
    technologies: ['Python', 'React', 'Node.js', 'Machine Learning', 'MongoDB'],
    githubLink: 'https://github.com/praveen/smart-queue-ai',
    liveLink: 'https://smart-queue-ai.demo.app',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date('2026-01-15').toISOString(),
  },
  {
    _id: 'p2',
    id: 'p2',
    title: 'AI Medical Image Classifier',
    description: 'Deep learning classification pipeline for medical diagnostic scans, featuring dataset pre-processing and high-accuracy neural network inference.',
    technologies: ['Python', 'Machine Learning', 'HTML', 'CSS', 'JavaScript'],
    githubLink: 'https://github.com/praveen/ai-medical-classifier',
    liveLink: 'https://ai-med-classifier.demo.app',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date('2026-02-10').toISOString(),
  },
  {
    _id: 'p3',
    id: 'p3',
    title: 'Personal Portfolio Management System',
    description: 'Production-ready full-stack portfolio system with JWT dynamic authentication, REST APIs, responsive glassmorphism frontend, and admin dashboard.',
    technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript'],
    githubLink: 'https://github.com/praveen/portfolio-management-system',
    liveLink: 'https://praveen-portfolio.demo.app',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date('2026-03-01').toISOString(),
  },
  {
    _id: 'p4',
    id: 'p4',
    title: 'Automated Crop Disease Detector',
    description: 'Computer vision web application aiding agricultural monitoring by identifying crop leaf pathologies and suggesting treatments.',
    technologies: ['Python', 'C', 'Machine Learning', 'React', 'HTML'],
    githubLink: 'https://github.com/praveen/crop-pathology-ai',
    liveLink: 'https://crop-pathology.demo.app',
    image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date('2026-03-20').toISOString(),
  }
];

let memoryContacts = [
  {
    _id: 'c1',
    id: 'c1',
    name: 'Sarah Connor',
    email: 'sarah@techrecruiter.com',
    message: 'Impressed by your AI & Data Science projects! We would love to talk about an internship opportunity at our lab.',
    createdAt: new Date().toISOString(),
  }
];

let memoryAdmins = [
  {
    _id: 'a1',
    email: 'admin@praveen.com',
    // Hash for 'admin123'
    password: bcrypt.hashSync('admin123', 10),
  }
];

module.exports = {
  memoryProjects,
  memoryContacts,
  memoryAdmins
};
