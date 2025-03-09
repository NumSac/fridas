import * as https from 'node:https';
import { ListenerEntity } from '../entities/listener.entity';
import * as fs from 'node:fs';

export async function createHttpsServer(
  listener: ListenerEntity,
): Promise<https.Server> {
  if (!listener.options?.ssl) {
    throw new Error('SSL configuration required for HTTPS listener');
  }

  // Read SSL files
  const [key, cert] = await Promise.all([
    fs.promises.readFile(listener.options.ssl.keyPath, 'utf8'),
    fs.promises.readFile(listener.options.ssl.certPath, 'utf8'),
  ]);

  // Optional CA chain
  const ca = listener.options.ssl.caPath
    ? await fs.promises.readFile(listener.options.ssl.caPath, 'utf8')
    : null;

  const httpsOptions: https.ServerOptions = {
    key,
    cert,
    ca: ca ? [ca] : undefined, // CA should be an array if provided
    passphrase: listener.options.ssl.passphrase,
    rejectUnauthorized: listener.options.ssl.rejectUnauthorized ?? true,
  };

  return new Promise((resolve, reject) => {
    const server = https.createServer(httpsOptions, (req, res) => {
      this.handleHttpRequest(req, res, listener);
    });

    server
      .listen(listener.port, () => {
        console.log(`HTTPS listener started on port ${listener.port}`);
        resolve(server);
      })
      .on('error', reject);
  });
}
