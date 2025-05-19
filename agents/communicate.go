package main

import (
	"net"

	"github.com/gorilla/websocket"
)

func communicate(remoteConn net.Conn, wsConn *websocket.Conn) {
	wsToRemote := make(chan []byte, 1024)
	errChan := make(chan error, 2)

	defer wsConn.Close()
	go func() {
		for {
			_, message, err := wsConn.ReadMessage()
			if err != nil {
				errChan <- err
				return
			}
			wsToRemote <- message
		}
	}()

	// Switch to remote connection
	switch remoteConn.(type) {
	case *net.TCPConn:
		remoteConn.(*net.TCPConn).SetNoDelay(true)
	case *net.UnixConn:
		remoteConn.(*net.UnixConn).SetNoDelay(true)
	}

}
