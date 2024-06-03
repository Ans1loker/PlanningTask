import React, { useState } from 'react';
import axios from 'axios';
import { Button, Form } from 'react-bootstrap';

const Login = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/login', { username, password });
      setToken(response.data.token);
    } catch (error) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="container">
      <h2 className="mt-5">Login</h2>
      {error && <p className="alert alert-danger">{error}</p>}
      <Form onSubmit={handleLogin}>
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
          Login
        </Button>
      </Form>
    </div>
  );
};

export default Login;
