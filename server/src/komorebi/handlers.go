package komorebi

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"reflect"
	"strconv"
	"strings"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Connection struct {
	Ws          *websocket.Conn
	BoardStruct *BoardWs
}

var connections = make(map[string][]*Connection, 0)

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
	var boards Boards
	GetAll(&boards)
	json.NewEncoder(w).Encode(boards)
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

func StoriesGetByColumn(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	column_id := vars["column_id"]
	id, _ := strconv.Atoi(column_id)
	stories := GetStoriesByColumnId(id)
	json.NewEncoder(w).Encode(stories)
}

func BoardDelete(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	board_id := vars["board_id"]
	response := Response{
		Success: true,
		Message: "",
	}

	id, _ := strconv.Atoi(board_id)
	var board Board
	GetById(&board, id)

	if board.Id == 0 && board.CreatedAt == 0 {
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

func UserCreate(w http.ResponseWriter, r *http.Request) {
	var user User

	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		w.WriteHeader(400)
		return
	}

	user = NewUser(user.Name, user.ImagePath)
	success, msg := user.Validate()
	response := Response{
		Success: success,
		Message: msg,
	}
	if response.Success == false {
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(response)
		return
	}

	if user.Save() {
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

	var old_column Column
	GetById(&old_column, id)

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
	var column Column
	GetById(&column, id)

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

func StoryUpdate(w http.ResponseWriter, r *http.Request) {
	var update_story Story
	vars := mux.Vars(r)
	story_id := vars["story_id"]
	response := Response{
		Success: true,
		Message: "",
	}

	if err := json.NewDecoder(r.Body).Decode(&update_story); err != nil {
		w.WriteHeader(400)
		return
	}

	id, _ := strconv.Atoi(story_id)

	if id != update_story.Id {
		w.WriteHeader(400)
		return
	}

	old_story := GetStoryById(id)

	if old_story.Id == 0 && old_story.CreatedAt == 0 {
		response.Success = false
		response.Message = "Story does not exist"

		w.WriteHeader(200)
		json.NewEncoder(w).Encode(response)
		return
	}

	if update_story.Save() {
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(response)
	} else {
		w.WriteHeader(400)
		return
	}
}

func delete_ws_from_connections(ws *websocket.Conn, board_name string) {
	for i := range connections[board_name] {
		if connections[board_name][i].Ws == ws {
			connections[board_name] =
				connections[board_name][:i+copy(connections[board_name][i:],
					connections[board_name][i+1:])]
			break
		}
	}

}

func HandleWs(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, w.Header())
	vars := mux.Vars(r)
	board_name := vars["board_name"]

	if err != nil {
		fmt.Println("could not open websocket connection: ", err)
		return
	}

	board_struct := GetBoardWsByName(board_name)
	con := &Connection{
		Ws:          ws,
		BoardStruct: &board_struct,
	}

	defer func() {
		fmt.Println("connection closing ", board_name)
		con.Ws.Close()
		delete_ws_from_connections(con.Ws, board_name)
	}()

	connections[board_name] = append(connections[board_name], con)
	fmt.Println("connections: ", connections)
	err = ws.WriteMessage(websocket.TextMessage, []byte("Connection established"))
	if err != nil {
		fmt.Println("error on write:", err)
	}
	ws.ReadMessage()
}

func UpdateWebsockets(board_name string, msg string) {
	fmt.Println("Update Websockets for", board_name)
	current_struct := GetBoardWsByName(board_name)

	for i := range connections[board_name] {

		if !reflect.DeepEqual(*connections[board_name][i].BoardStruct, current_struct) {
			err := connections[board_name][i].Ws.WriteMessage(websocket.TextMessage, []byte(msg))
			connections[board_name][i].BoardStruct = &current_struct
			if err != nil {
				fmt.Println("err", err)
			}
		}

	}
}

func TaskCreate(w http.ResponseWriter, r *http.Request) {
	var task Task

	if err := json.NewDecoder(r.Body).Decode(&task); err != nil {
		w.WriteHeader(400)
		return
	}

	task = NewTask(task.Name, task.Desc, task.StoryId, task.ColumnId)
	success, msg := task.Validate()
	response := Response{
		Success: success,
		Message: msg,
	}
	if response.Success == false {
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(response)
		return
	}

	if task.Save() {
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
