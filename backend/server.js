const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3001;

const users = []; // Можно удалить, если не требуется

app.use(cors());
app.use(bodyParser.json());

const tasks = [
  { _id: 1, name: 'Task 1', priority: 1, status: 'Pending' },
  { _id: 2, name: 'Task 2', priority: 2, status: 'Completed' },
  { _id: 3, name: 'Task 3', priority: 3, status: 'In Progress' },
];

// Удалите все маршруты, связанные с регистрацией и логином
app.post('/api/register', (req, res) => {
  res.status(501).send('Not implemented');
});

app.post('/api/login', (req, res) => {
  res.status(501).send('Not implemented');
});

// Оставьте маршруты для работы с задачами без аутентификации
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const task = { ...req.body, _id: tasks.length + 1 };
  tasks.push(task);
  res.status(201).json(task);
});

app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const index = tasks.findIndex(t => t._id === parseInt(id));
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...req.body };
    res.json(tasks[index]);
  } else {
    res.status(404).send('Task not found');
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const index = tasks.findIndex(t => t._id === parseInt(id));
  if (index !== -1) {
    const deletedTask = tasks.splice(index, 1);
    res.json(deletedTask);
  } else {
    res.status(404).send('Task not found');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
