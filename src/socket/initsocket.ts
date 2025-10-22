import {io, Socket} from 'socket.io-client';
import { SOCKET_URL } from '../config';

const socket: Socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: true,  // Automatically connect when the script loads
});

export default socket;