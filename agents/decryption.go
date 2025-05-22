package main

type Decryptor struct {
	DecryptionKey []byte
}

func (d *Decryptor) PayloadDecrypt(data []byte) []byte {
	if debug {
		log("Decrypting data")
	}

	return data
}

func (d *Decryptor) CommsDecrypt(data []byte) []byte {
	if debug {
		log("Decrypting data")
	}

	return data
}
