import { ListenerEntity } from '../entities/listener.entity';
import * as http from 'http';
import { RequestListener } from 'node:http';

export async function createHttpServer(
  listener: ListenerEntity,
  requestHandler?: RequestListener,
): Promise<http.Server> {
  return new Promise((resolve, reject) => {
    const server = http.createServer(requestHandler);

    server
      .listen(listener.port, () => {
        console.log(`HTTP listener started on port ${listener.port}`); // Fix HTTPS -> HTTP
        resolve(server);
      })
      .on('error', reject);
  });
}
