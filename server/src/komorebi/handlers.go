package komorebi

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
	//"github.com/gorilla/mux"
)

func Index(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Welcome!")
}

func BoardShow(w http.ResponseWriter, r *http.Request) {
	//vars := mux.Vars(r)
	//board_name := vars["board_name"]
	content_type := r.Header.Get("Accept")

	//board := get_board(board_name)
	board := Board{
		Name: "gz",
		Id:   1,
		Columns: []Column{
			Column{
				Id:       1,
				Name:     "WIP",
				Position: 0,
			},
			Column{
				Id:       2,
				Name:     "TEST",
				Position: 1,
			},
		},
	}

	if strings.Contains(content_type, "json") {
		json.NewEncoder(w).Encode(board)
	} else {
		data, _ := ioutil.ReadFile("../index.html")
		fmt.Fprintln(w, string(data))
	}
}
