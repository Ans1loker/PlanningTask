// TaskPlanner.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button, Modal, Form, Spinner, ProgressBar } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { CSVLink } from 'react-csv';
import TaskList from './components/TaskList';
import { motion } from 'framer-motion';

const TaskPlanner = () => {
  const [tasks, setTasks] = useState([]);
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

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/tasks');
      setTasks(response.data);
    } catch (error) {
      setError('Error fetching tasks. Please try again later.');
      toast.error('Error fetching tasks.');
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editTask) {
      setEditTask({ ...editTask, [name]: value });
    } else {
      setNewTask({ ...newTask, [name]: value });
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/api/tasks', newTask);
      setTasks([...tasks, response.data]);
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

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.put(`http://localhost:3001/api/tasks/${editTask._id}`, editTask);
      setTasks(tasks.map(task => (task._id === editTask._id ? response.data : task)));
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
      setTasks(tasks.filter(task => task._id !== taskId));
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
    setTasks(sortedTasks);
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
    setTasks(items);
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
        setTasks([...tasks, ...result]);
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

  const addTag = (e) => {
    e.preventDefault();
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

  const addComment = (e) => {
    e.preventDefault();
    if (editTask) {
      setEditTask({ ...editTask, comments: [...editTask.comments, commentInput] });
    } else {
      setNewTask({ ...newTask, comments: [...newTask.comments, commentInput] });
    }
    setCommentInput('');
  };

  const filteredTasks = tasks.filter(task => {
    return filter === 'All' || task.status === filter;
  }).filter(task => {
    return task.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="container">
      <h1 className="mt-5">SmartTask Planner</h1>
      {error && <p className="alert alert-danger">{error}</p>}
      <div className="form-group">
        <label htmlFor="filter">Filter by status:</label>
        <select id="filter" className="form-control" value={filter} onChange={handleFilterChange}>
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="search">Search by name:</label>
        <input
          id="search"
          type="text"
          className="form-control"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search tasks..."
        />
      </div>
      {loading && (
        <div className="d-flex justify-content-center my-4">
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
        </div>
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
                <TaskList tasks={filteredTasks} onEdit={handleEditTask} onDelete={handleDeleteTask} onSort={handleSort} />
                {provided.placeholder}
              </motion.div>
            )}
          </Droppable>
        </DragDropContext>
      )}
      <Button className="mt-4" onClick={() => setShowModal(true)}>
        Add Task
      </Button>

      <CSVLink data={tasks} filename="tasks.csv" className="btn btn-secondary mt-4">
        Export Tasks
      </CSVLink>

      <input type="file" accept=".csv" onChange={handleFileUpload} className="mt-4" />

      <Modal show={showModal} onHide={() => { setShowModal(false); setEditTask(null); }}>
        <Modal.Header closeButton>
          <Modal.Title>{editTask ? 'Edit Task' : 'Add Task'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={editTask ? handleUpdateTask : handleAddTask}>
            <Form.Group controlId="formTaskName">
              <Form.Label>Task Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={editTask ? editTask.name : newTask.name}
                onChange={handleInputChange}
                placeholder="Task Name"
                required
              />
            </Form.Group>
            <Form.Group controlId="formTaskPriority" className="mt-3">
              <Form.Label>Priority</Form.Label>
              <Form.Control
                type="number"
                name="priority"
                value={editTask ? editTask.priority : newTask.priority}
                onChange={handleInputChange}
                min="1"
                placeholder="Priority"
                required
              />
            </Form.Group>
            <Form.Group controlId="formTaskStatus" className="mt-3">
              <Form.Label>Status</Form.Label>
              <Form.Control
                as="select"
                name="status"
                value={editTask ? editTask.status : newTask.status}
                onChange={handleInputChange}
                required
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formTaskProgress" className="mt-3">
              <Form.Label>Progress</Form.Label>
              <Form.Control
                type="number"
                name="progress"
                value={editTask ? editTask.progress : newTask.progress}
                onChange={handleInputChange}
                min="0"
                max="100"
                placeholder="Progress"
                required
              />
              <ProgressBar now={editTask ? editTask.progress : newTask.progress} label={`${editTask ? editTask.progress : newTask.progress}%`} />
            </Form.Group>
            <Form.Group controlId="formTaskTags" className="mt-3">
              <Form.Label>Tags</Form.Label>
              <div>
                {(editTask ? editTask.tags : newTask.tags).map((tag, index) => (
                  <span key={index} className="badge bg-secondary me-2">{tag}</span>
                ))}
              </div>
              <Form.Control
                type="text"
                value={tagInput}
                onChange={handleTagInputChange}
                placeholder="Add a tag"
              />
              <Button variant="primary" onClick={addTag} className="mt-2">Add Tag</Button>
            </Form.Group>
            <Form.Group controlId="formTaskComments" className="mt-3">
              <Form.Label>Comments</Form.Label>
              <div>
                {(editTask ? editTask.comments : newTask.comments).map((comment, index) => (
                  <p key={index}>{comment}</p>
                ))}
              </div>
              <Form.Control
                type="text"
                value={commentInput}
                onChange={handleCommentInputChange}
                placeholder="Add a comment"
              />
              <Button variant="primary" onClick={addComment} className="mt-2">Add Comment</Button>
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3">
              {editTask ? 'Update Task' : 'Add Task'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default TaskPlanner;
