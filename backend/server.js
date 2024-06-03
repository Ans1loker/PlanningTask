// server.js

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/taskplanner', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Task Schema
const taskSchema = new mongoose.Schema({
  name: String,
  priority: Number,
  status: String,
  tags: [String],
  comments: [String],
  progress: Number
});

const Task = mongoose.model('Task', taskSchema);

// Routes
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

app.post('/api/tasks', async (req, res) => {
  const { name, priority, status, tags, comments, progress } = req.body;
  try {
    const newTask = new Task({ name, priority, status, tags, comments, progress });
    const task = await newTask.save();
    res.json(task);
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  const { name, priority, status, tags, comments, progress } = req.body;
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, { name, priority, status, tags, comments, progress }, { new: true });
    res.json(task);
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Task deleted' });
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

app.post('/api/tasks/import', async (req, res) => {
  try {
    await Task.insertMany(req.body);
    res.json({ msg: 'Tasks imported' });
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
