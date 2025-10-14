// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Pdf = require('./models/Pdf');
const User = require('./models/User');
const Activity = require('./models/Activity');

const app = express();

// Middleware

app.use(cors());
app.use(express.json({ limit: '10mb' }));
const path = require('path');
app.use('/pdfs', express.static(path.join('E:/fsd lab/fsd project/database')));
console.log("Serving PDFs from:", path.join('E:/fsd lab/fsd project/database'));



const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB Atlas
// mongoose.connect(MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
mongoose.connect(MONGO_URI)

.then(() => console.log(' Connected to MongoDB Atlas'))
.catch(err => {
  console.error(' MongoDB connection error:', err);
  process.exit(1);
});


// === REGISTER ===
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, role, branch, year } = req.body;

    if (!username || !password || !branch || !year) {
      return res.status(400).json({ ok: false, error: "Username, password, branch and year are required" });
    }

    // prevent duplicate usernames
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ ok: false, error: "Username already exists" });
    }

    // save user (no hashing for now)
    const newUser = new User({ username, password, role, branch, year });
    await newUser.save();

    res.json({ ok: true, username, role, branch, year });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});



// === LOGIN ===
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ ok: false, error: "Missing credentials" });

    const user = await User.findOne({ username });
    if (!user)
      return res.status(400).json({ ok: false, error: "Invalid username" });

    if (user.password !== password)
      return res.status(400).json({ ok: false, error: "Invalid password" });

    res.json({
      ok: true,
      username: user.username,
      role: user.role,
      branch: user.branch,
      year: user.year
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});


// === Track Activity with User Info ===
app.post('/api/activity', async (req, res) => {
  try {
    const { username, pdfId, action } = req.body;

    if (!username || !pdfId || !action)
      return res.status(400).json({ ok: false, error: "Missing fields" });

    //  Fetch user's branch and year from DB
    const user = await User.findOne({ username }).lean();
    if (!user) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    // Create activity with extra details
    const activity = new Activity({
      username,
      pdfId,
      action,
      branch: user.branch ,
      year: user.year ,
    });

    await activity.save();
    res.json({ ok: true, message: "Activity logged with user details" });
  } catch (err) {
    console.error("Activity log error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});



app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => res.send('Server running. Use POST /api/find-pdf'));


function parseMessage(text) {
  if (!text) return {};
  const lower = text.toLowerCase();

  console.log('Parsing message:', text);

  // Regulation: match R23, r23, R-23, etc.
  const regMatch = lower.match(/\br[-\s]?(\d{2,3})\b/i);
  const regulation = regMatch ? 'R' + regMatch[1] : '';
  console.log(' Extracted regulation:', regulation);

  // Year: 1st, 2nd, 3rd, 4th, final year
  let year = '';
  if (/\b(1st|first|year\s?1|first year)\b/.test(lower)) year = '1';
  else if (/\b(2nd|second|year\s?2|second year)\b/.test(lower)) year = '2';
  else if (/\b(3rd|third|year\s?3|third year)\b/.test(lower)) year = '3';
  else if (/\b(4th|fourth|year\s?4|final year)\b/.test(lower)) year = '4';
  console.log(' Extracted year:', year);

  // Remove regulation and year parts first
  let cleanText = lower
    .replace(/\br[-\s]?\d{2,3}\b/gi, '')
    .replace(/\b(1st|2nd|3rd|4th|first|second|third|fourth|final)\s*(year)?\b/gi, '')
    .replace(/\byear\s*\d\b/gi, '')
    .trim();

  // Common filler words
  const stopWords = [
    'pdf', 'of', 'for', 'need', 'i', 'want', 'the', 'a', 'an',
    'please', 'give', 'me', 'get', 'regulation', 'in'
  ];

  const words = cleanText
    .split(/\s+/)
    .filter(w => !stopWords.includes(w) && w.length > 0);

  // Subject = first meaningful word (like physics, maths, etc.)
  let subject = words.length > 0 ? words[0] : '';
  subject = subject.charAt(0).toUpperCase() + subject.slice(1);

  console.log(' Extracted subject:', subject);

  return { subject, regulation, year };
}



app.post('/api/find-pdf', async (req, res) => {
  try {
    const { message, username } = req.body;

    // Block if user isn't logged in
    if (!username) {
      return res.status(403).json({ ok: false, error: "Please log in to access PDFs." });
    }

    //  Optional: check if user actually exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(403).json({ ok: false, error: "Invalid user. Please log in again." });
    }
    if (!message) return res.status(400).json({ ok: false, error: "message required" });

    const { subject, regulation, year } = parseMessage(message);
    console.log(' Parsed values:', { subject, regulation, year });

    // If nothing parsed, return sample list
    if (!subject && !regulation && !year) {
      const sample = await Pdf.find().limit(8).select('subject regulation year pdfUrl').lean();
      return res.json({
        ok: true,
        found: false,
        hint: "Couldn't parse the request. Here are some available PDFs:",
        sample
      });
    }

    // Build case-insensitive query
    const query = {};
    if (subject) query.subject = new RegExp(subject, 'i');
    if (regulation) query.regulation = new RegExp(regulation, 'i');
    if (year) query.year = new RegExp(year, 'i');


    console.log(' MongoDB Query:', JSON.stringify(query, null, 2));

    // Try finding exact match
    // Try finding all matching PDFs
let pdfs = await Pdf.find(query).lean();
console.log('Matches found:', pdfs.length);

// If no matches found, try relaxed search
if (pdfs.length === 0) {
  console.log('Trying relaxed search...');

  const relaxedQuery = {};
  if (subject) relaxedQuery.subject = new RegExp(subject, 'i');
  if (regulation) relaxedQuery.regulation = new RegExp(regulation, 'i');
  if (year) relaxedQuery.year = year;

  console.log('🔎 Relaxed query:', JSON.stringify(relaxedQuery, null, 2));

  const matches = await Pdf.find(relaxedQuery)
  .limit(6)
  .select('subject regulation year pdfUrl name')
  .lean();


  console.log(`Found ${matches.length} relaxed matches`);

  if (matches.length > 0) {
    return res.json({
      ok: true,
      found: false,
      message: "No exact match. Here are similar PDFs:",
      matches
    });
  }

  // If still no matches, try subject only
  if (subject) {
    console.log('Trying subject-only search...');
    const subjectOnly = await Pdf.find({
  subject: new RegExp(subject, 'i')
})
  .limit(6)
  .select(' subject regulation year pdfUrl name')
  .lean();

    console.log(`Found ${subjectOnly.length} subject matches`);

    if (subjectOnly.length > 0) {
      return res.json({
        ok: true,
        found: false,
        message: `Found these PDFs for "${subject}":`,
        matches: subjectOnly
      });
    }
  }

  // No matches at all - show some samples
  console.log('No matches found, returning sample PDFs');
  const sample = await Pdf.find()
  .limit(8)
  .select(' subject regulation year pdfUrl')
  .lean();

  return res.json({
    ok: true,
    found: false,
    message: "No matches found. Here are some available PDFs:",
    matches: sample
  });
}

// ✅ Return all exact matches
console.log('Exact matches found!');
return res.json({ ok: true, found: true, pdfs });

  } catch (err) {
    console.error('Error in /api/find-pdf:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

/** Optional admin route: list all PDFs */
app.get('/api/list-pdfs', async (req, res) => {
  try {
    const list = await Pdf.find().limit(200).lean();
    res.json({ ok: true, count: list.length, list });
  } catch (err) {
    console.error(' Error in /api/list-pdfs:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Debug route to test parsing
app.post('/api/test-parse', (req, res) => {
  const { message } = req.body;
  const parsed = parseMessage(message);
  res.json({ message, parsed });
});
app.get('/test', (req, res) => {
  res.send('✅ Backend is reachable');
});

// Start server
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));