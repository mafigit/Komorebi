package komorebi

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
)

func Index(w http.ResponseWriter, r *http.Request) {
	hostname := r.URL.Query().Get("hostname")
	list := "<html><head></head><body>"

	for _, board := range GetAllBoards() {
		list += "<a href=\"" + hostname + "/" + board.Name + "\">"
		list += board.Name
		list += "</a><br>"
	}
	list += "</body></html>"
	fmt.Fprintln(w, list)
}

func BoardShow(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	board_name := vars["board_name"]
	content_type := r.Header.Get("Accept")
	board_column := GetBoardColumnViewByName(board_name)

	if board_column.Id == 0 && board_column.CreatedAt == 0 {
		OwnNotFound(w, r)
		return
	}

	if strings.Contains(content_type, "json") {
		json.NewEncoder(w).Encode(board_column)
	} else {
		data := getIndex()
		fmt.Fprintln(w, data)
	}
}

func BoardCreate(w http.ResponseWriter, r *http.Request) {
	var board Board
	body, err := ioutil.ReadAll(io.LimitReader(r.Body, 2^20))
	check_err(err, "Can't read http body")

	err = r.Body.Close()
	check_err(err, "Error on Body.Close()")

	if err := json.Unmarshal(body, &board); err != nil {
		w.WriteHeader(400)
		return
	}

	board = NewBoard(board.Name)
	if !board.Validate() {
		w.WriteHeader(400)
		return
	}

	if board.Save() {
		w.WriteHeader(http.StatusCreated)
	} else {
		w.WriteHeader(400)
		return
	}
}

func BoardDelete(w http.ResponseWriter, r *http.Request) {
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
	data, _ := ioutil.ReadFile(getPublicDir() + "/index.html")
	return string(data)
}

func getPublicDir() string {
	if len(os.Args) >= 2 {
		return os.Args[1]
	} else {
		return ""
	}
}

func check_err(err error, msg string) {
	if err != nil {
		log.Fatalln(msg, err)
	}
}
