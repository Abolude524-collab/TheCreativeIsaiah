const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
  author: { type: String, required: true },
  role: { type: String },
  quote: { type: String, required: true },
  avatar: { type: String },
  ratings: { type: [Number], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', TestimonialSchema);
