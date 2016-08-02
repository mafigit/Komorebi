package komorebi

import (
	"log"
)

type Task struct {
	DbModel
	Desc     string `json:"desc"`
	StoryId  int    `json:"story_id"`
	Priority int    `json:"priority"`
	ColumnId int    `json:"column_id"`
}

type Tasks []Task

func NewTask(name string, desc string, story_id int, column_id int,
	priority int) Task {
	return Task{
		DbModel: DbModel{
			Name: name,
		},
		Desc:     desc,
		Priority: priority,
		ColumnId: column_id,
		StoryId:  story_id,
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
	return true
}

func (t Task) Validate() (bool, string) {
	success, message := true, ""

	if len(t.Name) <= 0 {
		log.Println("Task validation failed. Name not present")
		success = false
		message += "Name not present.\n"
	}

	if t.ColumnId <= 0 {
		log.Println("Task validation failed. ColumnId not present")
		success = false
		message += "ColumnId not present.\n"
	}

	if t.StoryId <= 0 {
		log.Println("Task validation failed. StoryId not present")
		success = false
		message += "StoryId not present.\n"
	}
	if t.Priority <= 0 || t.Priority > 10 {
		log.Println("Task validation failed. Priority out of range")
		success = false
		message += "Priority out of range."
	}

	return success, message
}
