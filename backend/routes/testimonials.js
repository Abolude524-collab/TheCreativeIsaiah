const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ensure uploads dir
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadsDir); },
  filename: function (req, file, cb) {
    const safe = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.()-]/g, '_');
    cb(null, safe);
  }
});

const upload = multer({ storage });

// GET /api/testimonials - public
router.get('/', async (req, res) => {
  try {
    const list = await Testimonial.find().sort({ createdAt: -1 });
    // compute average rating for client convenience
    const data = list.map(t => ({
      _id: t._id,
      author: t.author,
      role: t.role,
      quote: t.quote,
      avatar: t.avatar ? `/uploads/${path.basename(t.avatar)}` : null,
      avgRating: t.ratings && t.ratings.length ? (t.ratings.reduce((a,b)=>a+b,0)/t.ratings.length) : null,
      ratingsCount: t.ratings ? t.ratings.length : 0,
      createdAt: t.createdAt
    }));
    res.json(data);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

// POST /api/testimonials - admin only, with optional avatar upload
router.post('/', auth, upload.single('avatar'), async (req, res) => {
  try {
    const { author, role, quote } = req.body;
    if (!author || !quote) return res.status(400).json({ message: 'author and quote are required' });
    const t = new Testimonial({ author, role, quote });
    if (req.file) t.avatar = req.file.path;
    await t.save();
    res.status(201).json(t);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

// DELETE /api/testimonials/:id - admin only
router.delete('/:id', auth, async (req, res) => {
  try {
    const t = await Testimonial.findById(req.params.id);
    if (!t) return res.status(404).json({ message: 'Not found' });
    if (t.avatar) {
      try { fs.unlinkSync(t.avatar); } catch (e) { /* ignore */ }
    }
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

// PUT /api/testimonials/:id - admin edit (optional avatar replace)
router.put('/:id', auth, upload.single('avatar'), async (req, res) => {
  try {
    const { author, role, quote } = req.body;
    const t = await Testimonial.findById(req.params.id);
    if (!t) return res.status(404).json({ message: 'Not found' });
    if (author) t.author = author;
    if (role !== undefined) t.role = role;
    if (quote) t.quote = quote;
    if (req.file) {
      // remove old avatar
      if (t.avatar) { try { fs.unlinkSync(t.avatar); } catch(e) { /*ignore*/ } }
      t.avatar = req.file.path;
    }
    await t.save();
    res.json(t);
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

// POST /api/testimonials/:id/rate - public (submit a numeric rating 1-5)
// Simple in-memory rate-limiter store: { '<ip>:<testimonialId>': timestamp }
const ratingLockstore = new Map();
const RATING_WINDOW_MS = 6 * 60 * 60 * 1000; // 6 hours

router.post('/:id/rate', async (req, res) => {
  try {
    const { rating } = req.body;
    const r = Number(rating);
    if (!r || r < 1 || r > 5) return res.status(400).json({ message: 'Rating must be 1-5' });
    const t = await Testimonial.findById(req.params.id);
    if (!t) return res.status(404).json({ message: 'Not found' });

    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const key = `${ip}:${req.params.id}`;
    const last = ratingLockstore.get(key) || 0;
    const now = Date.now();
    if (now - last < RATING_WINDOW_MS) {
      return res.status(429).json({ message: 'You can only rate this testimonial once every 6 hours' });
    }

    t.ratings = t.ratings || [];
    t.ratings.push(r);
    await t.save();
    ratingLockstore.set(key, now);
    res.json({ message: 'Thanks', avgRating: t.ratings.reduce((a,b)=>a+b,0)/t.ratings.length, ratingsCount: t.ratings.length });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
