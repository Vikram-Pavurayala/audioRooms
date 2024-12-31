// backend/src/server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const { RoomManager } = require('./utils/roomManager');
const app = express();
const server = http.createServer(app);
const roomManager = new RoomManager();

const io = socketIO(server, {
    cors: {
        origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
        methods: ["GET", "POST"]
    }
});

app.use(cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500']
}));
app.use(express.json());

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    socket.on('join-room', ({ roomId, username }) => {
        const room = roomManager.getRoom(roomId);
        if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
        }
        socket.join(roomId);
        roomManager.addUserToRoom(roomId, { id: socket.id, username });
        socket.to(roomId).emit('user-joined', { userId: socket.id, username });
        socket.emit('room-users', { users: roomManager.getRoomUsers(roomId) });
    });

    socket.on('create-room', ({ username }) => {
        const roomId = roomManager.createRoom();
        roomManager.addUserToRoom(roomId, { id: socket.id, username });
        socket.join(roomId);
        socket.emit('room-created', {
            roomId,
            users: roomManager.getRoomUsers(roomId)
        });
    });

    socket.on('call-user', ({ offer, to }) => {
        socket.to(to).emit('incoming-call', {
            from: socket.id,
            offer
        });
    });

    socket.on('call-answer', ({ answer, to }) => {
        socket.to(to).emit('call-answered', {
            from: socket.id,
            answer
        });
    });

    socket.on('ice-candidate', ({ candidate, to }) => {
        socket.to(to).emit('new-ice-candidate', {
            from: socket.id,
            candidate
        });
    });

    socket.on('leave-room', ({ roomId }) => {
        handleUserLeaving(socket, roomId);
    });

    socket.on('disconnect', () => {
        const roomId = roomManager.findUserRoom(socket.id);
        if (roomId) {
            handleUserLeaving(socket, roomId);
        }
    });
});

function handleUserLeaving(socket, roomId) {
    const room = roomManager.getRoom(roomId);
    if (room) {
        roomManager.removeUserFromRoom(roomId, socket.id);
        socket.to(roomId).emit('user-left', { userId: socket.id });
        if (roomManager.isRoomEmpty(roomId)) {
            roomManager.removeRoom(roomId);
        }
    }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
