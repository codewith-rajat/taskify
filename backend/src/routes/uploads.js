import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and documents allowed.'));
    }
  }
});

router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { taskId } = req.body;
    const userId = req.user.id;

    if (!taskId) {
      return res.status(400).json({ message: 'Task ID is required' });
    }

   
    const result = await pool.query(
      `INSERT INTO attachments (task_id, file_name, file_path, file_size, uploaded_by, created_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       RETURNING *`,
      [taskId, req.file.originalname, req.file.path, req.file.size, userId]
    );

    res.json({
      message: 'File uploaded successfully',
      attachment: result.rows[0]
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/task/:taskId', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;

    const result = await pool.query(
      `SELECT a.*, u.username 
       FROM attachments a
       LEFT JOIN users u ON a.uploaded_by = u.id
       WHERE a.task_id = $1
       ORDER BY a.created_at DESC`,
      [taskId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching attachments:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/download/:attachmentId', authenticateToken, async (req, res) => {
  try {
    const { attachmentId } = req.params;

    const result = await pool.query(
      'SELECT * FROM attachments WHERE id = $1',
      [attachmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    const attachment = result.rows[0];
    res.download(attachment.file_path, attachment.file_name);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:attachmentId', authenticateToken, async (req, res) => {
  try {
    const { attachmentId } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT * FROM attachments WHERE id = $1',
      [attachmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    const attachment = result.rows[0];

    if (attachment.uploaded_by !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (fs.existsSync(attachment.file_path)) {
      fs.unlinkSync(attachment.file_path);
    }

    await pool.query('DELETE FROM attachments WHERE id = $1', [attachmentId]);

    res.json({ message: 'Attachment deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
