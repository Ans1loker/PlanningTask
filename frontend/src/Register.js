import React, { useState } from 'react';
import axios from 'axios';
import { Button, Form } from 'react-bootstrap';

const Register = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/register', { username, password });
      setSuccess('Registration successful. Please log in.');
      setError('');
    } catch (error) {
      setError('Registration failed. Please try again.');
      setSuccess('');
    }
  };

  return (
    <div className="container">
      <h2 className="mt-5">Register</h2>
      {error && <p className="alert alert-danger">{error}</p>}
      {success && <p className="alert alert-success">{success}</p>}
      <Form onSubmit={handleRegister}>
        <Form.Group controlId="formUsername">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            required
          />
        </Form.Group>
        <Form.Group controlId="formPassword" className="mt-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-4">
          Register
        </Button>
      </Form>
    </div>
  );
};

export default Register;
