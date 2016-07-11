package main

import (
    "log"
    "net/http"
    "komorebi"
)


func main() {

  router := komorebi.NewRouter()

  log.Fatal(http.ListenAndServe(":8080", router))
}

