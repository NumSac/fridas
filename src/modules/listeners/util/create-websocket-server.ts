// src/util/create-websocket-server.ts
import * as http from 'http';
import * as https from 'https';
import { WebSocketServer } from 'ws';
import { ListenerEntity } from '../entities/listener.entity';
import { createHttpServer } from './create-http-server';
import { createHttpsServer } from './create-https-server';

export async function createWebSocketServer(
  listener: ListenerEntity,
): Promise<WebSocketServer> {
  let server: http.Server | https.Server;

  if (listener.options?.ssl) {
    server = await createHttpsServer(listener);
  } else {
    server = await createHttpServer(listener);
  }

  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, request) => {
    // Handle new connections
    console.log(
      `New WebSocket connection from ${request.socket.remoteAddress}`,
    );

    // Store the connection in your C2 management system
    this.c2Service.addConnection(ws, request);

    ws.on('message', (data) => {
      // Handle incoming messages
      this.c2Service.handleMessage(ws, data);
    });

    ws.on('close', () => {
      // Handle connection cleanup
      this.c2Service.removeConnection(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.c2Service.handleConnectionError(ws, error);
    });
  });

  return new Promise((resolve, reject) => {
    server
      .listen(listener.port, () => {
        console.log(
          `WebSocket (${listener.options?.ssl ? 'wss' : 'ws'}) listener started on port ${listener.port}`,
        );
        resolve(wss);
      })
      .on('error', reject);
  });
}
