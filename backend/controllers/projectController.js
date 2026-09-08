const Project = require('../models/Project');
const { getMongoStatus } = require('../config/db');
const { memoryProjects } = require('../store/memoryStore');

// @desc    Get all projects (with optional search and technology filter)
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res) => {
  try {
    const { search, tech } = req.query;

    if (getMongoStatus()) {
      let query = {};
      if (search) {
        query.title = { $regex: search, $options: 'i' };
      }
      if (tech && tech !== 'All') {
        query.technologies = { $in: [new RegExp(tech, 'i')] };
      }

      const projects = await Project.find(query).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        count: projects.length,
        data: projects,
      });
    } else {
      let filtered = [...memoryProjects];

      if (search) {
        filtered = filtered.filter((p) =>
          p.title.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (tech && tech !== 'All') {
        filtered = filtered.filter((p) =>
          p.technologies.some((t) => t.toLowerCase() === tech.toLowerCase())
        );
      }

      return res.status(200).json({
        success: true,
        count: filtered.length,
        data: filtered,
      });
    }
  } catch (error) {
    console.error('Error fetching projects:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: error.message,
    });
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    if (getMongoStatus()) {
      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        });
      }
      return res.status(200).json({
        success: true,
        data: project,
      });
    } else {
      const project = memoryProjects.find((p) => p._id === id || p.id === id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        });
      }
      return res.status(200).json({
        success: true,
        data: project,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching project details',
      error: error.message,
    });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Protected (Admin)
const createProject = async (req, res) => {
  try {
    const { title, description, technologies, githubLink, liveLink, image } = req.body;

    if (!title || !description || !technologies) {
      return res.status(400).json({
        success: false,
        message: 'Title, description and technologies are required',
      });
    }

    const techArray = Array.isArray(technologies)
      ? technologies
      : technologies.split(',').map((t) => t.trim());

    if (getMongoStatus()) {
      const project = await Project.create({
        title,
        description,
        technologies: techArray,
        githubLink: githubLink || '',
        liveLink: liveLink || '',
        image: image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
      });

      return res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project,
      });
    } else {
      const newProj = {
        _id: 'p_' + Date.now(),
        id: 'p_' + Date.now(),
        title,
        description,
        technologies: techArray,
        githubLink: githubLink || '',
        liveLink: liveLink || '',
        image: image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
        createdAt: new Date().toISOString(),
      };
      memoryProjects.unshift(newProj);

      return res.status(201).json({
        success: true,
        message: 'Project created successfully (in-memory mode)',
        data: newProj,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message,
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Protected (Admin)
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, technologies, githubLink, liveLink, image } = req.body;

    const techArray = Array.isArray(technologies)
      ? technologies
      : technologies
      ? technologies.split(',').map((t) => t.trim())
      : undefined;

    if (getMongoStatus()) {
      let project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        });
      }

      if (title) project.title = title;
      if (description) project.description = description;
      if (techArray) project.technologies = techArray;
      if (githubLink !== undefined) project.githubLink = githubLink;
      if (liveLink !== undefined) project.liveLink = liveLink;
      if (image !== undefined) project.image = image;

      await project.save();

      return res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        data: project,
      });
    } else {
      const idx = memoryProjects.findIndex((p) => p._id === id || p.id === id);
      if (idx === -1) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        });
      }

      if (title) memoryProjects[idx].title = title;
      if (description) memoryProjects[idx].description = description;
      if (techArray) memoryProjects[idx].technologies = techArray;
      if (githubLink !== undefined) memoryProjects[idx].githubLink = githubLink;
      if (liveLink !== undefined) memoryProjects[idx].liveLink = liveLink;
      if (image !== undefined) memoryProjects[idx].image = image;

      return res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        data: memoryProjects[idx],
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: error.message,
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Protected (Admin)
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (getMongoStatus()) {
      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        });
      }

      await project.deleteOne();
      return res.status(200).json({
        success: true,
        message: 'Project deleted successfully',
        id,
      });
    } else {
      const idx = memoryProjects.findIndex((p) => p._id === id || p.id === id);
      if (idx === -1) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        });
      }

      memoryProjects.splice(idx, 1);
      return res.status(200).json({
        success: true,
        message: 'Project deleted successfully',
        id,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error.message,
    });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
