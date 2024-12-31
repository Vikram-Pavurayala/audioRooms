// frontend/js/webrtc.js
class WebRTCHandler {
    constructor() {
        this.peerConnections = {};
        this.localStream = null;
        this.configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ]
        };
    }

    async initializeUserMedia() {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            });
            return true;
        } catch (error) {
            console.error('Error accessing microphone:', error);
            return false;
        }
    }

    async createPeerConnection(userId, socket) {
        const peerConnection = new RTCPeerConnection(this.configuration);
        this.peerConnections[userId] = peerConnection;

        // Add local stream
        this.localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, this.localStream);
        });

        // Handle ICE candidates
        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                socket.emit('ice-candidate', {
                    candidate: event.candidate,
                    to: userId
                });
            }
        };

        // Handle incoming audio stream
        peerConnection.ontrack = event => {
            const remoteAudio = new Audio();
            remoteAudio.srcObject = event.streams[0];
            remoteAudio.id = `audio-${userId}`;
            remoteAudio.play();
        };

        return peerConnection;
    }

    async handleIncomingCall(userId, offer, socket) {
        const peerConnection = await this.createPeerConnection(userId, socket);
        
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        socket.emit('call-answer', {
            answer,
            to: userId
        });
    }

    async initiateCall(userId, socket) {
        const peerConnection = await this.createPeerConnection(userId, socket);
        
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        socket.emit('call-user', {
            offer,
            to: userId
        });
    }

    toggleMute() {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
            return audioTrack.enabled;
        }
        return false;
    }

    cleanup() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }
        Object.values(this.peerConnections).forEach(pc => pc.close());
        this.peerConnections = {};
    }
}
