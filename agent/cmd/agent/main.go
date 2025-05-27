package main

import (
	"flag"
	"fmt"
	"os"
)

var (
	remotePort   int
	remoteHost   string
	tunnelMethod string
	bindPort     int
	help         bool
	debug        bool
)

func main() {
	flag.IntVar(&remotePort, "remote-port", 0, "Remote port to connect to (required)")
	flag.StringVar(&remoteHost, "remote-host", "", "Remote host address (required)")
	flag.StringVar(&tunnelMethod, "tunnel-method", "tcp", "Tunneling method (tcp, http, https, websocket, websockets)")
	flag.IntVar(&bindPort, "bind-port", 8080, "Local bind port")
	flag.BoolVar(&help, "h", false, "Display help")
	flag.BoolVar(&help, "help", false, "Display help")
	flag.BoolVar(&debug, "debug", false, "Enable debug mode")
	flag.Parse()

	if help {
		printHelp()
		os.Exit(0)
	}

	tunnel, err := NewTunnel(tunnelMethod, remoteHost, remotePort, debug)
	if err != nil {
		log("Error creating tunnel:", err)
		os.Exit(1)
	}

	tunnel.LocalPort = bindPort

	if debug {
		log("Debug Mode Enabled")
		log(fmt.Sprintf("Remote Port: %d", tunnel.RemotePort))
		log(fmt.Sprintf("Remote Host: %s", tunnel.RemoteHost))
		log(fmt.Sprintf("Tunnel Method: %s", tunnel.Method))
		log(fmt.Sprintf("Bind Port: %d", tunnel.LocalPort))
	}

	if err := tunnel.Start(); err != nil {
		log("Tunnel failed:", err)
		os.Exit(1)
	}
}

func printHelp() {
	fmt.Println("Usage: tunnel-proxy [options]")
	fmt.Println("\nOptions:")
	flag.PrintDefaults()
}
