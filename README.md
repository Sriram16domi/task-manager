# Task Manager (Full-Stack Application with MongoDB)

A simple, beginner-friendly full-stack **Task Manager** built using:
- **Frontend:** React.js, Vite, JavaScript, simple CSS, and Axios
- **Backend:** Node.js, Express.js, JavaScript, REST API, CORS, and Mongoose (MongoDB)
- **Database:** MongoDB Atlas / Cloud database via Mongoose

---

## Project Structure

```text
task-manager/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main React component managing task state and API calls
│   │   ├── main.jsx       # React entry point that renders App into index.html
│   │   └── App.css        # Clean, simple custom CSS styles (no Tailwind)
│   ├── index.html         # HTML template for Vite
│   ├── package.json       # Frontend dependencies (React, Axios, Vite)
│   └── vite.config.js     # Vite dev server configuration and API proxy
│
├── backend/
│   ├── models/
│   │   └── Task.js        # Mongoose Task Schema & Model
│   ├── server.js          # Express server with MongoDB connection & REST endpoints
│   ├── package.json       # Backend dependencies (Express, CORS, dotenv, Mongoose)
│   └── .env               # Backend environment variables (PORT, MONGODB_URI)
│
└── README.md              # Complete setup and execution guide
```

---

## What Every Important File Does

### Backend
1. **`backend/models/Task.js`**:
   - Defines the Mongoose Schema for tasks (`text`, `completed`, `timestamps`).
   - Automatically adds `createdAt` and `updatedAt`.
   - Exports the `Task` model for database querying.
2. **`backend/server.js`**:
   - Connects to MongoDB via `mongoose.connect(process.env.MONGODB_URI)`.
   - Sets up Express middleware: `cors()` for cross-origin requests and `express.json()` for parsing request bodies.
   - Defines REST API endpoints using Mongoose queries:
     * `GET /api/tasks` → `Task.find().sort({ createdAt: -1 })`
     * `POST /api/tasks` → `Task.create({ text, completed: false })`
     * `PUT /api/tasks/:id` → `Task.findById(...)` & updates status
     * `DELETE /api/tasks/:id` → `Task.findByIdAndDelete(id)`
3. **`backend/.env`**:
   - Holds configuration variables:
     ```env
     PORT=5000
     MONGODB_URI="your_mongodb_connection_string"
     ```
4. **`backend/package.json`**:
   - Lists dependencies (`express`, `cors`, `dotenv`, `mongoose`).

### Frontend
1. **`frontend/src/App.jsx`**:
   - Manages state using React's `useState`: `tasks`, `taskText`, `loading`, and `errorMessage`.
   - Uses `useEffect` to fetch tasks from MongoDB via Axios when the page loads.
   - Handles adding, toggling completion, and deleting tasks. Supports both `task._id` and `task.id`.
2. **`frontend/src/App.css`**:
   - Beginner-friendly custom CSS (clean card layout, strike-through for completed items, status badges).
3. **`frontend/src/main.jsx`**:
   - Mounts the React application to the DOM.
4. **`frontend/vite.config.js`**:
   - Configures Vite to proxy `/api` requests to the Express server on port 5000.

---

## How React Communicates with the Node.js API and MongoDB

1. **User Action**: The user enters a task and clicks "Add Task" or clicks "Complete" / "Delete".
2. **Axios Request**: React sends an asynchronous HTTP request (`axios.get`, `axios.post`, `axios.put`, `axios.delete`) to the Express API route.
3. **Express + Mongoose**:
   - Express receives the HTTP request.
   - Mongoose translates the operation into a MongoDB command (e.g. `insertOne`, `find`, `findOneAndUpdate`, `deleteOne`).
   - MongoDB performs the operation and returns the resulting document.
4. **HTTP Response**: Express sends the JSON response back with appropriate HTTP status codes (`200 OK` or `201 Created`).
5. **UI Update**: React receives the updated document in `response.data` and updates state (`setTasks`), instantly updating the screen.

---

## How to Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

---

## How to Start the Application Locally

### 1. Start the Backend Server
```bash
cd backend
npm start
```
*Server connects to MongoDB and runs on: **`http://localhost:5000`***

### 2. Start the Frontend (Vite)
In a second terminal:
```bash
cd frontend
npm run dev
```
*Vite will start on **`http://localhost:5173`**.*

Open `http://localhost:5173` in your browser.

---

## MongoDB Atlas Network Access Note
If you are using MongoDB Atlas and see a connection timeout or network error:
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/).
2. In the left navigation, click **Network Access**.
3. Click **Add IP Address** and select **Allow Access from Anywhere** (`0.0.0.0/0`).
4. Click **Confirm**.

---

## REST API Endpoints & How to Test Them

### 1. `GET /api/tasks` — Retrieve All Tasks
```bash
curl -X GET http://localhost:5000/api/tasks
```

### 2. `POST /api/tasks` — Add a New Task
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"text": "Task stored in MongoDB"}'
```

### 3. `PUT /api/tasks/:id` — Update or Complete a Task
```bash
curl -X PUT http://localhost:5000/api/tasks/<TASK_ID> \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

### 4. `DELETE /api/tasks/:id` — Delete a Task
```bash
curl -X DELETE http://localhost:5000/api/tasks/<TASK_ID>
```
