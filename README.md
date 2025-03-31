# Frida - Modern C2 Framework

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

A sophisticated Command & Control framework built with NestJS, supporting multiple communication protocols and designed
for penetration testing/red team operations.

## Why a C2 in Node.js/Nest.js?

Answer is simple, there is no reason not to do it in Node.js. I personally enjoy Nest a lot and since mostly IO
operations will occur Nodes architecture shouldn't become a problem.
The agents are currently in development and will either be
written in C or Go.

Any improvement ideas or contributions are welcome!

## Features

- **Multi-protocol Listeners**
    - HTTP/HTTPS with SSL termination
    - Raw TCP sockets
    - WebSocket support
- **Payload Management**
    - Dynamic payload generation
    - Multiple architecture support
- **Agent Communication**
    - Encrypted command channels
    - Session keep-alive
    - Asynchronous tasking
- **Operational Security**
    - JWT authentication
    - IP whitelisting
    - Request rate limiting
- **Dashboard**
    - Real-time agent monitoring
    - Interactive shell access
    - Campaign analytics

## Quick Start

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```
