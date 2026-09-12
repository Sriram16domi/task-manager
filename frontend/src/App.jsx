import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Base API URL:
// In local dev with Vite proxy, '/api/tasks' forwards directly to http://localhost:5000/api/tasks.
// You can also use an environment variable (VITE_API_URL) if defined.
const API_URL = import.meta.env.VITE_API_URL || '/api/tasks';

function App() {
  // State for the list of tasks retrieved from the backend
  const [tasks, setTasks] = useState([]);
  // State for the text input value
  const [taskText, setTaskText] = useState('');
  // Loading and error states for user feedback
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. GET /api/tasks - Fetch all tasks from the Node.js Express server on component mount
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await axios.get(API_URL);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setErrorMessage('Could not connect to the backend server. Make sure the Express server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // 2. POST /api/tasks - Add a new task
  const handleAddTask = async (e) => {
    e.preventDefault();

    if (!taskText.trim()) {
      return;
    }

    try {
      setErrorMessage('');
      const response = await axios.post(API_URL, {
        text: taskText.trim()
      });
      // Append the newly created task returned from the server to state
      setTasks([...tasks, response.data]);
      setTaskText(''); // Clear the input field
    } catch (error) {
      console.error('Error adding task:', error);
      setErrorMessage('Failed to add task. Please try again.');
    }
  };

  // 3. PUT /api/tasks/:id - Mark task as completed or toggle completion
  const handleToggleComplete = async (id, currentStatus) => {
    try {
      setErrorMessage('');
      const response = await axios.put(`${API_URL}/${id}`, {
        completed: !currentStatus
      });

      // Update the modified task in the local React state
      setTasks(tasks.map((task) => ((task._id || task.id) === id ? response.data : task)));
    } catch (error) {
      console.error('Error updating task:', error);
      setErrorMessage('Failed to update task status.');
    }
  };

  // 4. DELETE /api/tasks/:id - Delete a task
  const handleDeleteTask = async (id) => {
    try {
      setErrorMessage('');
      await axios.delete(`${API_URL}/${id}`);
      // Remove the deleted task from local React state
      setTasks(tasks.filter((task) => (task._id || task.id) !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      setErrorMessage('Failed to delete task.');
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="task-manager-card">
      <header className="app-header">
        <h1 className="app-title">Task Manager</h1>
        <p className="app-subtitle">A simple full-stack React &amp; Express application</p>
      </header>

      {/* Error notification banner */}
      {errorMessage && (
        <div className="status-message error">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Form for adding a new task */}
      <form onSubmit={handleAddTask} className="task-form">
        <input
          type="text"
          className="task-input"
          placeholder="What needs to be done?"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
        />
        <button type="submit" className="btn-add" disabled={!taskText.trim()}>
          Add Task
        </button>
      </form>

      {/* Loading state indicator */}
      {loading && <div className="status-message loading">Loading tasks from server...</div>}

      {/* Task List */}
      {!loading && tasks.length === 0 && (
        <div className="empty-state">No tasks yet. Type a task above and click "Add Task"!</div>
      )}

      <ul className="tasks-list">
        {tasks.map((task) => {
          const taskId = task._id || task.id;
          return (
            <li
              key={taskId}
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
                {/* Complete / Undo button */}
                <button
                  type="button"
                  onClick={() => handleToggleComplete(taskId, task.completed)}
                  className={`btn-complete ${task.completed ? 'undo' : ''}`}
                >
                  {task.completed ? 'Undo' : 'Complete'}
                </button>

                {/* Delete button */}
                <button
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

      {/* Summary Footer */}
      {!loading && tasks.length > 0 && (
        <footer className="tasks-summary">
          <span>Total tasks: {tasks.length}</span>
          <span>Completed: {completedCount} / {tasks.length}</span>
        </footer>
      )}
    </div>
  );
}

export default App;
