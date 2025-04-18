# File Sharing System

A web-based interactive file sharing system built with the MERN stack (MongoDB, Express, React, Node.js). The frontend is built using React and TypeScript.

## Features

*   User authentication (Login/Signup - Basic auth check seems implemented)
*   File upload (including drag & drop) using MongoDB GridFS for storage.
*   File listing and management (basic listing implemented).
*   File download from GridFS.
*   File sharing (placeholder UI, backend logic needs implementation).
*   User roles (concept exists, needs further implementation).

## Tech Stack

*   **Backend**: Node.js, Express.js, MongoDB (with Mongoose and GridFS), bcryptjs (for password hashing), express-session, connect-mongo, multer (for handling file uploads in memory before streaming to GridFS)
*   **Frontend**: React, TypeScript, Tailwind CSS, Lucide Icons

## Prerequisites

*   Node.js (v18 or v20 LTS recommended)
*   npm or yarn
*   MongoDB (local instance or MongoDB Atlas account)

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd File_Sharing_System
    ```

2.  **Install Backend Dependencies:**
    ```bash
    cd server
    npm install
    ```

3.  **Install Frontend Dependencies:**
    ```bash
    cd frontend
    npm install
    ```

4.  **Set up Environment Variables (Backend - for Local Development)**
    *   Navigate to the `server` directory.
    *   Create a `.env` file if it doesn't exist.
    *   Ensure it contains the following variables (the current project's `.env` is pre-configured for the shared Atlas DB):
        ```env
        MONGODB_URI=mongodb+srv://chrisworks1102:1IAfFdhFNO8x5CCx@cluster0.yqje5if.mongodb.net/fileShareDB?retryWrites=true&w=majority&appName=Cluster0
        SESSION_SECRET=B28CF9CAFBB5BFAB3F3114AC58BD1 # Replace with your own strong secret if preferred
        # NODE_ENV=development # Typically defaults to development if not set
        # NODE_ENV=production  # Keep this commented out for local development
        ```
    *   **Note:** For local development, `NODE_ENV` should generally *not* be set to `production` as this affects features like secure cookies.

5.  **Set up Environment Variables (Frontend - for Local Development)**
    *   Navigate to the `frontend` directory.
    *   Create a `.env` file if it doesn't exist.
    *   Add the `VITE_API_BASE_URL` variable pointing to your local backend server:
        ```env
        VITE_API_BASE_URL=http://localhost:5001
        ```
    *   **Note:** When deploying, you'll need to configure the production `VITE_API_BASE_URL` via your hosting provider's environment variables (e.g., on Render), *not* by committing the production URL in this `.env` file.

## Running the Application

1.  **Start the Backend Server:**
    *   Open a terminal in the `server` directory.
    *   Run:
        ```bash
        cd server
        npm run dev
        ```
    *   The backend server should start, typically on `http://localhost:5001`.

2.  **Start the Frontend Development Server:**
    *   Open another terminal in the `frontend` directory.
    *   Run:
        ```bash
        cd frontend
        npm run dev
        ```
    *   The frontend application should be accessible at `http://localhost:3000`.

3.  **Access the Application:**
    *   Open your web browser and navigate to `http://localhost:3000`.

## Project Structure

```
File_Sharing_System/
├── frontend/         # React Frontend Application
│   ├── index.html    # HTML entry point
│   ├── src/
│   │   ├── components/ # Reusable React components
│   │   ├── pages/      # Page components
│   │   ├── styles/     # Stylesheets 
│   │   └── utils/      # Utility functions

├── server/           # Node.js/Express Backend API
│   ├── src/
│   │   ├── config/     # Configuration files 
│   │   ├── controllers/# Request handlers
│   │   ├── db/         # Database connection logic
│   │   ├── middleware/ # Express middleware 
│   │   ├── models/     # Mongoose models
│   │   ├── routes/     # API routes 
│
└── README.md         # This file
```

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## License

(Optional: Add your license information here, e.g., MIT License) 