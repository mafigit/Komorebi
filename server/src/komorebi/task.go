package komorebi

import (
	"log"
)

type Task struct {
	DbModel
	Desc     string `json:"desc"`
	StoryId  int    `json:"story_id"`
	ColumnId int    `json:"column_id"`
	Archived bool   `json:"archived"`
}

type Tasks []Task

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
		log.Println("delete of task failed.", errDelete)
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
		log.Println("Task validation failed. Name not present")
		success = false
		errors["name"] = append(errors["name"], "Name not present.")
	}

	if t.ColumnId <= 0 {
		log.Println("Task validation failed. ColumnId not present")
		success = false
		errors["column_id"] = append(errors["column_id"],
			"ColumnId not present.")
	}

	if t.StoryId <= 0 {
		log.Println("Task validation failed. StoryId not present")
		success = false
		errors["story_id"] = append(errors["story_id"], "StoryId not present.")
	}

	return success, errors
}

func GetTasksByColumnId(column_id int) Tasks {
	var tasks Tasks
	_, err := dbMapper.Connection.Select(&tasks,
		"select * from tasks where ColumnId=? order by Id ", column_id)
	if err != nil {
		log.Println("Error while fetching tasks", column_id)
	}
	return tasks
}
