// frontend/js/ui.js
class UI {
    static init() {
        this.roomSelection = document.getElementById('room-selection');
        this.activeRoom = document.getElementById('active-room');
        this.currentRoomDisplay = document.getElementById('current-room');
        this.participantsList = document.getElementById('participants-list');
    }

    static showRoomSelection() {
        this.roomSelection.classList.remove('hidden');
        this.activeRoom.classList.add('hidden');
    }

    static showActiveRoom() {
        this.roomSelection.classList.add('hidden');
        this.activeRoom.classList.remove('hidden');
    }

    static updateRoomDisplay(roomId, users) {
        this.currentRoomDisplay.textContent = roomId;
        this.updateParticipantsList(users);
    }

    static updateParticipantsList(users) {
        this.participantsList.innerHTML = '';
        users.forEach(user => this.addParticipant(user));
    }

    static addParticipant(user) {
        const li = document.createElement('li');
        li.id = `participant-${user.id}`;
        li.textContent = user.username;
        this.participantsList.appendChild(li);
    }

    static removeParticipant(userId) {
        const participant = document.getElementById(`participant-${userId}`);
        if (participant) {
            participant.remove();
        }
    }

    static showError(message) {
        alert(message); // You might want to implement a better error display
    }

    static toggleMuteButton(isMuted) {
        const muteBtn = document.getElementById('mute-btn');
        muteBtn.textContent = isMuted ? 'Unmute' : 'Mute';
    }
}
