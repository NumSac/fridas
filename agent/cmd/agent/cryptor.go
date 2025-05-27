package main

type Cryptor struct {
	DecryptionKey []byte
	EncryptionKey []byte
}

func (c *Cryptor) PayloadDecrypt(data []byte) []byte {
	if debug {
		log("Decrypting data")
	}

	return data
}

func (c *Cryptor) CommsDecrypt(data []byte) []byte {
	if debug {
		log("Decrypting data")
	}

	return data
}
