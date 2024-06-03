import React from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const Dashboard = ({ tasks }) => {
  const statusCounts = tasks.reduce(
    (acc, task) => {
      acc[task.status]++;
      return acc;
    },
    { Pending: 0, 'In Progress': 0, Completed: 0 }
  );

  const pieData = {
    labels: ['Pending', 'In Progress', 'Completed'],
    datasets: [
      {
        data: [statusCounts.Pending, statusCounts['In Progress'], statusCounts.Completed],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  };

  const barData = {
    labels: tasks.map((task) => task.name),
    datasets: [
      {
        label: 'Priority',
        data: tasks.map((task) => task.priority),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  return (
    <div className="mt-5">
      <h2>Task Analytics</h2>
      <div className="row">
        <div className="col-md-6">
          <h3>Task Status Distribution</h3>
          <Pie data={pieData} />
        </div>
        <div className="col-md-6">
          <h3>Task Priorities</h3>
          <Bar data={barData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
