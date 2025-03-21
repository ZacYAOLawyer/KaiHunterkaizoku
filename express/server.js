// express/server.js (完整修正版)

require('dotenv').config();
const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const axios = require('axios');
const cloudinary = require('cloudinary').v2;
const { create } = require('ipfs-http-client');

const {
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
  POSTGRES_HOST,
  POSTGRES_PORT,
  JWT_SECRET,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM,
  IPFS_HOST,
  IPFS_PORT
} = process.env;

const app = express();
app.use(express.json());

// -------------------------
// PostgreSQL Pool with config
// -------------------------
const POSTGRES_URL = `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`;
const pool = new Pool({
  connectionString: POSTGRES_URL,
  max: 20,                // 最大連線數
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// -------------------------
// Cloudinary + IPFS client
// -------------------------
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET
});
const ipfs = create({
  host: IPFS_HOST || 'ipfs',
  port: IPFS_PORT || 5001,
  protocol: 'http'
});

// Multer
const upload = multer({ dest: 'uploads/' });

// 健康檢查
app.get('/health', (req, res) => {
  res.json({ status: 'Express is healthy' });
});

// -------------------------
// User Registration
// -------------------------
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email/Password required' });
  try {
    const hashed = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users(email, password_hash) VALUES($1, $2)', [email, hashed]);
    res.json({ message: 'Register success' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Register failed' });
  }
});

// -------------------------
// User Login + JWT 安全參數
// -------------------------
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (result.rowCount === 0) return res.status(401).json({ error: 'User not found' });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Password incorrect' });

    // JWT with secure claims
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      {
        expiresIn: '4h',
        algorithm: 'HS256',
        issuer: 'kai-shield',
        audience: 'web-client'
      }
    );
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// -------------------------
// File Upload + Fingerprint
// -------------------------
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const fileBuffer = fs.readFileSync(req.file.path);
    const fingerprint = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // 新增 metadata Example (可自行擴充)
    const metadata = { fileName: req.file.originalname };

    await pool.query(
      'INSERT INTO fingerprints(hash, metadata) VALUES ($1, $2)',
      [fingerprint, metadata]
    );

    res.json({ message: 'File uploaded successfully', fingerprint });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Upload error' });
  }
});

// -------------------------
// Cloudinary
// -------------------------
app.post('/cloudinary', upload.single('file'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'auto'
    });
    res.json({ cloudinary_url: result.secure_url });
  } catch (error) {
    console.error('Cloudinary error:', error);
    res.status(500).json({ error: 'Cloudinary upload failed' });
  }
});

// -------------------------
// IPFS
// -------------------------
app.post('/upload_to_ipfs', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const fileBuffer = fs.readFileSync(req.file.path);
    const { cid } = await ipfs.add(fileBuffer);
    res.json({ ipfsHash: cid.toString() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'IPFS upload error' });
  }
});

// -------------------------
// DMCA (示範)
// -------------------------
app.post('/dmca/submit', async (req, res) => {
  try {
    const { infringingUrl, originalWork } = req.body;
    if (!infringingUrl || !originalWork) return res.status(400).json({ error: 'Missing parameters' });

    // 假裝呼叫外部 API
    /*
    const response = await axios.post('https://api.legalese.com/v1/dmca', {...});
    */
    res.json({ message: 'DMCA requested (demo)', infringingUrl, originalWork });
  } catch (error) {
    console.error('DMCA error:', error);
    res.status(500).json({ error: 'DMCA submission failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
