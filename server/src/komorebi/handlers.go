package komorebi

import (
	"encoding/json"
	"fmt"
	"github.com/go-resty/resty"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"io/ioutil"
	"log"
	"net/http"
	"os"
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
	Ws *websocket.Conn
}

var connections = make(map[string][]*Connection, 0)

type Response struct {
	Success  bool                `json:"success"`
	Messages map[string][]string `json:"messages"`
}

type WsResponse struct {
	Message string `json:"message"`
}

type UserIds struct {
	UserIds []int `json:"user_ids"`
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
	board_column := GetBoardNestedByName(board_name)

	if board_column.Id == 0 {
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
	stories := GetStoriesByBoardName(board_name)
	json.NewEncoder(w).Encode(stories)
}

func modelCreate(m Model, w http.ResponseWriter, r *http.Request) {
	success, msg := m.Validate()

	response := Response{
		Success:  success,
		Messages: msg,
	}
	if response.Success == false {
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(response)
		return
	}

	if m.Save() {
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(response)
	} else {
		w.WriteHeader(400)
		return
	}
}

func modelUpdate(old_m Model, update_m Model, var_id int, w http.ResponseWriter, r *http.Request) {
	response := Response{
		Success:  true,
		Messages: make(map[string][]string),
	}

	if var_id != update_m.GetId() {
		w.WriteHeader(400)
		return
	}

	if old_m.GetId() == 0 {
		response.Success = false
		response.Messages["name"] = append(response.Messages["name"],
			"Model does not exist")

		w.WriteHeader(200)
		json.NewEncoder(w).Encode(response)
		return
	}

	success, msg := update_m.Validate()

	if success == false {
		response.Success = success
		response.Messages = msg

		w.WriteHeader(200)
		json.NewEncoder(w).Encode(response)
	}

	if update_m.Save() {
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(response)
	} else {
		w.WriteHeader(400)
		return
	}
}

func BoardCreate(w http.ResponseWriter, r *http.Request) {
	var board Board

	if err := json.NewDecoder(r.Body).Decode(&board); err != nil {
		w.WriteHeader(400)
		return
	}

	board = NewBoard(board.Name)
	modelCreate(board, w, r)
}

func BoardUpdate(w http.ResponseWriter, r *http.Request) {
	var update_board Board
	vars := mux.Vars(r)
	board_id := vars["board_id"]

	if err := json.NewDecoder(r.Body).Decode(&update_board); err != nil {
		w.WriteHeader(400)
		return
	}

	id, _ := strconv.Atoi(board_id)
	var old_board Board
	GetById(&old_board, id)
	modelUpdate(old_board, update_board, id, w, r)
}

func TasksGetByColumn(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	column_id := vars["column_id"]
	id, _ := strconv.Atoi(column_id)
	tasks := GetTasksByColumnId(id)
	json.NewEncoder(w).Encode(tasks)
}

func BoardDelete(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	board_id := vars["board_id"]

	id, _ := strconv.Atoi(board_id)
	var board Board
	GetById(&board, id)
	modelDelete(board, w, r)
}

func ColumnGet(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	column_id := vars["column_id"]

	id, _ := strconv.Atoi(column_id)
	var column Column
	GetById(&column, id)

	if column.Id == 0 {
		w.WriteHeader(400)
		return
	}
	nested_column := GetNestedColumnByColumnId(column.Id)
	json.NewEncoder(w).Encode(nested_column)
}

func ColumnCreate(w http.ResponseWriter, r *http.Request) {
	var column Column

	if err := json.NewDecoder(r.Body).Decode(&column); err != nil {
		w.WriteHeader(400)
		return
	}

	column = NewColumn(column.Name, column.Position, column.BoardId)
	modelCreate(column, w, r)
}

func UsersGet(w http.ResponseWriter, r *http.Request) {
	var users Users
	GetAll(&users)
	json.NewEncoder(w).Encode(users)
}

func UserCreate(w http.ResponseWriter, r *http.Request) {
	var user User

	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		w.WriteHeader(400)
		return
	}

	user = NewUser(user.Name, user.ImagePath)
	modelCreate(user, w, r)
}

func UserUpdate(w http.ResponseWriter, r *http.Request) {
	var update_user User
	vars := mux.Vars(r)
	user_id := vars["user_id"]

	if err := json.NewDecoder(r.Body).Decode(&update_user); err != nil {
		w.WriteHeader(400)
		return
	}

	id, _ := strconv.Atoi(user_id)
	var old_user User
	GetById(&old_user, id)
	modelUpdate(old_user, update_user, id, w, r)
}

func UserDelete(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	user_id := vars["user_id"]

	id, _ := strconv.Atoi(user_id)
	var user User
	GetById(&user, id)
	modelDelete(user, w, r)
}

func ColumnUpdate(w http.ResponseWriter, r *http.Request) {
	var update_column Column
	vars := mux.Vars(r)
	column_id := vars["column_id"]

	if err := json.NewDecoder(r.Body).Decode(&update_column); err != nil {
		w.WriteHeader(400)
		return
	}

	id, _ := strconv.Atoi(column_id)
	var old_column Column
	GetById(&old_column, id)
	update_column.BoardId = old_column.BoardId
	modelUpdate(old_column, update_column, id, w, r)
}

func ColumnDelete(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	column_id := vars["column_id"]

	id, _ := strconv.Atoi(column_id)
	var column Column
	GetById(&column, id)

	modelDelete(column, w, r)
}

func modelDelete(m Model, w http.ResponseWriter, r *http.Request) {
	response := Response{
		Success:  true,
		Messages: make(map[string][]string),
	}

	if m.GetId() == 0 {
		response.Success = false
		response.Messages["name"] = append(response.Messages["name"],
			"Model does not exist")
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(response)
		return
	}
	if m.Destroy() {
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(response)
	} else {
		w.WriteHeader(400)
		return
	}
}

func StoryGet(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	story_id := vars["story_id"]

	id, _ := strconv.Atoi(story_id)
	var story Story
	GetById(&story, id)

	if story.Id == 0 {
		w.WriteHeader(400)
		return
	}

	json.NewEncoder(w).Encode(story)
}

func StoryCreate(w http.ResponseWriter, r *http.Request) {
	var story Story

	if err := json.NewDecoder(r.Body).Decode(&story); err != nil {
		w.WriteHeader(400)
		return
	}
	story = NewStory(story.Name, story.Desc, story.Requirements, story.Points,
		story.Priority, story.BoardId)
	modelCreate(story, w, r)
}

func StoryUpdate(w http.ResponseWriter, r *http.Request) {
	var update_story Story
	vars := mux.Vars(r)
	story_id := vars["story_id"]

	if err := json.NewDecoder(r.Body).Decode(&update_story); err != nil {
		w.WriteHeader(400)
		return
	}

	id, _ := strconv.Atoi(story_id)
	old_story := GetStoryById(id)
	modelUpdate(old_story, update_story, id, w, r)
}

func StoryDelete(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	story_id := vars["story_id"]

	id, _ := strconv.Atoi(story_id)
	var story Story
	GetById(&story, id)
	modelDelete(story, w, r)
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

	board := GetBoardByName(board_name)

	if board.Name == "" {
		return
	}

	con := &Connection{
		Ws: ws,
	}

	defer func() {
		fmt.Println("connection closing ", board_name)
		con.Ws.Close()
		delete_ws_from_connections(con.Ws, board_name)
	}()

	connections[board_name] = append(connections[board_name], con)
	log.Println("connections: ", connections)
	err = ws.WriteMessage(websocket.TextMessage, []byte("Connection established"))
	if err != nil {
		fmt.Println("error on write:", err)
	}
	ws.ReadMessage()
}

func UpdateWebsockets(board_name string, msg string) {
	log.Println("Update Websockets for board", board_name)

	resp := &WsResponse{
		Message: msg,
	}
	json_resp, _ := json.Marshal(resp)

	for i := range connections[board_name] {
		err := connections[board_name][i].Ws.WriteMessage(
			websocket.TextMessage, []byte(json_resp))
		if err != nil {
			fmt.Println("err", err)
		}
	}
}

func TaskGet(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	task_id := vars["task_id"]
	id, _ := strconv.Atoi(task_id)

	var task Task
	GetById(&task, id)
	json.NewEncoder(w).Encode(task)
}

func TasksGet(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	story_id := vars["story_id"]
	id, _ := strconv.Atoi(story_id)

	tasks := GetTasksByStoryId(id)
	json.NewEncoder(w).Encode(tasks)
}

func TaskCreate(w http.ResponseWriter, r *http.Request) {
	var task Task

	if err := json.NewDecoder(r.Body).Decode(&task); err != nil {
		w.WriteHeader(400)
		return
	}

	task = NewTask(task.Name, task.Desc, task.StoryId, task.ColumnId,
		task.Priority)
	modelCreate(task, w, r)
}

func TaskUpdate(w http.ResponseWriter, r *http.Request) {
	var update_task Task
	vars := mux.Vars(r)
	task_id := vars["task_id"]

	if err := json.NewDecoder(r.Body).Decode(&update_task); err != nil {
		w.WriteHeader(400)
		return
	}

	id, _ := strconv.Atoi(task_id)
	var old_task Task
	GetById(&old_task, id)
	modelUpdate(old_task, update_task, id, w, r)
}

func TaskDelete(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	task_id := vars["task_id"]

	id, _ := strconv.Atoi(task_id)
	var task Task
	GetById(&task, id)
	modelDelete(task, w, r)
}

func AssignUsersToBoard(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	board_id, _ := strconv.Atoi(vars["board_id"])
	var users UserIds

	response := Response{
		Success:  true,
		Messages: make(map[string][]string),
	}

	var board Board
	GetById(&board, board_id)

	if board.Id <= 0 {
		response.Success = false
		response.Messages["board_id"] = append(response.Messages["board_id"],
			"BoardId does not exist.")
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(response)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&users); err != nil {
		w.WriteHeader(400)
		return
	}

	resp := AddUsersToBoard(board, users)

	if resp == false {
		response.Success = false
		response.Messages["user_ids"] = append(response.Messages["user_ids"],
			"UserIds not valid.")
	}

	w.WriteHeader(200)
	json.NewEncoder(w).Encode(response)
}

func GetUsersFromBoard(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	board_id, _ := strconv.Atoi(vars["board_id"])

	response := Response{
		Success:  true,
		Messages: make(map[string][]string),
	}

	var board Board
	GetById(&board, board_id)

	if board.Id <= 0 {
		w.WriteHeader(200)
		response.Success = false
		response.Messages["board_id"] = append(response.Messages["board_id"],
			"BoardId does not exist.")
		json.NewEncoder(w).Encode(response)
		return
	}

	users := GetUsersByBoardId(board_id)
	json.NewEncoder(w).Encode(users)
}

func GetFeatureAndCreateStory(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	issue := vars["issue"]
	board_id, _ := strconv.Atoi(vars["board_id"])

	ret, story := getStoryFromIssue(issue, board_id)

	if ret == true {
		modelCreate(story, w, r)
		return
	} else {
		w.WriteHeader(200)
		response := Response{
			Success:  false,
			Messages: make(map[string][]string),
		}
		response.Messages["issue"] = append(response.Messages["issue"],
			"Could not get Story from features.genua.de")
		json.NewEncoder(w).Encode(response)
		return
	}
}

func getStoryFromIssue(issue string, board_id int) (bool, Story) {
	var story Story
	uri := "http://features.genua.de/issues/"
	uri += issue
	uri += ".json"

	resp, err := resty.R().Get(uri)

	if err != nil || resp.StatusCode() != 200 {
		return false, story
	}

	type IssueStruct struct {
		Issue struct {
			Subject     string `json:"subject"`
			Description string `json:"description"`
		}
	}
	resp_json := &IssueStruct{}

	err = json.Unmarshal([]byte(resp.String()), &resp_json)
	if err != nil {
		return false, story
	}

	story = NewStory(resp_json.Issue.Subject,
		resp_json.Issue.Description, "", 3, 5, board_id)
	return true, story
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
		return "public/"
	}
}
