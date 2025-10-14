require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Pdf = require('./models/Pdf');

// === CONFIG ===
const ROOT_FOLDER = 'E:/fsd lab/fsd project/database';  
const SERVER_BASE_URL = 'http://localhost:5000/pdfs';   

// === CONNECT TO MONGODB ===
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error(' MongoDB connection error:', err);
    process.exit(1);
  });

// === Helper to recursively scan all PDFs ===
function getAllPdfFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });

  list.forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAllPdfFiles(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
      results.push(fullPath);
    }
  });

  return results;
}

// === Helper to extract info from folder structure ===
function parsePdfPath(filePath) {
  const parts = filePath.split(path.sep);

  // Example: ["E:", "fsd lab", "fsd project", "database", "r23", "3year", "quantum", "Quantum.pdf"]
  const fileName = path.basename(filePath);
  const regulation = parts.find(p => /^r\d{2,3}$/i.test(p)) || '';
  const yearPart = parts.find(p => /\b[1-4]year\b/i.test(p)) || '';
  const subject = parts.slice(-2, -1)[0]; // folder just before the PDF file

  // Clean year (e.g., "3year" → "3")
  const year = yearPart.replace(/[^0-9]/g, '');

  return {
    subject: subject.charAt(0).toUpperCase() + subject.slice(1),
    regulation: regulation.toUpperCase(),
    year,
    pdfUrl: `${SERVER_BASE_URL}/${path.relative(ROOT_FOLDER, filePath).replace(/\\/g, '/')}`

  };
}

// === MAIN SEED FUNCTION ===
async function seedFromFolder() {
  try {
    const pdfPaths = getAllPdfFiles(ROOT_FOLDER);
    if (pdfPaths.length === 0) {
      console.log('⚠️ No PDFs found in', ROOT_FOLDER);
      process.exit(0);
    }

    const pdfDocs = pdfPaths.map(parsePdfPath);

    await Pdf.deleteMany(); // optional, clears old
    await Pdf.insertMany(pdfDocs);

    console.log(` Seeded ${pdfDocs.length} PDFs successfully!\n`);
    pdfDocs.forEach(p =>
      console.log(`- ${p.subject} (${p.regulation}, Year ${p.year}) → ${p.pdfUrl}`)
    );
  } catch (err) {
    console.error(' Error while seeding:', err);
  } finally {
    mongoose.disconnect();
  }
}

seedFromFolder();
