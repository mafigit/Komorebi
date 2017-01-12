package komorebi

import (
	"strconv"
	"strings"
)

type Task struct {
	DbModel
	Desc     string `json:"desc"`
	StoryId  int    `json:"story_id"`
	ColumnId int    `json:"column_id"`
	Archived bool   `json:"archived"`
}

type TaskNested struct {
	Task
	Users `json:"users"`
}

type Tasks []Task
type TasksNested []TaskNested

func NewTask(name string, desc string, story_id int, column_id int) Task {
	return Task{
		DbModel: DbModel{
			Name: name,
		},
		Desc:     desc,
		ColumnId: column_id,
		StoryId:  story_id,
		Archived: false,
	}
}

func (t Task) TableName() string {
	return "tasks"
}

func (t Task) Save() bool {
	if !dbMapper.Save(&t) {
		return false
	}
	board := GetBoardByColumnId(t.ColumnId)
	UpdateWebsockets(board.Name, "Task updated")
	return true
}

func (t Task) Destroy() bool {
	if t.Id == 0 {
		return true
	}
	if _, errDelete := dbMapper.Connection.Delete(&t); errDelete != nil {
		Logger.Printf("delete of task failed.", errDelete)
		return false
	}

	board := GetBoardByColumnId(t.ColumnId)
	UpdateWebsockets(board.Name, "Task deleted")

	return true
}

func (t Task) Validate() (bool, map[string][]string) {
	success := true
	errors := map[string][]string{}

	if len(t.Name) <= 0 {
		Logger.Printf("Task validation failed. Name not present")
		success = false
		errors["name"] = append(errors["name"], "Name not present.")
	}

	if t.ColumnId <= 0 {
		Logger.Printf("Task validation failed. ColumnId not present")
		success = false
		errors["column_id"] = append(errors["column_id"],
			"ColumnId not present.")
	}

	if t.StoryId <= 0 {
		Logger.Printf("Task validation failed. StoryId not present")
		success = false
		errors["story_id"] = append(errors["story_id"], "StoryId not present.")
	}

	return success, errors
}

func GetTaskNested(task_id int) TaskNested {
	var task TaskNested

	err := dbMapper.Connection.SelectOne(&task,
		"select * from tasks where Id=?", task_id)
	if err != nil {
		Logger.Printf("Error while fetching task", task_id)
	}

	task.Users = GetUsersByTaskId(task_id)
	return task
}

func GetTasksByColumnId(column_id int) Tasks {
	var tasks Tasks
	_, err := dbMapper.Connection.Select(&tasks,
		"select * from tasks where ColumnId=? order by Id ", column_id)
	if err != nil {
		Logger.Printf("Error while fetching tasks", column_id)
	}
	return tasks
}

func AddUsersToTask(task Task, users UserIds) bool {
	user_id_array := []string{}
	for _, user_id := range users.UserIds {
		user_id_array = append(user_id_array, strconv.Itoa(user_id))
	}
	user_ids := strings.Join(user_id_array, ", ")

	count, err := dbMapper.Connection.SelectInt(
		"select count(Id) from users where Id IN (" + user_ids + ")")
	if count != int64(len(users.UserIds)) || err != nil {
		Logger.Println("UserIds not valid", users)
		return false
	}

	_, err = dbMapper.Connection.Exec(
		"DELETE FROM task_users WHERE TaskId=?", task.Id)
	if err != nil {
		Logger.Println("could not delete users from task", task.Id)
		return false
	}

	for _, user_id := range users.UserIds {
		_, err = dbMapper.Connection.Exec(
			"INSERT INTO task_users (TaskId, UserId) "+
				"VALUES (?, ?)", task.Id, user_id)
	}
	if err != nil {
		Logger.Println("could not insert users", users)
		return false
	}
	var board Board
	err = dbMapper.Connection.SelectOne(&board,
		"select * from boards left join "+
			"stories ON stories.BoardId = boards.Id left join "+
			"tasks ON tasks.StoryId = stories.Id where tasks.Id = ?", task.Id)
	UpdateWebsockets(board.Name, "Users updated")
	return true
}
