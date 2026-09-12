import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

interface Task {
  id?: string | number;
  _id?: string;
  text: string;
  completed: boolean;
}

const API_URL = '/api/tasks';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskText, setTaskText] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. GET /api/tasks -> Retrieve all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await axios.get<Task[]>(API_URL);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setErrorMessage('Could not connect to the backend server. Please verify the Express API is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // 2. POST /api/tasks -> Add a new task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskText.trim()) {
      return;
    }

    try {
      setErrorMessage('');
      const response = await axios.post<Task>(API_URL, {
        text: taskText.trim()
      });
      setTasks((prev) => [...prev, response.data]);
      setTaskText('');
    } catch (error) {
      console.error('Error adding task:', error);
      setErrorMessage('Failed to add task. Please try again.');
    }
  };

  // 3. PUT /api/tasks/:id -> Update or toggle completion
  const handleToggleComplete = async (id: string | number, currentStatus: boolean) => {
    try {
      setErrorMessage('');
      const response = await axios.put<Task>(`${API_URL}/${id}`, {
        completed: !currentStatus
      });
      setTasks((prev) =>
        prev.map((task) => (String(task._id || task.id) === String(id) ? response.data : task))
      );
    } catch (error) {
      console.error('Error updating task:', error);
      setErrorMessage('Failed to update task status.');
    }
  };

  // 4. DELETE /api/tasks/:id -> Delete a task
  const handleDeleteTask = async (id: string | number) => {
    try {
      setErrorMessage('');
      await axios.delete(`${API_URL}/${id}`);
      setTasks((prev) => prev.filter((task) => String(task._id || task.id) !== String(id)));
    } catch (error) {
      console.error('Error deleting task:', error);
      setErrorMessage('Failed to delete task.');
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="task-manager-card" id="task-manager-card">
      <header className="app-header" id="app-header">
        <h1 className="app-title" id="app-title">Task Manager</h1>
        <p className="app-subtitle" id="app-subtitle">A simple full-stack React &amp; Express application</p>
      </header>

      {/* Error notification banner */}
      {errorMessage && (
        <div className="status-message error" id="error-banner">
          <span>{errorMessage}</span>
          <button
            id="dismiss-error-button"
            onClick={() => setErrorMessage('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            aria-label="Dismiss error"
          >
            &times;
          </button>
        </div>
      )}

      {/* Input box for entering a task + Add Task button */}
      <form onSubmit={handleAddTask} className="task-form" id="task-form">
        <input
          id="task-input"
          type="text"
          className="task-input"
          placeholder="What needs to be done?"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
        />
        <button
          id="add-task-button"
          type="submit"
          className="btn-add"
          disabled={!taskText.trim()}
        >
          Add Task
        </button>
      </form>

      {/* Loading indicator */}
      {loading && (
        <div className="status-message loading" id="loading-indicator">
          Loading tasks from server...
        </div>
      )}

      {/* Empty list state */}
      {!loading && tasks.length === 0 && (
        <div className="empty-state" id="empty-state-message">
          No tasks yet. Type a task above and click "Add Task"!
        </div>
      )}

      {/* List of tasks */}
      <ul className="tasks-list" id="tasks-list">
        {tasks.map((task) => {
          const taskId = String(task._id || task.id);
          return (
            <li
              key={taskId}
              id={`task-item-${taskId}`}
              className={`task-item ${task.completed ? 'completed' : ''}`}
            >
              <div className="task-content">
                <span
                  className={`task-badge ${
                    task.completed ? 'badge-completed' : 'badge-pending'
                  }`}
                >
                  {task.completed ? 'Done' : 'Pending'}
                </span>
                <span className="task-text">{task.text}</span>
              </div>

              <div className="task-actions">
                {/* Complete button */}
                <button
                  id={`toggle-task-${taskId}`}
                  type="button"
                  onClick={() => handleToggleComplete(taskId, task.completed)}
                  className={`btn-complete ${task.completed ? 'undo' : ''}`}
                >
                  {task.completed ? 'Undo' : 'Complete'}
                </button>

                {/* Delete button */}
                <button
                  id={`delete-task-${taskId}`}
                  type="button"
                  onClick={() => handleDeleteTask(taskId)}
                  className="btn-delete"
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Task count summary */}
      {!loading && tasks.length > 0 && (
        <footer className="tasks-summary" id="tasks-summary">
          <span>Total tasks: {tasks.length}</span>
          <span>Completed: {completedCount} / {tasks.length}</span>
        </footer>
      )}
    </div>
  );
}
