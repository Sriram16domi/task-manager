import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import mongoose, { Schema, Document } from 'mongoose';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

// Also check backend/.env if MONGODB_URI is not loaded
const backendEnvPath = path.resolve(process.cwd(), 'backend/.env');
if (!process.env.MONGODB_URI && fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath });
}

// Interface for Task Document
interface ITask extends Document {
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Task Schema
const taskSchema = new Schema<ITask>(
  {
    text: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        return ret;
      },
    },
  }
);

const TaskModel: mongoose.Model<ITask> =
  (mongoose.models.Task as mongoose.Model<ITask>) ||
  mongoose.model<ITask>('Task', taskSchema);


// In-memory fallback if MongoDB is not connected
let memoryTasks = [
  { id: '1', text: 'Learn React fundamentals', completed: true },
  { id: '2', text: 'Build a Node.js Express REST API', completed: false },
  { id: '3', text: 'Connect frontend to backend using Axios', completed: false }
];

async function startServer() {
  const app = express();
  const PORT = 3000;
  const MONGODB_URI = process.env.MONGODB_URI;

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Connect to MongoDB
  let isMongoConnected = false;
  if (MONGODB_URI) {
    try {
      await mongoose.connect(MONGODB_URI);
      isMongoConnected = true;
      console.log('Successfully connected to MongoDB Database');
    } catch (err: any) {
      console.error('MongoDB connection error:', err.message);
    }
  } else {
    console.warn('WARNING: MONGODB_URI is not set. Using in-memory store.');
  }

  // Monitor connection state
  mongoose.connection.on('connected', () => {
    isMongoConnected = true;
    console.log('MongoDB connected');
  });
  mongoose.connection.on('disconnected', () => {
    isMongoConnected = false;
    console.warn('MongoDB disconnected');
  });

  // Helper to check if MongoDB is active
  const isDbReady = () => mongoose.connection.readyState === 1;

  // ==========================================
  // REST API ENDPOINTS
  // ==========================================

  // 1. GET /api/tasks -> Retrieve all tasks
  app.get('/api/tasks', async (req, res) => {
    try {
      if (isDbReady()) {
        const tasks = await TaskModel.find().sort({ createdAt: -1 });
        return res.status(200).json(tasks);
      }
      // In-memory fallback
      return res.status(200).json(memoryTasks);
    } catch (error) {
      console.error('Error in GET /api/tasks:', error);
      res.status(500).json({ error: 'Failed to retrieve tasks' });
    }
  });

  // 2. POST /api/tasks -> Add a new task
  app.post('/api/tasks', async (req, res) => {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ error: 'Task text is required' });
    }

    try {
      if (isDbReady()) {
        const newTask = await TaskModel.create({
          text: text.trim(),
          completed: false,
        });
        return res.status(201).json(newTask);
      }

      // In-memory fallback
      const newTask = {
        id: String(Date.now()),
        text: text.trim(),
        completed: false,
      };
      memoryTasks.unshift(newTask);
      return res.status(201).json(newTask);
    } catch (error) {
      console.error('Error in POST /api/tasks:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  });

  // 3. PUT /api/tasks/:id -> Update or toggle completion
  app.put('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;

    try {
      if (isDbReady()) {
        const task = await TaskModel.findById(id);
        if (!task) {
          return res.status(404).json({ error: 'Task not found' });
        }

        if (typeof req.body.completed === 'boolean') {
          task.completed = req.body.completed;
        } else {
          task.completed = !task.completed;
        }

        if (req.body.text && typeof req.body.text === 'string' && req.body.text.trim() !== '') {
          task.text = req.body.text.trim();
        }

        const updatedTask = await task.save();
        return res.status(200).json(updatedTask);
      }

      // In-memory fallback
      const task = memoryTasks.find((t) => t.id === id);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      if (typeof req.body.completed === 'boolean') {
        task.completed = req.body.completed;
      } else {
        task.completed = !task.completed;
      }

      if (req.body.text && typeof req.body.text === 'string' && req.body.text.trim() !== '') {
        task.text = req.body.text.trim();
      }

      return res.status(200).json(task);
    } catch (error) {
      console.error('Error in PUT /api/tasks/:id:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  });

  // 4. DELETE /api/tasks/:id -> Delete a task
  app.delete('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;

    try {
      if (isDbReady()) {
        const deleted = await TaskModel.findByIdAndDelete(id);
        if (!deleted) {
          return res.status(404).json({ error: 'Task not found' });
        }
        return res.status(200).json({ message: 'Task deleted successfully', id });
      }

      // In-memory fallback
      const initialCount = memoryTasks.length;
      memoryTasks = memoryTasks.filter((t) => t.id !== id);
      if (memoryTasks.length === initialCount) {
        return res.status(404).json({ error: 'Task not found' });
      }
      return res.status(200).json({ message: 'Task deleted successfully', id });
    } catch (error) {
      console.error('Error in DELETE /api/tasks/:id:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  });

  // Vite middleware for frontend serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
