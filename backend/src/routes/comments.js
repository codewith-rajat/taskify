import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const getNestedReplies = async (commentId) => {
  const repliesResult = await pool.query(
    `SELECT c.*, u.username, u.email FROM comments c 
     JOIN users u ON c.created_by = u.id 
     WHERE c.parent_comment_id = $1 
     ORDER BY c.created_at ASC`,
    [commentId]
  );
  
  const repliesWithNested = await Promise.all(repliesResult.rows.map(async (reply) => {
    return {
      ...reply,
      replies: await getNestedReplies(reply.id)
    };
  }));
  
  return repliesWithNested;
};

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.query;
    
    const result = await pool.query(
      `SELECT c.*, u.username, u.email FROM comments c 
       JOIN users u ON c.created_by = u.id 
       WHERE c.task_id = $1 AND c.parent_comment_id IS NULL 
       ORDER BY c.created_at DESC`,
      [taskId]
    );
    
    const comments = await Promise.all(result.rows.map(async (comment) => {
      return {
        ...comment,
        replies: await getNestedReplies(comment.id)
      };
    }));
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { taskId, content, parentCommentId } = req.body;
    const result = await pool.query(
      'INSERT INTO comments (task_id, content, created_by, parent_comment_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [taskId, content, req.user.id, parentCommentId || null]
    );
    
    const userResult = await pool.query('SELECT username, email FROM users WHERE id = $1', [req.user.id]);
    
    res.status(201).json({
      ...result.rows[0],
      username: userResult.rows[0].username,
      email: userResult.rows[0].email,
      replies: []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM comments WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
