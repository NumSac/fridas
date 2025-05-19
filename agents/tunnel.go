package main

import (
	"fmt"
	"io"
	"net"
	"net/http"
	"os"

	"github.com/gorilla/websocket"
)

type Tunnel struct {
	Method      string
	LocalPort   int
	RemoteHost  string
	RemotePort  int
	EnableDebug bool
	CertFile    string
	KeyFile     string
}

func (t *Tunnel) Start() {
	t.validate()
	log("Starting", t.Method, "tunnel on port", t.LocalPort)

	switch t.Method {
	case "tcp":
		t.startTCPTunnel()
	case "http":
		t.startHTTPTunnel(false)
	case "https":
		t.startHTTPTunnel(true)
	case "websocket":
		t.startWebsocketTunnel(false)
	case "websockets":
		t.startWebsocketTunnel(true)
	default:
		log("Unsupported tunnel method:", t.Method)
		os.Exit(1)
	}
}

func (t *Tunnel) validate() {
	if t.RemoteHost == "" || t.RemotePort == 0 {
		log("Remote host and port must be specified")
		os.Exit(1)
	}
}

func (t *Tunnel) startTCPTunnel() {
	listener, err := net.Listen("tcp", fmt.Sprintf(":%d", t.LocalPort))
	if err != nil {
		log("TCP listen error:", err)
		os.Exit(1)
	}
	defer listener.Close()

	for {
		conn, err := listener.Accept()
		if err != nil {
			log("TCP accept error:", err)
			continue
		}
		fmt.Println(conn)
	}
}

func (t *Tunnel) startHTTPTunnel(secure bool) {
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		r.URL.Scheme = "http"
		if secure {
			r.URL.Scheme = "https"
		}
		r.URL.Host = fmt.Sprintf("%s:%d", t.RemoteHost, t.RemotePort)
		r.Host = r.URL.Host

		resp, err := http.DefaultTransport.RoundTrip(r)
		if err != nil {
			http.Error(w, err.Error(), http.StatusServiceUnavailable)
			return
		}
		defer resp.Body.Close()

		for k, vv := range resp.Header {
			for _, v := range vv {
				w.Header().Add(k, v)
			}
		}
		w.WriteHeader(resp.StatusCode)
		io.Copy(w, resp.Body)
	})

	server := &http.Server{
		Addr:    fmt.Sprintf(":%d", t.LocalPort),
		Handler: handler,
	}

	var err error
	if secure {
		if t.CertFile == "" || t.KeyFile == "" {
			log("HTTPS requires certificate and key files")
			os.Exit(1)
		}
		err = server.ListenAndServeTLS(t.CertFile, t.KeyFile)
	} else {
		err = server.ListenAndServe()
	}

	if err != nil {
		log("HTTP server error:", err)
	}
}

func (t *Tunnel) startWebsocketTunnel(secure bool) {
	upgrader := websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		wsConn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log("WebSocket upgrade error:", err)
			return
		}
		defer wsConn.Close()

		destAddr := fmt.Sprintf("%s:%d", t.RemoteHost, t.RemotePort)
		remoteConn, err := net.Dial("tcp", destAddr)
		if err != nil {
			log("Remote connection error:", err)
			return
		}
		defer remoteConn.Close()

		t.proxyWebsocket(wsConn, remoteConn)
	})

	var err error
	if secure {
		err = http.ListenAndServeTLS(
			fmt.Sprintf(":%d", t.LocalPort),
			t.CertFile,
			t.KeyFile,
			nil,
		)
	} else {
		err = http.ListenAndServe(fmt.Sprintf(":%d", t.LocalPort), nil)
	}

	if err != nil {
		log("WebSocket server error:", err)
	}
}

func (t *Tunnel) proxyWebsocket(wsConn *websocket.Conn, remoteConn net.Conn) {
	wsToRemote := make(chan []byte, 1024)
	remoteToWs := make(chan []byte, 1024)
	errChan := make(chan error, 2)

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

	go func() {
		buf := make([]byte, 1024)
		for {
			n, err := remoteConn.Read(buf)
			if err != nil {
				errChan <- err
				return
			}
			remoteToWs <- buf[:n]
		}
	}()

	for {
		select {
		case message := <-wsToRemote:
			_, err := remoteConn.Write(message)
			if err != nil {
				log("Write to remote error:", err)
				return
			}
		case message := <-remoteToWs:
			err := wsConn.WriteMessage(websocket.BinaryMessage, message)
			if err != nil {
				log("Write to websocket error:", err)
				return
			}
		case err := <-errChan:
			log("Connection error:", err)
			return
		}
	}
}
