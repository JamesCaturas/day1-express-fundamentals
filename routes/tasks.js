const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize'); // 👈 1. Require authorize middleware

const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  forceDeleteTask, // 👈 2. Import the new controller function
} = require('../controllers/taskController');

// Protect all routes below this line with authentication
router.use(authenticate);

// Standard CRUD routes
router.get('/', getAllTasks);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

// 3. Admin-only force delete route (permanently wipes task from database)
router.delete('/:id/force', authorize('admin'), forceDeleteTask);

module.exports = router;