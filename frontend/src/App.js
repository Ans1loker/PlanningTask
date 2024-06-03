import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskPlanner from './TaskPlanner';

const App = () => {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskUpdate = (updatedTasks) => {
    setTasks(updatedTasks);
  };

  return (
    <div className="App">
      <TaskPlanner tasks={tasks} onTaskUpdate={handleTaskUpdate} />
    </div>
  );
};

export default App;
