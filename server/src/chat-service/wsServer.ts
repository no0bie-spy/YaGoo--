import WebSocket, { WebSocketServer } from 'ws';
import { verifyToken } from './utils/authMiddleware';

interface SocketWithUser extends WebSocket {
  user?: any;
  rideId?: string;
}

const rooms: Record<string, SocketWithUser[]> = {}; // { rideId: [socket, socket] }

export function setupWebSocket(server: any) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', function (ws: SocketWithUser, req) {
    ws.on('message', function (data) {
      try {
        const msg = JSON.parse(data.toString());

        if (msg.type === 'JOIN') {
          const { token, rideId } = msg;
          const user = verifyToken(token);
          if (!user) return ws.close();

          ws.user = user;
          ws.rideId = rideId;

          rooms[rideId] = rooms[rideId] || [];
          rooms[rideId].push(ws);
        }

        if (msg.type === 'MESSAGE') {
          const { content } = msg;
          const { user, rideId } = ws;

          const payload = {
            type: 'MESSAGE',
            sender: user.fullname,
            role: user.role,
            content,
            rideId,
            timestamp: Date.now(),
          };

          rooms[rideId]?.forEach(socket => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify(payload));
            }
          });
        }
      } catch (err) {
        console.error(err);
      }
    });

    ws.on('close', () => {
      const { rideId } = ws;
      if (rideId && rooms[rideId]) {
        rooms[rideId] = rooms[rideId].filter(s => s !== ws);
      }
    });
  });
}
