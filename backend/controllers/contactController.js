const Contact = require('../models/Contact');
const { getMongoStatus } = require('../config/db');
const { memoryContacts } = require('../store/memoryStore');

// @desc    Submit new contact message
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
      });
    }

    if (getMongoStatus()) {
      const newContact = await Contact.create({
        name,
        email,
        message,
      });

      return res.status(201).json({
        success: true,
        message: 'Your message has been sent successfully!',
        data: newContact,
      });
    } else {
      const contactObj = {
        _id: 'c_' + Date.now(),
        id: 'c_' + Date.now(),
        name,
        email,
        message,
        createdAt: new Date().toISOString(),
      };
      memoryContacts.unshift(contactObj);

      return res.status(201).json({
        success: true,
        message: 'Your message has been sent successfully!',
        data: contactObj,
      });
    }
  } catch (error) {
    console.error('Contact submission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while submitting your message',
      error: error.message,
    });
  }
};

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Protected (Admin)
const getContacts = async (req, res) => {
  try {
    if (getMongoStatus()) {
      const contacts = await Contact.find().sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: contacts.length,
        data: contacts,
      });
    } else {
      return res.status(200).json({
        success: true,
        count: memoryContacts.length,
        data: memoryContacts,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve messages',
      error: error.message,
    });
  }
};

// @desc    Delete a contact message
// @route   DELETE /api/contact/:id
// @access  Protected (Admin)
const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    if (getMongoStatus()) {
      const msg = await Contact.findById(id);
      if (!msg) {
        return res.status(404).json({
          success: false,
          message: 'Message not found',
        });
      }
      await msg.deleteOne();
      return res.status(200).json({
        success: true,
        message: 'Message deleted',
        id,
      });
    } else {
      const idx = memoryContacts.findIndex((c) => c._id === id || c.id === id);
      if (idx === -1) {
        return res.status(404).json({
          success: false,
          message: 'Message not found',
        });
      }
      memoryContacts.splice(idx, 1);
      return res.status(200).json({
        success: true,
        message: 'Message deleted',
        id,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete contact message',
      error: error.message,
    });
  }
};

module.exports = {
  submitContact,
  getContacts,
  deleteContact,
};
