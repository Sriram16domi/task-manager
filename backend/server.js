import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Task from './models/Task.js';

// Load environment variables from .env file
dotenv.config();

// Create the Express application
const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Enable CORS so the React frontend can access the API
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// ==========================================
// MONGODB CONNECTION
// ==========================================
if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log('Successfully connected to MongoDB Database');
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err.message);
    });
} else {
  console.warn('WARNING: MONGODB_URI is not defined in your environment variables.');
}

// ==========================================
// REST API ENDPOINTS (MONGODB)
// ==========================================

// 1. GET /api/tasks -> Retrieve all tasks from MongoDB
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks from MongoDB:', error);
    res.status(500).json({ error: 'Failed to fetch tasks from database' });
  }
});

// 2. POST /api/tasks -> Add a new task to MongoDB
app.post('/api/tasks', async (req, res) => {
  const { text } = req.body;

  // Validate that text is provided
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return res.status(400).json({ error: 'Task text is required' });
  }

  try {
    const newTask = await Task.create({
      text: text.trim(),
      completed: false
    });
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task in MongoDB:', error);
    res.status(500).json({ error: 'Failed to create task in database' });
  }
});

// 3. PUT /api/tasks/:id -> Update or toggle task completion in MongoDB
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Update completed status: use provided boolean or toggle current
    if (typeof req.body.completed === 'boolean') {
      task.completed = req.body.completed;
    } else {
      task.completed = !task.completed;
    }

    // Optional: update text if provided
    if (req.body.text && typeof req.body.text === 'string' && req.body.text.trim() !== '') {
      task.text = req.body.text.trim();
    }

    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Error updating task in MongoDB:', error);
    res.status(500).json({ error: 'Failed to update task in database' });
  }
});

// 4. DELETE /api/tasks/:id -> Delete a task from MongoDB
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully', id });
  } catch (error) {
    console.error('Error deleting task from MongoDB:', error);
    res.status(500).json({ error: 'Failed to delete task from database' });
  }
});

// Start listening for incoming HTTP requests
app.listen(PORT, () => {
  console.log(`Backend server is running at http://localhost:${PORT}`);
});

export default app;

