// src/listeners/interfaces/listener-options.interface.ts
export interface ListenerOptions {
  ssl?: {
    keyPath: string;
    certPath: string;
    caPath?: string;
    passphrase?: string;
    rejectUnauthorized?: boolean;
  };
  authenticationRequired?: boolean;
  maxConnections?: number;
  whitelistIps?: string[];
}