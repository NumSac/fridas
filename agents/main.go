package main

import (
	"flag"
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/websocket"
)

var (
	remotePort   int
	remoteHost   string
	tunnelMethod string
	bindPort     int
	help         bool
	debug        bool
)

var (
	websocketUpgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
)

func main() {
	flag.IntVar(&remotePort, "remote-port", 0, "Remote port to connect to (required)")
	flag.StringVar(&remoteHost, "remote-host", "", "Remote host address (required)")
	flag.StringVar(&tunnelMethod, "tunnel-method", "tcp", "Tunneling method (tcp, http, websocket)")
	flag.IntVar(&bindPort, "bind-port", 8080, "Local bind port")
	flag.BoolVar(&help, "h", false, "Display help")
	flag.BoolVar(&help, "help", false, "Display help")
	flag.BoolVar(&debug, "debug", false, "Enable debug mode")
	flag.Parse()

	if help {
		printHelp()
		os.Exit(0)
	}

	if remotePort == 0 || remoteHost == "" {
		log("Error: Both -remote-port and -remote-host are required")
		log("Use -h or --help for usage information")
		os.Exit(1)
	}

	if debug {
		log("Debug Mode Enabled")
		log(fmt.Sprintf("Remote Port: %d", remotePort))
		log(fmt.Sprintf("Remote Host: %s", remoteHost))
		log(fmt.Sprintf("Tunnel Method: %s", tunnelMethod))
		log(fmt.Sprintf("Bind Port: %d", bindPort))
	}

	pingRemoteHostOrExit()
	startTunnel()
}

func startTunnel() {
	switch tunnelMethod {
	case "tcp":
		startTCPTunnel()
	case "http":
		startHTTPTunnel()
	case "websocket":
		startWebsocketTunnel()
	default:
		log("Unsupported tunnel method: " + tunnelMethod)
		os.Exit(1)
	}
}

func startTCPTunnel() {
	listener, err := net.Listen("tcp", fmt.Sprintf(":%d", bindPort))
	if err != nil {
		log("TCP listener error:", err)
		os.Exit(1)
	}
	defer listener.Close()

	log(fmt.Sprintf("TCP tunnel listening on :%d", bindPort))

	for {
		conn, err := listener.Accept()
		if err != nil {
			log("TCP accept error:", err)
			continue
		}

		go handleTCPConnection(conn)
	}
}

func handleTCPConnection(src net.Conn) {
	defer src.Close()

	dst, err := net.Dial("tcp", fmt.Sprintf("%s:%d", remoteHost, remotePort))
	if err != nil {
		log("Remote connection error:", err)
		return
	}
	defer dst.Close()

	go func() {
		io.Copy(dst, src)
	}()
	io.Copy(src, dst)
}

func startHTTPTunnel() {
	server := &http.Server{
		Addr: fmt.Sprintf(":%d", bindPort),
		Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if debug {
				log(fmt.Sprintf("Proxying request to %s", r.URL))
			}

			r.URL.Scheme = "http"
			r.URL.Host = fmt.Sprintf("%s:%d", remoteHost, remotePort)

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
		}),
	}

	log(fmt.Sprintf("HTTP tunnel listening on :%d", bindPort))
	log("Server error:", server.ListenAndServe())
}

func startWebsocketTunnel() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		wsConn, err := websocketUpgrader.Upgrade(w, r, nil)
		if err != nil {
			log("WebSocket upgrade error:", err)
			return
		}
		defer wsConn.Close()

		remoteConn, err := net.Dial("tcp", fmt.Sprintf("%s:%d", remoteHost, remotePort))
		if err != nil {
			log("Remote connection error:", err)
			return
		}
		defer remoteConn.Close()

		done := make(chan struct{})

		go func() {
			defer close(done)
			for {
				_, message, err := wsConn.ReadMessage()
				if err != nil {
					return
				}
				remoteConn.Write(message)
			}
		}()

		go func() {
			defer close(done)
			buf := make([]byte, 1024)
			for {
				n, err := remoteConn.Read(buf)
				if err != nil {
					return
				}
				wsConn.WriteMessage(websocket.BinaryMessage, buf[:n])
			}
		}()

		<-done
	})

	log(fmt.Sprintf("WebSocket tunnel listening on :%d", bindPort))
	log("Server error:", http.ListenAndServe(fmt.Sprintf(":%d", bindPort), nil))
}

func pingRemoteHostOrExit() {
	client := http.Client{Timeout: 5 * time.Second}
	resp, err := client.Get(fmt.Sprintf("http://%s:%d/ping", remoteHost, remotePort))
	if err != nil {
		log("Ping error:", err)
		os.Exit(1)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log("Ping failed with status:", resp.StatusCode)
		os.Exit(1)
	}
}

func log(v ...interface{}) {
	if debug {
		fmt.Println(v...)
	}
}

func printHelp() {
	fmt.Println("Usage: tunnel-proxy [options]")
	fmt.Println("\nOptions:")
	flag.PrintDefaults()
}
