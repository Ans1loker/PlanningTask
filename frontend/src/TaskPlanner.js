import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Container, TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Select, MenuItem, FormControl, InputLabel, Typography, CircularProgress, Chip, Box, List, ListItem, ListItemText, IconButton
} from '@mui/material';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { CSVLink } from 'react-csv';
import TaskList from './components/TaskList';
import { motion } from 'framer-motion';
import DeleteIcon from '@mui/icons-material/Delete';

const TaskPlanner = ({ tasks, onTaskUpdate }) => {
  const [error, setError] = useState('');
  const [newTask, setNewTask] = useState({ name: '', priority: 1, status: 'Pending', tags: [], comments: [], progress: 0 });
  const [editTask, setEditTask] = useState(null);
  const [sortCriteria, setSortCriteria] = useState({ key: 'name', order: 'asc' });
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [commentInput, setCommentInput] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editTask) {
      setEditTask({ ...editTask, [name]: value });
    } else {
      setNewTask({ ...newTask, [name]: value });
    }
  };

  const handleAddTask = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/api/tasks', newTask);
      onTaskUpdate([...tasks, response.data]);
      setNewTask({ name: '', priority: 1, status: 'Pending', tags: [], comments: [], progress: 0 });
      toast.success('Task added successfully!');
      setShowModal(false);
    } catch (error) {
      setError('Error adding task. Please try again later.');
      toast.error('Error adding task.');
      console.error('Error adding task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = (task) => {
    setEditTask(task);
    setShowModal(true);
  };

  const handleUpdateTask = async () => {
    setLoading(true);
    try {
      const response = await axios.put(`http://localhost:3001/api/tasks/${editTask._id}`, editTask);
      onTaskUpdate(tasks.map(task => (task._id === editTask._id ? response.data : task)));
      setEditTask(null);
      toast.success('Task updated successfully!');
      setShowModal(false);
    } catch (error) {
      setError('Error updating task. Please try again later.');
      toast.error('Error updating task.');
      console.error('Error updating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setLoading(true);
    try {
      await axios.delete(`http://localhost:3001/api/tasks/${taskId}`);
      onTaskUpdate(tasks.filter(task => task._id !== taskId));
      toast.success('Task deleted successfully!');
    } catch (error) {
      setError('Error deleting task. Please try again later.');
      toast.error('Error deleting task.');
      console.error('Error deleting task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let order = 'asc';
    if (sortCriteria.key === key && sortCriteria.order === 'asc') {
      order = 'desc';
    }
    setSortCriteria({ key, order });
    const sortedTasks = [...tasks].sort((a, b) => {
      if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
      return 0;
    });
    onTaskUpdate(sortedTasks);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    onTaskUpdate(items);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csv = event.target.result;
      const lines = csv.split('\n');
      const result = [];
      const headers = lines[0].split(',');

      for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentline = lines[i].split(',');

        for (let j = 0; j < headers.length; j++) {
          obj[headers[j]] = currentline[j];
        }
        result.push(obj);
      }

      try {
        await axios.post('http://localhost:3001/api/tasks/import', result);
        onTaskUpdate([...tasks, ...result]);
        toast.success('Tasks imported successfully!');
      } catch (error) {
        setError('Error importing tasks. Please try again later.');
        toast.error('Error importing tasks.');
        console.error('Error importing tasks:', error);
      }
    };
    reader.readAsText(file);
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const addTag = () => {
    if (editTask) {
      setEditTask({ ...editTask, tags: [...editTask.tags, tagInput] });
    } else {
      setNewTask({ ...newTask, tags: [...newTask.tags, tagInput] });
    }
    setTagInput('');
  };

  const handleCommentInputChange = (e) => {
    setCommentInput(e.target.value);
  };

  const addComment = () => {
    if (editTask) {
      setEditTask({ ...editTask, comments: [...editTask.comments, commentInput] });
    } else {
      setNewTask({ ...newTask, comments: [...newTask.comments, commentInput] });
    }
    setCommentInput('');
  };

  return (
    <Container>
      <Typography variant="h4" component="h2" gutterBottom>
        Task Planner
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <FormControl fullWidth margin="normal">
        <InputLabel>Filter by status</InputLabel>
        <Select value={filter} onChange={handleFilterChange}>
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="In Progress">In Progress</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Search by name"
        variant="outlined"
        fullWidth
        margin="normal"
        value={search}
        onChange={handleSearchChange}
        placeholder="Search tasks..."
      />
      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}
      {!loading && (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <motion.div 
                {...provided.droppableProps} 
                ref={provided.innerRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <TaskList tasks={tasks} onEdit={handleEditTask} onDelete={handleDeleteTask} onSort={handleSort} />
                {provided.placeholder}
              </motion.div>
            )}
          </Droppable>
        </DragDropContext>
      )}
      <Box mt={4} display="flex" justifyContent="space-between">
        <Button variant="contained" color="primary" onClick={() => setShowModal(true)}>
          Add Task
        </Button>
        <CSVLink data={tasks} filename="tasks.csv" style={{ textDecoration: 'none' }}>
          <Button variant="contained" color="secondary">
            Export Tasks
          </Button>
        </CSVLink>
        <Button variant="contained" component="label">
          Import Tasks
          <input type="file" accept=".csv" hidden onChange={handleFileUpload} />
        </Button>
      </Box>
      <Dialog open={showModal} onClose={() => { setShowModal(false); setEditTask(null); }}>
        <DialogTitle>{editTask ? 'Edit Task' : 'Add Task'}</DialogTitle>
        <DialogContent>
          <Box component="form" noValidate autoComplete="off">
            <TextField
              autoFocus
              margin="dense"
              label="Task Name"
              type="text"
              fullWidth
              name="name"
              value={editTask ? editTask.name : newTask.name}
              onChange={handleInputChange}
              required
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={editTask ? editTask.priority : newTask.priority}
                onChange={handleInputChange}
              >
                {[1, 2, 3, 4, 5].map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {priority}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={editTask ? editTask.status : newTask.status}
                onChange={handleInputChange}
              >
                {['Pending', 'In Progress', 'Completed'].map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <TextField
                label="Progress"
                type="number"
                name="progress"
                value={editTask ? editTask.progress : newTask.progress}
                onChange={handleInputChange}
                InputProps={{ inputProps: { min: 0, max: 100 } }}
              />
            </FormControl>
            <Box mt={2}>
              <Typography variant="body1">Tags:</Typography>
              <Box display="flex" flexWrap="wrap">
                {(editTask ? editTask.tags : newTask.tags).map((tag, index) => (
                  <Chip key={index} label={tag} onDelete={() => {
                    if (editTask) {
                      setEditTask({ ...editTask, tags: editTask.tags.filter((_, i) => i !== index) });
                    } else {
                      setNewTask({ ...newTask, tags: newTask.tags.filter((_, i) => i !== index) });
                    }
                  }} style={{ margin: '2px' }} />
                ))}
              </Box>
              <Box display="flex" alignItems="center">
                <TextField
                  label="Add Tag"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={tagInput}
                  onChange={handleTagInputChange}
                />
                <Button onClick={addTag} variant="contained" color="primary" style={{ marginLeft: '8px', marginTop: '16px', height: '56px' }}>Add</Button>
              </Box>
            </Box>
            <Box mt={2}>
              <Typography variant="body1">Comments:</Typography>
              <List>
                {(editTask ? editTask.comments : newTask.comments).map((comment, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={comment} />
                    <IconButton edge="end" aria-label="delete" onClick={() => {
                      if (editTask) {
                        setEditTask({ ...editTask, comments: editTask.comments.filter((_, i) => i !== index) });
                      } else {
                        setNewTask({ ...newTask, comments: newTask.comments.filter((_, i) => i !== index) });
                      }
                    }}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
              <Box display="flex" alignItems="center">
                <TextField
                  label="Add Comment"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={commentInput}
                  onChange={handleCommentInputChange}
                />
                <Button onClick={addComment} variant="contained" color="primary" style={{ marginLeft: '8px', marginTop: '16px', height: '56px' }}>Add</Button>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowModal(false); setEditTask(null); }} color="primary">
            Cancel
          </Button>
          <Button onClick={editTask ? handleUpdateTask : handleAddTask} color="primary">
            {editTask ? 'Update Task' : 'Add Task'}
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer />
    </Container>
  );
};

export default TaskPlanner;
