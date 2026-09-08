const Project = require('../models/Project');
const Contact = require('../models/Contact');
const { getMongoStatus } = require('../config/db');
const { memoryProjects, memoryContacts } = require('../store/memoryStore');

// @desc    Get system dashboard stats
// @route   GET /api/stats
// @access  Protected (Admin)
const getStats = async (req, res) => {
  try {
    let totalProjects = 0;
    let totalMessages = 0;

    if (getMongoStatus()) {
      totalProjects = await Project.countDocuments();
      totalMessages = await Contact.countDocuments();
    } else {
      totalProjects = memoryProjects.length;
      totalMessages = memoryContacts.length;
    }

    return res.status(200).json({
      success: true,
      stats: {
        totalProjects,
        totalMessages,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to compute system stats',
      error: error.message,
    });
  }
};

module.exports = { getStats };
