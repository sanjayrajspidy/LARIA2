// models/Activity.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ActivitySchema = new Schema({
  username: { type: String, required: true },
  pdfId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pdf', required: true },
  action: { type: String, enum: ['view', 'download'], required: true },
  branch: { type: String, required: true }, // added
  year: { type: String, required: true },   // added
   timestamp: {
    type: Date,
    default: () => {
      const now = new Date();
      // Convert to IST (+5:30)
      return new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    }}
});

module.exports = mongoose.model('Activity', ActivitySchema);
