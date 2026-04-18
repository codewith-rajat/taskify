import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import crypto from 'crypto';

const router = express.Router();

router.get('/:projectId', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pm.*, u.username, u.email FROM project_members pm
       LEFT JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1 AND pm.status = 'active'`,
      [req.params.projectId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:projectId/invite', authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;
    const { projectId } = req.params;
    const projectResult = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND created_by = $2',
      [projectId, req.user.id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(403).json({ message: 'Only project owner can invite members' });
    }

    const invitationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 

    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    let userId = null;
    
    if (userResult.rows.length > 0) {
      userId = userResult.rows[0].id;
    }

    const result = await pool.query(
      `INSERT INTO invitations (project_id, email, user_id, token, expires_at, invited_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [projectId, email, userId, invitationToken, expiresAt, req.user.id]
    );

    const invitationLink = `${process.env.FRONTEND_URL}/accept-invitation?token=${invitationToken}`;

    res.status(201).json({
      message: 'Invitation sent successfully',
      invitationLink,
      email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/accept', authenticateToken, async (req, res) => {
  try {
    const { token } = req.body;

    const inviteResult = await pool.query(
      `SELECT * FROM invitations 
       WHERE token = $1 AND expires_at > NOW() AND status = 'pending'`,
      [token]
    );

    if (inviteResult.rows.length === 0) {
      return res.status(404).json({ message: 'Invalid or expired invitation' });
    }

    const invitation = inviteResult.rows[0];

    await pool.query(
      `INSERT INTO project_members (project_id, user_id, role, status)
       VALUES ($1, $2, 'member', 'active')
       ON CONFLICT DO NOTHING`,
      [invitation.project_id, req.user.id]
    );

    await pool.query(
      `UPDATE invitations SET status = 'accepted', accepted_at = NOW()
       WHERE id = $1`,
      [invitation.id]
    );

    res.json({
      message: 'Invitation accepted successfully',
      projectId: invitation.project_id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:projectId/members/:memberId', authenticateToken, async (req, res) => {
  try {
    const { projectId, memberId } = req.params;

    const projectResult = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND created_by = $2',
      [projectId, req.user.id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(403).json({ message: 'Only project owner can remove members' });
    }

    await pool.query(
      'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, memberId]
    );

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
