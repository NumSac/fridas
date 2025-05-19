package main

import "fmt"

func log(msg string, err ...interface{}) {
	if debug {
		fmt.Println(msg, err)
	}
}
