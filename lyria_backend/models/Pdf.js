// models/Pdf.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PdfSchema = new Schema({
  name: { type: String },            // e.g., "Physics R23 First Year Syllabus"
  subject: { type: String, required: true },
  year: { type: String },            // '1' or '1st' or 'first'
  regulation: { type: String },      // 'R23' etc
  pdfUrl: { type: String, required: true }, // external URL or server route (e.g., /files/physics-r23.pdf)
  tags: [String],
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pdf', PdfSchema);
