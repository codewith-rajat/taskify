import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;
    const searchTerm = `%${q}%`;

    const [tasks, projects, users] = await Promise.all([
      pool.query('SELECT * FROM tasks WHERE title ILIKE $1 OR description ILIKE $1 LIMIT 10', [searchTerm]),
      pool.query('SELECT * FROM projects WHERE name ILIKE $1 OR description ILIKE $1 LIMIT 10', [searchTerm]),
      pool.query('SELECT id, username, email FROM users WHERE username ILIKE $1 OR email ILIKE $1 LIMIT 10', [searchTerm]),
    ]);

    res.json({
      tasks: tasks.rows,
      projects: projects.rows,
      users: users.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
