# TruEstate - Real Estate Platform

A modern real estate platform with production-level authentication system.

## Features

- **Authentication System**: Secure JWT-based authentication with HTTP-only cookies
- **User Management**: Signup, login, and logout functionality
- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Real Estate Features**: Property search, location-based services
- **Security**: Password hashing, input validation, and secure cookie handling

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **HTTP-only cookies** for secure token storage

### Frontend
- **React** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Context API** for state management

## Authentication System

### Security Features
- **JWT Tokens**: Secure, stateless authentication
- **HTTP-only Cookies**: Protection against XSS attacks
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Email and password validation
- **CORS Configuration**: Secure cross-origin requests

### API Endpoints

#### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user (protected)

#### Request/Response Examples

**Signup:**
```json
POST /api/auth/signup
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "message": "User created",
  "user": { "email": "user@example.com" }
}
```

**Login:**
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "user": { "email": "user@example.com" }
}
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your configuration:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

4. Start the backend server:
   ```bash
   node index.js
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. **Access the application** at `http://localhost:5173`
2. **Sign up** with a new account or **login** with existing credentials
3. **Navigate** through the application with full authentication state
4. **Logout** using the logout button in the navigation

## Security Considerations

- JWT tokens are stored in HTTP-only cookies for XSS protection
- Passwords are hashed using bcrypt with salt rounds
- Input validation prevents malicious data
- CORS is configured for secure cross-origin requests
- Environment variables are used for sensitive configuration

## Project Structure

```
TruEstate/
├── backend/
│   ├── index.js          # Main server file
│   ├── package.json      # Backend dependencies
│   └── .env             # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth.tsx      # Authentication container
│   │   │   ├── Login.tsx     # Login form
│   │   │   ├── Signup.tsx    # Signup form
│   │   │   └── Button.tsx    # Reusable button component
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx # Authentication context
│   │   └── App.tsx       # Main application
│   └── package.json      # Frontend dependencies
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
