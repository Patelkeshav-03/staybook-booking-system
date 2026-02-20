# Staybook - Full Stack Hotel Booking System

## Getting Started

This project is a full-stack application with a React frontend and Node.js/Express backend.

### Prerequisites
- Node.js installed
- MongoDB installed and running locally on default port (27017)

### Backend Setup
1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:5000`.

### Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```
   The frontend will run on `http://localhost:3000`.

## Project Structure

### Backend (`/backend`)
- **`src/models/User.js`**: User schema with role-based access (admin, vendor, customer).
- **`src/controllers/authController.js`**: Handles user registration and login with JWT generation.
- **`src/middleware/authMiddleware.js`**: Verifies JWT tokens.
- **`src/middleware/roleMiddleware.js`**: Restricts access based on user roles.
- **`src/routes/userRoutes.js`**: Role-protected routes.

### Frontend (`/frontend`)
- **`src/pages/Login.js`**: User login with role-based redirection.
- **`src/pages/Register.js`**: User registration.
- **`src/components/ProtectedRoute.js`**: Higher-order component to protect routes based on authentication and role.
- **`src/services/api.js`**: Axios instance with automatic Authorization header injection.

## Usage
1. Register a new user at `/register`. Select a role (e.g., specific role for testing).
2. Login at `/login`.
3. You will be redirected to the appropriate dashboard based on your role.
4. Try accessing a route you are not authorized for (e.g., as a customer, try going to `/admin/dashboard`) to see the protection in action.
