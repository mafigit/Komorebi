package komorebi

import (
    "fmt"
    "net/http"

    "github.com/gorilla/mux"
)

func Index(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintln(w, "Welcome!")
}

func BoardShow(w http.ResponseWriter, r *http.Request) {
  vars := mux.Vars(r)
  board_name := vars["board_name"]
  fmt.Fprintln(w, "Board show:", board_name)
}
