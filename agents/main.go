package main

import (
	"flag"
	"fmt"
	"net"
	"os"
	"time"
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
		log("Error: Both -remote-port and -remote-host are required", "Use -h or --help for usage information")
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

	tunnel := Tunnel{
		Method:      tunnelMethod,
		LocalPort:   bindPort,
		RemoteHost:  remoteHost,
		RemotePort:  remotePort,
		EnableDebug: debug,
	}

	tunnel.Start()
}

func pingRemoteHostOrExit() {
	timeout := 5 * time.Second
	address := net.JoinHostPort(remoteHost, fmt.Sprintf("%d", remotePort))

	conn, err := net.DialTimeout("tcp", address, timeout)
	if err != nil {
		log("Connection check failed:", err)
		os.Exit(1)
	}
	conn.Close()
}

func printHelp() {
	fmt.Println("Usage: tunnel-proxy [options]")
	fmt.Println("\nOptions:")
	flag.PrintDefaults()
}
