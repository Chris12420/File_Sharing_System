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

*   **Backend**: Node.js, Express.js, MongoDB (with Mongoose and GridFS), JWT (for auth), bcryptjs (for password hashing), express-session, connect-mongo, multer (for handling file uploads in memory before streaming to GridFS)
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

4.  **(CAN SKIP THIS PART!!!!!!!!!!!!)** 
    **The current project's .env file is already configured with our project MongoDB** 

    **Set up Environment Variables (Backend)** 
    *   Navigate to the `server` directory.
    *   Create a `.env` file.
    *   Add the following variables:
        ```env
        MONGODB_URI=your_mongodb_connection_string # If setting up from scratch, replace with your MongoDB connection string. (The current project's .env file is already configured). Ensure the database user has readWrite permissions.
        SESSION_SECRET=your_strong_random_session_secret # Replace with a strong secret
        # DB_NAME=fileShareDB # Typically included in the MONGODB_URI
        # NODE_ENV=development # Optional: Set to 'production' for production builds
        ```
    *   Replace `your_mongodb_connection_string` with your actual MongoDB connection string (e.g., from MongoDB Atlas).
    *   Replace `your_strong_random_session_secret` with a long, random string for session security.

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