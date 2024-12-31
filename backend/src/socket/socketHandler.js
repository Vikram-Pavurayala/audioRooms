// backend/src/socket/socketHandler.js
const { RoomManager } = require('../utils/roomManager');
const roomManager = new RoomManager();

function setupSocketHandlers(io) {
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);
        
        // Join room handler
        socket.on('join-room', ({ roomId, username }) => {
            const room = roomManager.getRoom(roomId);
            if (!room) {
                socket.emit('error', { message: 'Room not found' });
                return;
            }

            // Join the room
            socket.join(roomId);
            roomManager.addUserToRoom(roomId, { id: socket.id, username });
            
            // Notify others in the room
            socket.to(roomId).emit('user-joined', {
                userId: socket.id,
                username
            });

            // Send current participants to the new user
            socket.emit('room-users', {
                users: roomManager.getRoomUsers(roomId)
            });
        });

        // Create room handler
        socket.on('create-room', ({ username }) => {
            const roomId = roomManager.createRoom();
            roomManager.addUserToRoom(roomId, { id: socket.id, username });
            
            socket.join(roomId);
            socket.emit('room-created', {
                roomId,
                users: roomManager.getRoomUsers(roomId)
            });
        });

        // WebRTC signaling handlers
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

        // Leave room handler
        socket.on('leave-room', ({ roomId }) => {
            handleUserLeaving(socket, roomId);
        });

        // Disconnect handler
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
            
            // Clean up empty rooms
            if (roomManager.isRoomEmpty(roomId)) {
                roomManager.removeRoom(roomId);
            }
        }
    }
}

module.exports = { setupSocketHandlers };
