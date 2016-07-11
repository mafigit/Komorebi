package komorebi

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strings"
	//"github.com/gorilla/mux"
)

func Index(w http.ResponseWriter, r *http.Request) {
	//hostname := r.URL.Query().Get("hostname")
	list := "<html><head></head><body>"

	//TODO getAllBoards() implementation
	//for _, board := range getAllBoards() {
	//	list += "<a href=\"" + hostname + "/" + board.Name + "\">"
	//	list += board.Name
	//	list += "</a><br>"
	//}
	list += "</body></html>"
	fmt.Fprintln(w, list)
}

func BoardShow(w http.ResponseWriter, r *http.Request) {
	//vars := mux.Vars(r)
	//board_name := vars["board_name"]
	content_type := r.Header.Get("Accept")

	//TODO get_board() implementation
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
		data := getIndex()
		fmt.Fprintln(w, data)
	}
}

func OwnNotFound(w http.ResponseWriter, r *http.Request) {
	file := getPublicDir() + r.URL.Path

	_, err := os.Stat(file)
	if err == nil {
		http.ServeFile(w, r, file)
	} else {
		http.NotFound(w, r)
	}
}

func getIndex() string {
	data, _ := ioutil.ReadFile(getPublicDir() + "index.html")
	return string(data)
}

func getPublicDir() string {
	if len(os.Args) >= 2 {
		return os.Args[1]
	} else {
		return ""
	}
}
