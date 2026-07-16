import {io, Socket} from 'socket.io-client';
import { SOCKET_URL } from '../config';
import { isLoggingEnabled } from '../utils/loggingConfig';

// Only create socket connection if logging is enabled (study mode)
// In standalone mode, this will be a disconnected socket that does nothing
const socket: Socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: isLoggingEnabled(),  // Only auto-connect in study mode
});

export default socket;