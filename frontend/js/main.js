// frontend/js/main.js
document.addEventListener('DOMContentLoaded', () => {
    UI.init();
    
    const webrtc = new WebRTCHandler();
    const roomManager = new RoomManager(webrtc);

    // Join room handler
    document.getElementById('join-btn').addEventListener('click', async () => {
        const roomId = document.getElementById('room-id').value.trim();
        const username = document.getElementById('username').value.trim();
        
        if (!roomId || !username) {
            UI.showError('Room ID and username are required');
            return;
        }

        await roomManager.joinRoom(roomId, username);
    });

    // Create room handler
    document.getElementById('create-btn').addEventListener('click', async () => {
        const username = document.getElementById('username').value.trim();
        
        if (!username) {
            UI.showError('Username is required');
            return;
        }

        await roomManager.createRoom(username);
    });

    // Leave room handler
    document.getElementById('leave-btn').addEventListener('click', () => {
        roomManager.leaveRoom();
    });

    // Mute toggle handler
    document.getElementById('mute-btn').addEventListener('click', () => {
        const isMuted = !webrtc.toggleMute();
        UI.toggleMuteButton(isMuted);
    });
});
