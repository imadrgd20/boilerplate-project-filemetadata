const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const multer = require('multer');
const app = express();

// Database Connection
mongoose.connect(process.env.URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// File Schema (Consider adding validation)
const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  data: Buffer // Store the file data directly
});

const File = mongoose.model('File', fileSchema);

// Multer Configuration (Memory Storage)
const upload = multer({ storage: multer.memoryStorage() });

// CORS setup (Place this before your routes)
app.use(cors());

// File Analysis Route
app.post('/api/fileanalyse', upload.single('upfile'), async (req, res) => {
  try {
    const { originalname, mimetype, size } = req.file;

    const file = await File.create({
      name: originalname,
      type: mimetype,
      size,
      data: req.file.buffer 
    });

    res.json({
      name: file.name,
      type: file.type,
      size: file.size
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'File upload failed' }); // Informative error response
  }
});

// Serve Static Files
app.use('/public', express.static(process.cwd() + '/public'));

// Home Route
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Error Handling Middleware (Place this at the end)

// Start Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Your app is listening on port ${port}`);
});
