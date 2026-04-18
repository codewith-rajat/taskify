import pool from '../config/database.js';

const roleHierarchy = {
  admin: 3,
  manager: 2,
  developer: 1,
};

export const checkProjectAccess = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const { projectId } = req.params || req.body;

      const result = await pool.query(
        `SELECT pm.role FROM project_members pm 
         WHERE pm.project_id = $1 AND pm.user_id = $2`,
        [projectId, req.user.id]
      );

      const ownerResult = await pool.query(
        `SELECT id FROM projects WHERE id = $1 AND created_by = $2`,
        [projectId, req.user.id]
      );

      if (ownerResult.rows.length > 0) {
       
        req.userRole = 'admin';
        return next();
      }

      if (result.rows.length === 0) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const userRole = result.rows[0].role;
      
      if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
        return res.status(403).json({ message: `Required role: ${requiredRole}` });
      }

      req.userRole = userRole;
      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};

export const checkTaskAccess = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;

      const taskResult = await pool.query(
        `SELECT project_id FROM tasks WHERE id = $1`,
        [id]
      );

      if (taskResult.rows.length === 0) {
        return res.status(404).json({ message: 'Task not found' });
      }

      const projectId = taskResult.rows[0].project_id;

      const result = await pool.query(
        `SELECT pm.role FROM project_members pm 
         WHERE pm.project_id = $1 AND pm.user_id = $2`,
        [projectId, req.user.id]
      );

      const ownerResult = await pool.query(
        `SELECT id FROM projects WHERE id = $1 AND created_by = $2`,
        [projectId, req.user.id]
      );

      if (ownerResult.rows.length > 0) {
        req.userRole = 'admin';
        return next();
      }

      if (result.rows.length === 0) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const userRole = result.rows[0].role;
      
      if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
        return res.status(403).json({ message: `Required role: ${requiredRole}` });
      }

      req.userRole = userRole;
      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};
