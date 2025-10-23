const express = require('express');
const Project = require('../models/Project');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
const router = express.Router();

// GET all projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new project (admin only)
router.post('/', auth, upload.array('images', 10), async (req, res) => {
  try {
    const images = req.files.map(file => `/uploads/${file.filename}`);
    const { title, category, description } = req.body;
    const project = new Project({ title, category, description, images });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT edit project (admin only)
router.put('/:id', auth, upload.array('images', 10), async (req, res) => {
  try {
    const images = req.files?.map(file => `/uploads/${file.filename}`) || [];
    const update = { ...req.body };
    if (images.length) update.images = images;
    const project = await Project.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE project (admin only) - also remove files from disk
const fs = require('fs');
const path = require('path');

router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Remove files
    if (project.images && project.images.length) {
      for (const imgPath of project.images) {
        try {
          // imgPath stored like '/uploads/<filename>'
          const full = path.join(__dirname, '..', imgPath.replace(/^\//, ''));
          if (fs.existsSync(full)) fs.unlinkSync(full);
        } catch (e) {
          console.warn('Failed to remove file', imgPath, e.message);
        }
      }
    }

  // delete project document from DB
  await Project.findByIdAndDelete(req.params.id);
  res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
