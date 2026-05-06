import express from 'express';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { authenticate } from '../middleware/auth.js';
import { validateTask, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Create Task
router.post('/', authenticate, validateTask, handleValidationErrors, async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, status, priority, dueDate, estimatedHours, tags } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const task = new Task({
      title,
      description,
      project: projectId,
      assignedTo,
      createdBy: req.userId,
      status,
      priority,
      dueDate,
      estimatedHours,
      tags
    });

    await task.save();
    await task.populate('createdBy assignedTo', 'fullName email');

    project.tasks.push(task._id);
    await project.save();

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating task'
    });
  }
});

// Get All Tasks
router.get('/', authenticate, async (req, res) => {
  try {
    const { projectId, status, priority, assignedTo } = req.query;
    let query = {};

    if (projectId) query.project = projectId;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    const tasks = await Task.find(query)
      .populate('createdBy assignedTo project', 'fullName email name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tasks,
      count: tasks.length
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks'
    });
  }
});

// Get Single Task
router.get('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy assignedTo project', 'fullName email name')
      .populate('comments.author', 'fullName');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task'
    });
  }
});

// Update Task
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo, actualHours, tags } = req.body;

    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // If status changed to Done, set completedAt
    if (status === 'Done' && task.status !== 'Done') {
      req.body.completedAt = new Date();
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy assignedTo project');

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task'
    });
  }
});

// Delete Task
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const project = await Project.findById(task.project);
    if (project) {
      project.tasks = project.tasks.filter(t => t.toString() !== req.params.id);
      await project.save();
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting task'
    });
  }
});

// Add Comment
router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            author: req.userId,
            text,
            createdAt: new Date()
          }
        }
      },
      { new: true }
    ).populate('comments.author', 'fullName');

    res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      data: task
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment'
    });
  }
});

// Add Subtask
router.post('/:id/subtasks', authenticate, async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Subtask title is required'
      });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          subtasks: {
            title,
            completed: false
          }
        }
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Subtask added successfully',
      data: task
    });
  } catch (error) {
    console.error('Add subtask error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding subtask'
    });
  }
});

// Update Subtask
router.put('/:id/subtasks/:subtaskIndex', authenticate, async (req, res) => {
  try {
    const { completed } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task || !task.subtasks[req.params.subtaskIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Subtask not found'
      });
    }

    task.subtasks[req.params.subtaskIndex].completed = completed;
    await task.save();

    res.status(200).json({
      success: true,
      message: 'Subtask updated successfully',
      data: task
    });
  } catch (error) {
    console.error('Update subtask error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating subtask'
    });
  }
});

export default router;
