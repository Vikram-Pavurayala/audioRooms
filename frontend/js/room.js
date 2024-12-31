// frontend/js/room.js
class RoomManager {
    constructor(webrtc) {
        this.socket = io('http://localhost:3000');
        this.webrtc = webrtc;
        this.currentRoom = null;
        this.username = null;
        this.setupSocketListeners();
    }

  	setupSocketListeners() {
        this.socket.on('room-created', async ({ roomId, users }) => {
            this.currentRoom = roomId;
            UI.updateRoomDisplay(roomId, users);
            await this.webrtc.initializeUserMedia();
            UI.showActiveRoom();
        });

        this.socket.on('room-users', async ({ users }) => {
            UI.updateParticipantsList(users);
            UI.showActiveRoom(); // Add this line to show room interface
            this.currentRoom = document.getElementById('room-id').value; // Add this line
            UI.updateRoomDisplay(this.currentRoom, users); // Add this line
            
            // Initiate calls to all existing users
            for (const user of users) {
                if (user.id !== this.socket.id) {
                    await this.webrtc.initiateCall(user.id, this.socket);
                }
            }
        });


        this.socket.on('user-joined', async ({ userId, username }) => {
            UI.addParticipant({ id: userId, username });
        });

        this.socket.on('user-left', ({ userId }) => {
            UI.removeParticipant(userId);
            if (this.webrtc.peerConnections[userId]) {
                this.webrtc.peerConnections[userId].close();
                delete this.webrtc.peerConnections[userId];
            }
        });

        // WebRTC signaling handlers
        this.socket.on('incoming-call', async ({ from, offer }) => {
            await this.webrtc.handleIncomingCall(from, offer, this.socket);
        });

        this.socket.on('call-answered', async ({ from, answer }) => {
            const peerConnection = this.webrtc.peerConnections[from];
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        });

        this.socket.on('new-ice-candidate', async ({ from, candidate }) => {
            const peerConnection = this.webrtc.peerConnections[from];
            if (peerConnection) {
                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });

        this.socket.on('error', ({ message }) => {
            UI.showError(message);
        });
    }

    async joinRoom(roomId, username) {
        this.username = username;
        await this.webrtc.initializeUserMedia();
        this.socket.emit('join-room', { roomId, username });
        this.currentRoom = roomId;
    }

    async createRoom(username) {
        this.username = username;
        this.socket.emit('create-room', { username });
    }

    leaveRoom() {
        if (this.currentRoom) {
            this.socket.emit('leave-room', { roomId: this.currentRoom });
            this.webrtc.cleanup();
            this.currentRoom = null;
            UI.showRoomSelection();
        }
    }
}
