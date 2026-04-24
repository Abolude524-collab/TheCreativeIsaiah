const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/projects', require('../routes/projects'));
app.use('/api/login', require('../routes/auth'));
app.use('/api/messages', require('../routes/messages'));
app.use('/api/contact', require('../routes/messages'));
app.use('/api/categories', require('../routes/categories'));
app.use('/api/testimonials', require('../routes/testimonials'));

// Error handler
app.use((err, req, res, next) => {
    res.status(500).json({ message: err.message });
});

module.exports = app;
