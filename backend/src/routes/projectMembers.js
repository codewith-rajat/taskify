import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import crypto from 'crypto';

const router = express.Router();

// Get project members with user details
router.get('/:projectId', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Get all active members of the project
    const result = await pool.query(
      `SELECT u.id as user_id, u.username, u.email, pm.role, pm.status
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1 AND pm.status = 'active'
       ORDER BY u.username`,
      [projectId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching project members:', error);
    res.status(500).json({ message: 'Failed to fetch project members' });
  }
});

// Invite a member to project
router.post('/:projectId/invite', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email } = req.body;
    const userId = req.user.id;

    // Check if user is admin or manager of the project
    const projectCheck = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND created_by = $2',
      [projectId, userId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Not authorized to invite members' });
    }

    // Check if user exists
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const invitedUserId = userCheck.rows[0].id;

    // Check if already a member
    const memberCheck = await pool.query(
      'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, invitedUserId]
    );

    if (memberCheck.rows.length > 0) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    // Create invitation
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await pool.query(
      `INSERT INTO invitations (project_id, email, user_id, token, expires_at, status, invited_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [projectId, email, invitedUserId, token, expiresAt, 'pending', userId]
    );

    res.json({ 
      message: 'Invitation sent successfully',
      inviteLink: `${process.env.FRONTEND_URL}/accept-invitation?token=${token}`
    });
  } catch (error) {
    console.error('Error inviting member:', error);
    res.status(500).json({ message: 'Failed to invite member' });
  }
});

// Accept invitation
router.post('/accept', authenticateToken, async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    const invitationResult = await pool.query(
      `SELECT * FROM invitations 
       WHERE token = $1 AND user_id = $2 AND expires_at > NOW()`,
      [token, userId]
    );

    if (invitationResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired invitation' });
    }

    const invitation = invitationResult.rows[0];

    // Add user to project
    await pool.query(
      `INSERT INTO project_members (project_id, user_id, role, status)
       VALUES ($1, $2, $3, $4)`,
      [invitation.project_id, userId, 'developer', 'active']
    );

    // Update invitation status
    await pool.query(
      `UPDATE invitations SET status = $1 WHERE token = $2`,
      ['accepted', token]
    );

    res.json({ message: 'Invitation accepted successfully' });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ message: 'Failed to accept invitation' });
  }
});

export default router;
