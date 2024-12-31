// backend/src/utils/roomManager.js
class RoomManager {
    constructor() {
        this.rooms = new Map();
    }

    createRoom() {
        const roomId = this.generateRoomId();
        this.rooms.set(roomId, {
            id: roomId,
            users: new Map()
        });
        return roomId;
    }

    getRoom(roomId) {
        return this.rooms.get(roomId);
    }

    addUserToRoom(roomId, user) {
        const room = this.rooms.get(roomId);
        if (room) {
            room.users.set(user.id, user);
        }
    }

    removeUserFromRoom(roomId, userId) {
        const room = this.rooms.get(roomId);
        if (room) {
            room.users.delete(userId);
        }
    }

    getRoomUsers(roomId) {
        const room = this.rooms.get(roomId);
        if (room) {
            return Array.from(room.users.values());
        }
        return [];
    }

    findUserRoom(userId) {
        for (const [roomId, room] of this.rooms) {
            if (room.users.has(userId)) {
                return roomId;
            }
        }
        return null;
    }

    isRoomEmpty(roomId) {
        const room = this.rooms.get(roomId);
        return room ? room.users.size === 0 : true;
    }

    removeRoom(roomId) {
        this.rooms.delete(roomId);
    }

    generateRoomId() {
        return Math.random().toString(36).substr(2, 9);
    }
}

module.exports = { RoomManager };
