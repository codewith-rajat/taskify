import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM teams LIMIT 100');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { teamName, productOwner, projectManager } = req.body;
    const result = await pool.query(
      'INSERT INTO teams (team_name, product_owner, project_manager) VALUES ($1, $2, $3) RETURNING *',
      [teamName, productOwner, projectManager]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { teamName, productOwner, projectManager } = req.body;
    const result = await pool.query(
      'UPDATE teams SET team_name = $1, product_owner = $2, project_manager = $3 WHERE id = $4 RETURNING *',
      [teamName, productOwner, projectManager, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM teams WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
