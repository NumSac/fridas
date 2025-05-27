package main

type Injector struct {
	// Injection methods
	InjectionMethod string
	InjectionPath   string

	// Injection options
	ProcessID   int
	ProcessName string

	// Remote Payload options
	RemotePath string
	RemoteURL  string
	RemotePort int

	DecryptionKey []byte

	// Injection data
	Payload []byte
}

func (i *Injector) Inject() {
	switch i.InjectionMethod {
	case "shellcode":
		injectWithPayload(i.Payload)
	case "dll":
		injectViaDllSideloading()

	default:
		log("Unsupported injection method")
	}
}

func injectWithPayload(payload []byte) {

}

func injectViaDllSideloading() {

}
