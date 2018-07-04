package komorebi

import (
	"encoding/json"
	"fmt"
	"github.com/go-resty/resty"
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"github.com/gorilla/websocket"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strconv"
	"strings"
)

var PublicDir string
var HookDir string
var Logger *log.Logger
var SessionStore *sessions.CookieStore
var FailedLoginCount map[string]int

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

type CreateResponse struct {
	Success  bool                `json:"success"`
	Messages map[string][]string `json:"messages"`
	Id       int                 `json:"id"`
}

type WsResponse struct {
	Message string `json:"message"`
}

type UserIds struct {
	UserIds []int `json:"user_ids"`
}
type DodNames struct {
	DodNames []string `json:"dods"`
}

func Index(w http.ResponseWriter, r *http.Request) {
	data, _ := ioutil.ReadFile(PublicDir + "/landing.html")
	site := string(data)
	fmt.Fprintln(w, site)
}

func BoardsGet(w http.ResponseWriter, r *http.Request) {
	var boards Boards
	if LoggedIn(w, r) {
		GetMyBoards(&boards, w, r)
	} else {
		GetPublicBoards(&boards)
	}
	json.NewEncoder(w).Encode(boards)
}

func BoardShow(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	board_name := vars["board_name"]
	content_type := r.Header.Get("Accept")
	board := GetBoardNestedByName(board_name)

	if board.Id == 0 {
		OwnNotFound(w, r)
		return
	}

	if !strings.Contains(content_type, "json") {
		data := getIndex()
		fmt.Fprintln(w, data)
		return
	}

	if !board.Private {
		json.NewEncoder(w).Encode(board)
		return
	}

	response := Response{
		Success:  true,
		Messages: make(map[string][]string),
	}

	if !check_login(w, r) {
		return
	}

	if BoardAuthorized(w, r, board.Name) {
		json.NewEncoder(w).Encode(board)
	} else {
		response.Success = false
		response.Messages["authorization"] = append(response.Messages["authorization"],
			"You are not authorized to see this board.")
		w.WriteHeader(401)
		json.NewEncoder(w).Encode(response)
		return
	}
}

func GetBurndownFromBoard(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	board_id, _ := strconv.Atoi(vars["board_id"])

	dumps := GetDumpsByBoardId(board_id)
	json.NewEncoder(w).Encode(dumps)
}

func GetStories(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	board_name := vars["board_name"]
	stories := GetStoriesByBoardName(board_name)
	json.NewEncoder(w).Encode(stories)
}

func Login(w http.ResponseWriter, r *http.Request) {
	response := Response{
		Success:  true,
		Messages: make(map[string][]string),
	}
	var user User

	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		w.WriteHeader(400)
		return
	}
	if Authenticate(user.Name, user.HashedPasswd) == false {
		response.Success = false
		response.Messages["login"] = append(response.Messages["login"],
			"Login failed")

		w.WriteHeader(401)
		json.NewEncoder(w).Encode(response)
		return
	}

	CreateSession(w, r, user.Name)

	w.WriteHeader(200)
	json.NewEncoder(w).Encode(response)
}

func Logout(w http.ResponseWriter, r *http.Request) {
	response := Response{
		Success:  true,
		Messages: make(map[string][]string),
	}

	DestroySession(w, r)

	w.WriteHeader(200)
	json.NewEncoder(w).Encode(response)
}

func modelCreate(m Model, w http.ResponseWriter, r *http.Request) {
	success, msg := m.Validate()

	response := CreateResponse{
		Success:  success,
		Messages: msg,
		Id:       0,
	}
	if response.Success == false {
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(response)
		return
	}

	if m.Save() {
		response.Id = m.GetId()
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(response)
	} else {
		w.WriteHeader(400)
		return
	}
}

func modelUpdate(old_m Model, update_m Model, req_id string, w http.ResponseWriter, r *http.Request) {
	response := Response{
		Success:  true,
		Messages: make(map[string][]string),
	}

	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars[req_id])
	if id != update_m.GetId() {
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
		return
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

	board = NewBoard(board.Name, board.Private)
	modelCreate(&board, w, r)
}

func BoardUpdate(w http.ResponseWriter, r *http.Request) {
	var update_board Board
	var old_board Board
	getObjectByReqId("board_id", r, &old_board)

	if err := json.NewDecoder(r.Body).Decode(&update_board); err != nil {
		w.WriteHeader(400)
		return
	}

	modelUpdate(&old_board, &update_board, "board_id", w, r)
}

func TasksGetByColumn(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	column_id := vars["column_id"]
	id, _ := strconv.Atoi(column_id)
	tasks := GetTasksByColumnId(id)
	json.NewEncoder(w).Encode(tasks)
}

func BoardDelete(w http.ResponseWriter, r *http.Request) {
	var board Board
	getObjectByReqId("board_id", r, &board)
	modelDelete(&board, w, r)
}

func ColumnGet(w http.ResponseWriter, r *http.Request) {
	var column Column
	getObjectByReqId("column_id", r, &column)

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
	modelCreate(&column, w, r)
}

func UsersGet(w http.ResponseWriter, r *http.Request) {
	var users Users
	GetAll(&users)

	for i, _ := range users {
		user := &users[i]
		user.HashedPasswd = ""
	}
	json.NewEncoder(w).Encode(users)
}

func UserCreate(w http.ResponseWriter, r *http.Request) {
	var user User

	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		w.WriteHeader(400)
		return
	}

	user = NewUser(user.Name, user.HashedPasswd, user.ImagePath)
	modelCreate(&user, w, r)
}

func UserUpdate(w http.ResponseWriter, r *http.Request) {
	var update_user User
	var old_user User

	getObjectByReqId("user_id", r, &old_user)

	if err := json.NewDecoder(r.Body).Decode(&update_user); err != nil {
		w.WriteHeader(400)
		return
	}

	if !check_login(w, r) {
		return
	}

	if IsAdmin(w, r) {
		modelUpdate(&old_user, &update_user, "user_id", w, r)
		return
	}
	if GetLoggedInUser(w, r).Id != update_user.Id {
		response := Response{
			Success:  false,
			Messages: make(map[string][]string),
		}
		response.Messages["authorization"] = append(response.Messages["authorization"],
			"You are not authorized to edit the user.")
		w.WriteHeader(401)
		json.NewEncoder(w).Encode(response)
		return
	}

	modelUpdate(&old_user, &update_user, "user_id", w, r)
}

func UserDelete(w http.ResponseWriter, r *http.Request) {
	var user User

	if !check_login(w, r) {
		return
	}

	if !IsAdmin(w, r) {
		response := Response{
			Success:  true,
			Messages: make(map[string][]string),
		}
		response.Success = false
		response.Messages["authorization"] = append(response.Messages["authorization"],
			"You are not authorized to delete the user")
		w.WriteHeader(401)
		json.NewEncoder(w).Encode(response)
		return
	}
	getObjectByReqId("user_id", r, &user)
	modelDelete(&user, w, r)
}

func ColumnUpdate(w http.ResponseWriter, r *http.Request) {
	var update_column Column
	var old_column Column
	getObjectByReqId("column_id", r, &old_column)

	if err := json.NewDecoder(r.Body).Decode(&update_column); err != nil {
		w.WriteHeader(400)
		return
	}
	update_column.BoardId = old_column.BoardId
	modelUpdate(&old_column, &update_column, "column_id", w, r)
}

func ColumnMove(w http.ResponseWriter, r *http.Request) {
	var column Column
	response := Response{
		Success:  true,
		Messages: make(map[string][]string),
	}
	getObjectByReqId("column_id", r, &column)
	if column.Id <= 0 {
		w.WriteHeader(200)
		response.Success = false
		response.Messages["column_id"] = append(response.Messages["column_id"],
			"Column does not exist.")
		json.NewEncoder(w).Encode(response)
		return
	}
	type Direction struct {
		Direction string `json:"direction"`
	}
	var d Direction

	if err := json.NewDecoder(r.Body).Decode(&d); err != nil {
		w.WriteHeader(400)
		return
	}

	if d.Direction != "right" && d.Direction != "left" {
		w.WriteHeader(400)
		return
	}
	if MoveColumn(column, d.Direction) == false {
		w.WriteHeader(200)
		response.Success = false
		response.Messages["direction"] = append(response.Messages["direction"],
			"Direction not valid.")
		json.NewEncoder(w).Encode(response)
		return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

func ColumnDelete(w http.ResponseWriter, r *http.Request) {
	var column Column
	getObjectByReqId("column_id", r, &column)
	modelDelete(&column, w, r)
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
	var story Story
	getObjectByReqId("story_id", r, &story)

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
		story.BoardId, story.Color, story.IssueNr)
	modelCreate(&story, w, r)
}

func StoryUpdate(w http.ResponseWriter, r *http.Request) {
	var update_story Story
	var old_story Story
	getObjectByReqId("story_id", r, &old_story)

	if err := json.NewDecoder(r.Body).Decode(&update_story); err != nil {
		w.WriteHeader(400)
		return
	}

	modelUpdate(&old_story, &update_story, "story_id", w, r)
}

func StoryDelete(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	story_id := vars["story_id"]

	id, _ := strconv.Atoi(story_id)
	var story Story
	GetById(&story, id)
	modelDelete(&story, w, r)
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
		Logger.Printf("could not open websocket connection: %s", err)
		return
	}

	var board Board
	GetByName(&board, board_name)

	if board.Name == "" {
		return
	}

	con := &Connection{
		Ws: ws,
	}

	defer func() {
		Logger.Printf("connection closing %s", board_name)
		con.Ws.Close()
		delete_ws_from_connections(con.Ws, board_name)
	}()

	connections[board_name] = append(connections[board_name], con)
	err = ws.WriteMessage(websocket.TextMessage, []byte("Connection established"))
	if err != nil {
		Logger.Printf("error on write: %s", err)
	}
	ws.ReadMessage()
}

func UpdateWebsockets(board_name string, msg string) {
	Logger.Println("Update Websockets for board", board_name)

	resp := &WsResponse{
		Message: msg,
	}
	json_resp, _ := json.Marshal(resp)

	for i := range connections[board_name] {
		err := connections[board_name][i].Ws.WriteMessage(
			websocket.TextMessage, []byte(json_resp))
		if err != nil {
			Logger.Printf("err %s", err)
		}
	}
}

func TaskGet(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	task_id := vars["task_id"]
	id, _ := strconv.Atoi(task_id)

	task := GetTaskNested(id)
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

	task = NewTask(task.Name, task.Desc, task.StoryId, task.ColumnId)
	modelCreate(&task, w, r)
}

func TaskUpdate(w http.ResponseWriter, r *http.Request) {
	var update_task Task
	var old_task Task
	getObjectByReqId("task_id", r, &old_task)

	if err := json.NewDecoder(r.Body).Decode(&update_task); err != nil {
		w.WriteHeader(400)
		return
	}

	modelUpdate(&old_task, &update_task, "task_id", w, r)
}

func TaskDelete(w http.ResponseWriter, r *http.Request) {
	var task Task
	getObjectByReqId("task_id", r, &task)
	modelDelete(&task, w, r)
}

func AssignUsersToTask(w http.ResponseWriter, r *http.Request) {
	var users UserIds
	var task Task
	getObjectByReqId("task_id", r, &task)

	response := Response{
		Success:  true,
		Messages: make(map[string][]string),
	}

	if task.Id <= 0 {
		response.Success = false
		response.Messages["task_id"] = append(response.Messages["task_id"],
			"TaskId does not exist.")
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(response)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&users); err != nil {
		w.WriteHeader(400)
		return
	}

	resp := AddUsersToTask(task, users)

	if resp == false {
		response.Success = false
		response.Messages["user_ids"] = append(response.Messages["user_ids"],
			"UserIds not valid.")
	}

	w.WriteHeader(200)
	json.NewEncoder(w).Encode(response)
}

func GetUsersFromTask(w http.ResponseWriter, r *http.Request) {
	var task Task
	getObjectByReqId("task_id", r, &task)

	response := Response{
		Success:  true,
		Messages: make(map[string][]string),
	}

	if task.Id <= 0 {
		w.WriteHeader(200)
		response.Success = false
		response.Messages["task_id"] = append(response.Messages["task_id"],
			"TaskId does not exist.")
		json.NewEncoder(w).Encode(response)
		return
	}

	users := GetUsersByTaskId(task.Id)
	json.NewEncoder(w).Encode(users)
}

func check_login(w http.ResponseWriter, r *http.Request) bool {
	msg := "Not allowed: You are not logged in"
	response := Response{
		Success:  true,
		Messages: make(map[string][]string),
	}

	if !LoggedIn(w, r) {
		response.Success = false
		response.Messages["authorization"] = append(response.Messages["authorization"], msg)
		w.WriteHeader(401)
		json.NewEncoder(w).Encode(response)
		return false
	}
	return true
}

func AssignUsersToBoard(w http.ResponseWriter, r *http.Request) {
	var users UserIds
	var board Board
	getObjectByReqId("board_id", r, &board)

	response := Response{
		Success:  true,
		Messages: make(map[string][]string),
	}

	if board.Id <= 0 {
		response.Success = false
		response.Messages["board_id"] = append(response.Messages["board_id"],
			"BoardId does not exist.")
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(response)
		return
	}

	if !check_login(w, r) {
		return
	}

	if !IsAdmin(w, r) {
		response.Success = false
		response.Messages["authorization"] = append(response.Messages["authorization"],
			"You are not authorized to assign an user to this board.")
		w.WriteHeader(401)
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

func ClearDumpsFromBoard(w http.ResponseWriter, r *http.Request) {
	var board Board
	getObjectByReqId("board_id", r, &board)

	response := Response{
		Success:  true,
		Messages: make(map[string][]string),
	}

	if board.Id <= 0 {
		response.Success = false
		response.Messages["board_id"] = append(response.Messages["board_id"],
			"BoardId does not exist.")
	}

	ClearDump(board.Name)

	w.WriteHeader(200)
	json.NewEncoder(w).Encode(response)
}

func GetUsersFromBoard(w http.ResponseWriter, r *http.Request) {
	var board Board
	getObjectByReqId("board_id", r, &board)

	response := Response{
		Success:  true,
		Messages: make(map[string][]string),
	}

	if board.Id <= 0 {
		w.WriteHeader(200)
		response.Success = false
		response.Messages["board_id"] = append(response.Messages["board_id"],
			"BoardId does not exist.")
		json.NewEncoder(w).Encode(response)
		return
	}

	users := GetUsersByBoardId(board.Id)
	json.NewEncoder(w).Encode(users)
}

func GetFeatureAndCreateStory(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	issue := vars["issue"]
	board_id, _ := strconv.Atoi(vars["board_id"])

	ret, story := getStoryFromIssue(issue, board_id)

	if ret == true {
		modelCreate(&story, w, r)
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

	resp, err := resty.R().Get(uri + ".json")

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
	desc := "[redmine #"
	desc += issue
	desc += "]("
	desc += uri
	desc += ") <br>"
	desc += resp_json.Issue.Description

	issue_nr, _ := strconv.Atoi(issue)

	story = NewStory(resp_json.Issue.Subject,
		desc, "", 3, board_id, "", issue_nr)
	return true, story
}

func BoardDodGet(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	board_name := vars["board_name"]
	dods := GetDodsTemplatesByBoardName(board_name)
	json.NewEncoder(w).Encode(dods)
}

func StoryDodGet(w http.ResponseWriter, r *http.Request) {
	var story Story
	getObjectByReqId("story_id", r, &story)
	dods := GetDodsByStory(story)
	json.NewEncoder(w).Encode(dods)
}

func BoardArchivedGet(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	board_name := vars["board_name"]
	stories := GetArchivedStoriesByBoardName(board_name)
	json.NewEncoder(w).Encode(stories)
}

func StoryDodUpdate(w http.ResponseWriter, r *http.Request) {
	var dods Dods
	var story Story
	getObjectByReqId("story_id", r, &story)

	response := Response{
		Success:  true,
		Messages: make(map[string][]string),
	}

	if story.Id <= 0 {
		w.WriteHeader(200)
		response.Success = false
		response.Messages["story_id"] = append(response.Messages["story_id"],
			"Story does not exist.")
		json.NewEncoder(w).Encode(response)
		return
	}
	if err := json.NewDecoder(r.Body).Decode(&dods); err != nil {
		w.WriteHeader(400)
		return
	}

	if resp := UpdateDods(dods); resp == true {
		w.WriteHeader(200)
		json.NewEncoder(w).Encode(response)
	} else {
		w.WriteHeader(200)
		response.Success = false
		response.Messages["dods"] = append(response.Messages["dods"],
			"Definition of Dones not valid.")
		json.NewEncoder(w).Encode(response)
	}
}

func BoardDodUpdate(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	board_name := vars["board_name"]
	var board Board
	GetByName(&board, board_name)

	response := Response{
		Success:  true,
		Messages: make(map[string][]string),
	}

	if board.Id <= 0 {
		w.WriteHeader(200)
		response.Success = false
		response.Messages["board_name"] = append(response.Messages["board_name"],
			"Board does not exist.")
		json.NewEncoder(w).Encode(response)
		return
	}

	var dods DodNames
	if err := json.NewDecoder(r.Body).Decode(&dods); err != nil {
		w.WriteHeader(400)
		return
	}

	resp := UpdateDodsFromBoard(dods, board)

	if resp == false {
		response.Success = false
		response.Messages["dods"] = append(response.Messages["dods"],
			"Dods not valid.")
	}

	w.WriteHeader(200)
	json.NewEncoder(w).Encode(response)
}

func OwnNotFound(w http.ResponseWriter, r *http.Request) {
	file := PublicDir + r.URL.Path
	_, err := os.Stat(file)
	default_pic := PublicDir + "/images/users/default.png"

	if strings.Contains(r.URL.Path, "images/users/") && err != nil {
		http.ServeFile(w, r, default_pic)
		return
	}

	if err == nil {
		http.ServeFile(w, r, file)
	} else {
		http.NotFound(w, r)
	}
}

func getIndex() string {
	data, _ := ioutil.ReadFile(PublicDir + "/index.html")
	return string(data)
}

func getObjectByReqId(req_var string, r *http.Request, model Model) {
	vars := mux.Vars(r)
	id, _ := strconv.Atoi(vars[req_var])
	GetById(model, id)
}

func Exe(file string, args ...string) {
	file = HookDir + file
	if _, err := os.Stat(file); err != nil {
		Logger.Printf("file does not exist: %s - %s", file, err)
		return
	}

	go func() {
		out, err := exec.Command(file, args...).Output()
		if err != nil {
			Logger.Printf("could not exec command: %s - %s", file, err)
		}
		Logger.Printf("output of command: %s - %s", file, fmt.Sprintf("%s", out))
	}()
}
