import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get update requests for a task (managers only)
router.get('/task/:taskId', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    
    // Get task and check if user is manager/creator
    const taskResult = await pool.query(
      `SELECT t.*, p.created_by FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE t.id = $1`,
      [taskId]
    );
    
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const result = await pool.query(
      `SELECT tur.*, u.username as requested_by_name
       FROM task_update_requests tur
       JOIN users u ON tur.requested_by = u.id
       WHERE tur.task_id = $1
       ORDER BY tur.created_at DESC`,
      [taskId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching update requests:', error);
    res.status(500).json({ message: 'Failed to fetch update requests' });
  }
});

// Request an update to a task
router.post('/request', authenticateToken, async (req, res) => {
  try {
    const { taskId, fieldName, newValue, reason } = req.body;
    const userId = req.user.id;

    // Get current task value
    const taskResult = await pool.query(
      'SELECT * FROM tasks WHERE id = $1',
      [taskId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const task = taskResult.rows[0];
    const oldValue = task[fieldName] || null;

    // Check if user already has a pending request for this field
    const existingRequest = await pool.query(
      `SELECT * FROM task_update_requests 
       WHERE task_id = $1 AND requested_by = $2 AND field_name = $3 AND status = 'pending'`,
      [taskId, userId, fieldName]
    );

    if (existingRequest.rows.length > 0) {
      return res.status(400).json({ message: 'You already have a pending request for this change' });
    }

    // Create update request
    const result = await pool.query(
      `INSERT INTO task_update_requests (task_id, requested_by, request_type, field_name, old_value, new_value, reason, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [taskId, userId, 'update', fieldName, oldValue, newValue, reason, 'pending']
    );

    res.status(201).json({
      message: 'Update request submitted successfully',
      request: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating update request:', error);
    res.status(500).json({ message: 'Failed to create update request' });
  }
});

// Approve an update request (managers only)
router.post('/:requestId/approve', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    // Get the request
    const requestResult = await pool.query(
      'SELECT * FROM task_update_requests WHERE id = $1',
      [requestId]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const request = requestResult.rows[0];

    // Check if user is the project manager/creator
    const taskResult = await pool.query(
      `SELECT t.*, p.created_by FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE t.id = $1`,
      [request.task_id]
    );

    if (taskResult.rows.length === 0 || taskResult.rows[0].created_by !== userId) {
      return res.status(403).json({ message: 'Not authorized to approve this request' });
    }

    // Update the task with the new value
    const fieldName = request.field_name;
    const updateQuery = `UPDATE tasks SET ${fieldName} = $1, updated_at = NOW() WHERE id = $2 RETURNING *`;
    await pool.query(updateQuery, [request.new_value, request.task_id]);

    // Mark request as approved
    const approvalResult = await pool.query(
      `UPDATE task_update_requests SET status = $1, approved_by = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
      ['approved', userId, requestId]
    );

    res.json({
      message: 'Request approved successfully',
      request: approvalResult.rows[0]
    });
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ message: 'Failed to approve request' });
  }
});

// Reject an update request (managers only)
router.post('/:requestId/reject', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    // Get the request
    const requestResult = await pool.query(
      'SELECT * FROM task_update_requests WHERE id = $1',
      [requestId]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const request = requestResult.rows[0];

    // Check if user is the project manager/creator
    const taskResult = await pool.query(
      `SELECT t.*, p.created_by FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE t.id = $1`,
      [request.task_id]
    );

    if (taskResult.rows.length === 0 || taskResult.rows[0].created_by !== userId) {
      return res.status(403).json({ message: 'Not authorized to reject this request' });
    }

    // Mark request as rejected
    const rejectionResult = await pool.query(
      `UPDATE task_update_requests SET status = $1, approved_by = $2, reason = $3, updated_at = NOW() WHERE id = $4 RETURNING *`,
      ['rejected', userId, reason, requestId]
    );

    res.json({
      message: 'Request rejected successfully',
      request: rejectionResult.rows[0]
    });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ message: 'Failed to reject request' });
  }
});

export default router;
