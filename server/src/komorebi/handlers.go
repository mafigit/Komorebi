package komorebi

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

type Response struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

func Index(w http.ResponseWriter, r *http.Request) {
	data, _ := ioutil.ReadFile(getPublicDir() + "/landing.html")
	site := string(data)
	fmt.Fprintln(w, site)
}

func BoardsGet(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(GetAllBoards())
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

func GetStories(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	board_name := vars["board_name"]
	stories := GetStoriesByBoradName(board_name)

	if len(stories) <= 0 {
		OwnNotFound(w, r)
		return
	}

	json.NewEncoder(w).Encode(stories)
}

func BoardCreate(w http.ResponseWriter, r *http.Request) {
	var board Board

	if err := json.NewDecoder(r.Body).Decode(&board); err != nil {
		w.WriteHeader(400)
		return
	}

	board = NewBoard(board.Name)
	success, msg := board.Validate()
	response := Response{
		Success: success,
		Message: msg,
	}
	if response.Success == false {
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(response)
		return
	}

	if board.Save() {
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(response)
	} else {
		w.WriteHeader(400)
		return
	}
}

func BoardUpdate(w http.ResponseWriter, r *http.Request) {
	var update_board Board
	vars := mux.Vars(r)
	board_id := vars["board_id"]
	response := Response{
		Success: true,
		Message: "",
	}

	if err := json.NewDecoder(r.Body).Decode(&update_board); err != nil {
		w.WriteHeader(400)
		return
	}

	id, _ := strconv.Atoi(board_id)

	if id != update_board.Id {
		w.WriteHeader(400)
		return
	}

	old_board := GetBoardColumnViewById(id)
	if old_board.Id == 0 && old_board.CreatedAt == 0 {
		response.Success = false
		response.Message = "Board does not exist"

		w.WriteHeader(200)
		json.NewEncoder(w).Encode(response)
		return
	}

	if update_board.Save() {
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(response)
	} else {
		w.WriteHeader(400)
		return
	}
}

func BoardDelete(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	board_id := vars["board_id"]
	response := Response{
		Success: true,
		Message: "",
	}

	id, _ := strconv.Atoi(board_id)
	board := GetBoardById(id)

	if board == nil {
		response.Success = false
		response.Message = "Board does not exist"

		w.WriteHeader(200)
		json.NewEncoder(w).Encode(response)
		return
	}

	if board.Destroy() {
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(response)
	} else {
		w.WriteHeader(400)
		return
	}
}

func ColumnCreate(w http.ResponseWriter, r *http.Request) {
	var column Column

	if err := json.NewDecoder(r.Body).Decode(&column); err != nil {
		w.WriteHeader(400)
		return
	}

	column = NewColumn(column.Name, column.Position, column.BoardId)
	success, msg := column.Validate()
	response := Response{
		Success: success,
		Message: msg,
	}
	if response.Success == false {
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(response)
		return
	}

	if column.Save() {
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(response)
	} else {
		w.WriteHeader(400)
		return
	}
}

func ColumnUpdate(w http.ResponseWriter, r *http.Request) {
	var update_column Column
	vars := mux.Vars(r)
	column_id := vars["column_id"]
	response := Response{
		Success: true,
		Message: "",
	}

	if err := json.NewDecoder(r.Body).Decode(&update_column); err != nil {
		w.WriteHeader(400)
		return
	}

	id, _ := strconv.Atoi(column_id)

	if id != update_column.Id {
		w.WriteHeader(400)
		return
	}

	old_column := GetColumnById(id)

	if old_column.Id == 0 && old_column.CreatedAt == 0 {
		response.Success = false
		response.Message = "Column does not exist"

		w.WriteHeader(200)
		json.NewEncoder(w).Encode(response)
		return
	}

	update_column.BoardId = old_column.BoardId
	if update_column.Save() {
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(response)
	} else {
		w.WriteHeader(400)
		return
	}
}

func ColumnDelete(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	column_id := vars["column_id"]
	response := Response{
		Success: true,
		Message: "",
	}

	id, _ := strconv.Atoi(column_id)
	column := GetColumnById(id)

	if column.Id == 0 && column.CreatedAt == 0 {
		response.Success = false
		response.Message = "Column does not exist"
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(response)
		return
	}
	if column.Destroy() {
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(response)
	} else {
		w.WriteHeader(400)
		return
	}
}

func StoryCreate(w http.ResponseWriter, r *http.Request) {
	var story Story

	if err := json.NewDecoder(r.Body).Decode(&story); err != nil {
		w.WriteHeader(400)
		return
	}
	story = NewStory(story.Name, story.Desc, story.Requirements, story.Points,
		story.ColumnId)
	success, msg := story.Validate()
	response := Response{
		Success: success,
		Message: msg,
	}
	if response.Success == false {
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(response)
		return
	}

	if story.Save() {
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(response)
	} else {
		w.WriteHeader(400)
		return
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
	data, _ := ioutil.ReadFile(getPublicDir() + "/index.html")
	return string(data)
}

func getPublicDir() string {
	if len(os.Args) >= 2 {
		return os.Args[1]
	} else {
		dir, err := filepath.Abs(filepath.Dir(os.Args[0]))
		if err != nil {
			return ""
		} else {
			return dir
		}
	}
}
