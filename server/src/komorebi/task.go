package komorebi

import (
	"log"
	"time"
)

type Task struct {
	Id        int    `json:"id"`
	Name      string `json:"name"`
	Desc      string `json:"Desc"`
	CreatedAt int64  `json:"created_at"`
	StoryId   int    `json:"story_id"`
	ColumnId  int    `json:"column_id"`
}

type Tasks []Task

func NewTask(name string, desc string, story_id int, column_id int) Task {
	return Task{
		Name:      name,
		Desc:      desc,
		StoryId:   story_id,
		ColumnId:  column_id,
		CreatedAt: time.Now().UnixNano(),
	}
}

func (t Task) GetId() int {
	return t.Id
}

func (t Task) GetCreatedAt() int64 {
	return t.CreatedAt
}

func (t Task) TableName() string {
	return "tasks"
}

func (t Task) Save() bool {
	return dbMapper.Save(&t)
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

	return success, message
}
