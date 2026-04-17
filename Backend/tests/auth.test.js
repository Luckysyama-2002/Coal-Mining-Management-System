const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { login, signup } = require('../src/Controllers/auth');
const { findById, createUser } = require('../src/Models/User');

// Mock the User model
jest.mock('../src/Models/User', () => ({
  findById: jest.fn(),
  createUser: jest.fn(),
  logAuditAction: jest.fn(),
}));

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

const app = express();
app.use(express.json());

// Mock routes for testing
app.post('/login', login);
app.post('/signup', signup);

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        emp_id: 'CM-0001',
        emp_name: 'John Doe',
        password: bcrypt.hashSync('password123', 10),
        role: 'employee',
      };

      findById.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mockToken');

      const response = await request(app)
        .post('/login')
        .send({ userId: 'CM-0001', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful.');
      expect(response.body.token).toBe('mockToken');
      expect(response.body.user).toEqual({
        emp_id: 'CM-0001',
        name: 'John Doe',
        role: 'employee',
      });
    });

    it('should return 400 for missing userId or password', async () => {
      const response = await request(app)
        .post('/login')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Employee ID and password are required.');
    });

    it('should return 401 for invalid credentials', async () => {
      findById.mockResolvedValue(null);

      const response = await request(app)
        .post('/login')
        .send({ userId: 'invalid', password: 'password123' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials.');
    });
  });

  describe('POST /signup', () => {
    it('should create user successfully', async () => {
      const mockNewUser = {
        emp_id: 'CM-0002',
        emp_name: 'Jane Doe',
        role: 'employee',
      };

      createUser.mockResolvedValue(mockNewUser);

      const response = await request(app)
        .post('/signup')
        .send({
          emp_name: 'Jane Doe',
          password: 'password123',
          role: 'employee',
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User created successfully.');
      expect(response.body.user).toEqual(mockNewUser);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/signup')
        .send({ emp_name: 'Jane Doe', password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('emp_name, password, and role are required.');
    });
  });
});