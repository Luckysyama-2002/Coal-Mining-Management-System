# Coal Mining Management System

A comprehensive web application for managing coal mining operations with role-based access control.

## 🚀 Features

- **Multi-role Dashboard**: Separate interfaces for Managers, Employees, and Safety Officers
- **Real-time Monitoring**: Live sensor data and safety incident tracking
- **Employee Management**: Complete CRUD operations with validation
- **Safety Compliance**: Incident reporting, analytics, and regulatory compliance
- **Payroll Management**: Automated payslip generation and salary calculations
- **Health Tracking**: Medical checkup scheduling and records management

## 🛡️ Security Features

### Authentication & Authorization
- JWT-based authentication with secure token storage
- Role-based access control (Manager, Employee, Safety Officer, Admin)
- Password hashing with bcrypt
- Rate limiting on authentication endpoints

### Input Validation & Sanitization
- Frontend form validation with real-time feedback
- Backend input sanitization and validation
- SQL injection prevention
- XSS protection with input escaping

### Security Headers
- Helmet.js for comprehensive security headers
- CORS configuration for cross-origin requests
- Content Security Policy (CSP) implementation

## 📋 Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## 🔧 Installation

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your configuration:
   ```env
   PORT=8000
   FRONTEND_URL=http://localhost:5173
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_secure_db_password
   DB_NAME=coalmine2
   JWT_SECRET=your_super_secure_jwt_secret_key_here
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=5
   ```

5. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## 🔒 Security Best Practices

### Environment Variables
- Never commit `.env` files to version control
- Use strong, unique secrets for JWT and database passwords
- Rotate secrets regularly in production

### Password Policy
- Minimum 6 characters required
- Consider implementing additional complexity rules
- Encourage regular password changes

### Rate Limiting
- Authentication endpoints limited to 5 requests per 15 minutes per IP
- Prevents brute force attacks on login

### Input Validation
- All user inputs are validated on both frontend and backend
- SQL injection prevented through parameterized queries
- XSS attacks mitigated through input sanitization

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/verify-otp` - Verify OTP
- `POST /api/v1/auth/reset-password` - Reset password

### Employee Management
- `GET /api/v1/employee/employees` - List all employees (Manager+)
- `POST /api/v1/employee/employees` - Create new employee (Manager+)
- `PUT /api/v1/employee/employees/:id` - Update employee (Manager+)
- `DELETE /api/v1/employee/employees/:id` - Delete employee (Admin only)

### Dashboard Data
- `GET /api/v1/employee/summary` - Dashboard statistics
- `GET /api/v1/employee/profile/:id` - Employee profile
- `GET /api/v1/employee/health/:id` - Health checkups
- `GET /api/v1/employee/shifts/:id` - Shift schedule

## 🚨 Security Considerations

### Production Deployment
- Use HTTPS in production
- Implement proper logging and monitoring
- Regular security audits and updates
- Database backups and recovery procedures

### Data Protection
- Employee data encrypted at rest
- Secure API communication
- GDPR/CCPA compliance considerations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement security best practices
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For security issues, please contact the development team immediately.