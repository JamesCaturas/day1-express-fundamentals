const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');

// 1. GET all tasks (with pagination, filtering, searching, and sorting)
exports.getAllTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build the filter object
    const filter = { isDeleted: false };
    
    if (req.query.completed !== undefined) {
      filter.completed = req.query.completed === 'true';
    }
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }
    if (req.query.search) {
      filter.title = { $regex: req.query.search, $options: 'i' };
    }

    // Set up sorting options with allowlist guard
    const allowedSortFields = ['createdAt', 'priority', 'title'];
    const sortField = allowedSortFields.includes(req.query.sortBy) ? req.query.sortBy : 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;
    const sortOptions = { [sortField]: sortOrder };

    // Fetch data and total count concurrently
    const [tasks, total] = await Promise.all([
      Task.find(filter).sort(sortOptions).skip(skip).limit(limit),
      Task.countDocuments(filter),
    ]);

    // Send successful response with data and metadata
    res.json({
      success: true,
      data: tasks,
      meta: { 
        page, 
        limit, 
        total, 
        totalPages: Math.ceil(total / limit) 
      },
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: { message: err.message } 
    });
  }
};

// 2. GET task by ID
exports.getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task || task.isDeleted) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }
  res.json({ success: true, data: task });
});

// 3. CREATE task
exports.createTask = async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, owner: req.user.id });
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, error: { message: err.message, code: 'VALIDATION_ERROR' } });
  }
};

// 4. UPDATE task with ownership check
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, isDeleted: false });
    
    if (!task) {
      return res.status(404).json({ success: false, error: { message: 'Task not found' } });
    }

    // Check if the current user is the owner OR an admin
    if (task.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Not the owner of this task' } });
    }

    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { 
      new: true, 
      runValidators: true 
    });
    
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
};

// 5. SOFT DELETE task with ownership check
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, isDeleted: false });
    
    if (!task) {
      return res.status(404).json({ success: false, error: { message: 'Task not found' } });
    }

    // Check if the current user is the owner OR an admin
    if (task.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Not the owner of this task' } });
    }

    task.isDeleted = true;
    await task.save();
    
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ success: false, error: { message: err.message } });
  }
};

// 6. Admin-only permanent deletion
exports.forceDeleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    
    if (!task) {
      return res.status(404).json({ 
        success: false, 
        error: { message: 'Task not found', code: 'NOT_FOUND' } 
      });
    }
    
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ 
      success: false, 
      error: { message: err.message } 
    });
  }
};