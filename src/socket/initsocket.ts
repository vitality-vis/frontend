import {io, Socket} from 'socket.io-client';

const socket: Socket = io("http://localhost:3001", {
  transports: ['websocket'],
  autoConnect: true,  // Automatically connect when the script loads
});

export default socket;