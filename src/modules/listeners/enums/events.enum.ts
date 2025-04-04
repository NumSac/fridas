export enum HttpEvent {
  REQUEST = 'http.request',
  ERROR = 'http.error',
  LISTENING = 'http.listening',
  CONNECTION = 'http.connection',
  CONNECTION_CLOSED = 'http.connectionClosed',
  REQUEST_COMPLETED = 'http.requestCompleted',
  CLIENT_ERROR = 'http.clientError',
  REQUEST_START = 'http.requestStart',
  REQUEST_END = 'http.requestEnd',
}

export enum HttpsEvent {
  REQUEST = 'https.request',
  ERROR = 'https.error',
  LISTENING = 'https.listening',
  CONNECTION = 'https.connection',
  CONNECTION_CLOSED = 'https.connectionClosed',
  REQUEST_COMPLETED = 'https.requestCompleted',
  CLIENT_ERROR = 'https.clientError',
  REQUEST_START = 'https.requestStart',
  REQUEST_END = 'https.requestEnd',
}

export enum TcpEvent {
  CONNECTION = 'tcp.connection',
  DATA_RECEIVED = 'tcp.dataReceived',
  ERROR = 'tcp.error',
  CONNECTION_CLOSED = 'tcp.connectionClosed',
  LISTENING = 'tcp.listening',
  DATA_SENT = 'tcp.dataSent',
  TIMEOUT = 'tcp.timeout',
}

export enum WsEvent {
  CONNECTION = 'ws.connection',
  MESSAGE = 'ws.message',
  ERROR = 'ws.error',
  CLOSE = 'ws.close',
  CONNECTION_CLOSED = 'ws.connectionClosed',
  MESSAGE_SENT = 'ws.messageSent',
  OPEN = 'ws.open',
  UPGRADE = 'ws.upgrade',
}

export enum ProtocolEvent {
  // Aggregate all protocol events if needed
  HTTP = 'http',
  HTTPS = 'https',
  TCP = 'tcp',
  WS = 'ws',
}
