const express = require('express');
const path = require('path');
const tasksRouter = require('./routes/tasks');
const errorHandler = require('./middleware/errorHandler');
const app = express();

app.use(express.json());

// Serve static frontend from /public
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/tasks', tasksRouter);

app.get('/', (req, res) => res.json({ message: 'Daily Task Notes API' }));

// 404 for unknown routes
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
