# Chit-Chat

A real-time chat application built with the MERN stack, featuring channel-based messaging, user authentication, and a beautiful responsive UI.

# View Live App: https://chit-chat-frontend-dexa.onrender.com/chat

## Tech Stack

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for storing users, channels, and messages
- **Socket.io** - Real-time bidirectional event-based communication
- **JWT (jsonwebtoken)** - Secure authentication using JSON Web Tokens
- **bcryptjs** - Password hashing for secure user authentication

### Frontend
- **React 18.3.1** - JavaScript library for building user interfaces
- **Vite 5.4.9** - Fast build tool and development server
- **TailwindCSS 3.4.13** - Utility-first CSS framework for styling
- **Axios** - HTTP client for API requests
- **Socket.io-client** - Client-side Socket.io integration

## Features

- 🔐 User authentication (signup/login/logout)
- 💬 Real-time messaging using Socket.io
- 📢 Channel-based chat system
- ✏️ Edit and delete messages
- 👥 Join/leave channels
- 🔧 Channel management (create, edit, delete)
- 👀 Online users tracking
- 📱 Fully responsive design (mobile, tablet, desktop)
- 💾 Draft message persistence (localStorage)
- 🎨 Beautiful gradient UI with cool color schemes

## Setup and Run Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_ORIGIN=http://localhost:5173
```

4. Start the backend server:
```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory (if needed):
```env
VITE_API_URL=http://localhost:5000
```

4. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### Running Both Servers

You can run both servers simultaneously by opening two terminal windows and following the instructions above for each.

## Project Structure

```
Chit-Chat/
├── backend/
│   ├── config/         # Database configuration
│   ├── controllers/    # Request handlers
│   ├── middlewares/    # Authentication middleware
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API routes
│   ├── sockets/        # Socket.io configuration
│   ├── utils/          # JWT utilities
│   └── server.js       # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── context/    # React Context API
│   │   ├── layouts/    # Layout components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   └── styles/     # CSS files
│   └── index.html
└── README.md
```

## Assumptions

1. **MongoDB Atlas**: The application assumes you're using local MongoDB Atlas database. You can also use a MongoDB cloud database.

2. **Port Configuration**: Backend runs on port 5000 and frontend on port 5173 by default. Ensure these ports are available.

3. **Environment Variables**: All sensitive information (JWT secret, MongoDB URI) should be stored in `.env` files and never committed to version control.

4. **Browser Compatibility**: The application is optimized for modern browsers (Chrome, Firefox, Safari, Edge) with ES6+ support.

5. **Channel Permissions**: 
   - Any channel member can edit channel details
   - Users must join a channel to send messages

## Limitations

1. **File Sharing**: Currently, the application only supports text messages. File/image sharing is not implemented.

2. **Message History**: Messages are loaded with pagination (30 messages at a time). Older messages require scrolling to the top to load more.

3. **Notifications**: Push notifications or browser notifications are not implemented.

4. **Private Messaging**: The app only supports channel-based communication. Direct messaging between users is not available.

5. **Message Search**: There is no search functionality for messages within channels.

6. **User Profiles**: User profiles are minimal (username only). Extended profile features are not implemented.

7. **Channel Discovery**: There is no search or filter functionality for finding channels. All channels are displayed in the sidebar.

8. **Message Reactions**: Emoji reactions to messages are not implemented.

9. **Read Receipts**: Message read status and typing indicators is not there.

10. **Password Recovery**: Forgot password / password reset functionality is not implemented.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `DELETE /api/auth/delete-account` - Delete user account

### Channels
- `GET /api/channels` - Get all channels
- `POST /api/channels` - Create a new channel
- `PATCH /api/channels/:channelId` - Update channel details
- `DELETE /api/channels/:channelId` - Delete a channel
- `POST /api/channels/:channelId/join` - Join a channel
- `POST /api/channels/:channelId/leave` - Leave a channel

### Messages
- `GET /api/messages/:channelId` - Get messages for a channel
- `POST /api/messages/:channelId` - Send a message to a channel
- `PATCH /api/messages/:messageId` - Edit a message
- `DELETE /api/messages/:messageId` - Delete a message

### Users
- `GET /api/users/count` - Get total user count

## Socket Events

### Client → Server
- `joinChannel` - Join a channel room
- `leaveChannel` - Leave a channel room
- `newMessage` - Notify of new message
- `editMessage` - Notify of message edit
- `deleteMessage` - Notify of message deletion
- `getOnlineUsers` - Request online users list

### Server → Client
- `newMessage` - Broadcast new message to channel
- `messageEdited` - Broadcast message edit to channel
- `messageDeleted` - Broadcast message deletion to channel
- `userOnline` - User came online
- `userOffline` - User went offline
- `onlineUsersUpdate` - Updated list of online users
- `userCountChanged` - Total user count changed

