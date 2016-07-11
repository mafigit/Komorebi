package main

import (
	"komorebi"
	"log"
	"net/http"
)

func main() {

	router := komorebi.NewRouter()

	log.Fatal(http.ListenAndServe(":8080", router))
}
