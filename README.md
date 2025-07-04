# Pose Master - AI Yoga Posture Assistant

<div align="center">
  <img src="https://i.imgur.com/your-logo-image.png" alt="Pose Master Logo" width="150"/>
</div>

<br/>

## 1. What is Pose Master?

Pose Master is an interactive Ed-Tech platform that acts as a personal yoga instructor. It uses artificial intelligence to analyze a user's yoga postures in real-time, providing immediate feedback to help them achieve the correct form. The application is designed for both students who want to learn and mentors who want to teach, creating a collaborative and guided learning environment.

---

## 2. Key Features

- **User Authentication & Roles**: Secure JWT-based authentication with distinct sign-up and login flows for "Mentor" and "Student" roles.
- **AI-Powered Pose Comparison**: Leverages a Python-based API with OpenCV and MediaPipe to compare the user's live video stream against a reference yoga pose image.
- **Interactive Rooms & Chat**: Mentors can create private rooms, and students can join them. A real-time chat feature, powered by WebSockets, allows for instant communication.
- **Mentor Dashboard**: A dedicated interface for mentors to upload new yoga poses, which become available for students to practice within the rooms.
- **Dynamic Content Gallery**: Students can browse through the poses uploaded by the mentor in their current room.
- **Responsive UI**: A modern and intuitive user interface built with React and Material-UI, ensuring a seamless experience across devices.

---

## 3. Tech Stack

| Category      | Technology                                                         |
| :------------ | :----------------------------------------------------------------- |
| **Frontend**  | `React.js`, `Material-UI`, `Socket.io-client`, `Axios`             |
| **Backend**   | `Node.js`, `Express.js`, `Socket.io`, `MongoDB`, `Mongoose`, `JWT` |
| **AI/ML API** | `Python`, `Flask`, `OpenCV`, `Mediapipe`                           |
| **DevOps**    | `Git`, `GitHub`                                                    |

---

## 4. How to Run It Locally

To get a local copy up and running, please follow these steps.

### Prerequisites

- Node.js & npm
- Python & pip
- MongoDB

### Installation & Setup

1.  **Clone the repository:**

    ```sh
    git clone https://github.com/kamnajain06/Pose_Master.git
    cd Pose_Master
    ```

2.  **Set up the Backend:**

    ```sh
    cd backend
    npm install
    ```

    Create a `.env` file in the `/backend` directory and add your MongoDB connection string and JWT secret:

    ```env
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    ```

    Then, start the backend server:

    ```sh
    npm start
    ```

3.  **Set up the Pose Detection API:**

    ```sh
    cd ../pose_api
    pip install -r requirements.txt
    ```

    Then, start the Flask API:

    ```sh
    python app.py
    ```

4.  **Set up the Frontend:**
    ```sh
    cd ../frontend
    npm install
    ```
    Then, start the React development server:
    ```sh
    npm start
    ```

Your application should now be running, with the frontend available at `http://localhost:3000`.

---

## 5. Folder Structure

The project is organized into three main parts:

```
.
├── backend/        # Node.js/Express server, handles API, users, rooms, chat
├── frontend/       # React.js client-side application
└── pose_api/       # Python/Flask API for AI pose comparison
```

---

## 6. Live Demo

_You can add a link to your deployed application here._

[View Live Demo](https://your-live-demo-link.com)

---

## 7. Screenshots

![Landing Page](/Pose_Master/project_gallery/Screenshot%202025-07-04%20at%204.20.45 PM.png)
![Diet Plan](/Pose_Master/project_gallery/Screenshot%202025-07-04%20at%204.11.38 PM.png)
![](/Pose_Master/project_gallery/Screenshot%202025-07-04%20at%204.12.51 PM.png)
![Presentation](/Pose_Master/project_gallery/Screenshot%202025-07-04%20at%204.16.58 PM.png)
