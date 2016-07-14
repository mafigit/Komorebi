package komorebi

import (
	"log"
)

type Story struct {
	DbModel
	Desc         string `json:"desc"`
	Points       int    `json:"points"`
	Priority     int    `json:"priority"`
	Requirements string `json:"requirements"`
	ColumnId     int    `json:"column_id"`
}

type Stories []Story

func NewStory(name string, desc string, requirements string, points int,
	priority int, columnId int) Story {

	return Story{
		DbModel: DbModel{
			Name: name,
		},
		Requirements: requirements,
		Priority:     priority,
		Points:       points,
		ColumnId:     columnId,
		Desc:         desc,
	}
}

func GetStoriesByBoradName(board_name string) Stories {
	var stories Stories

	_, err := dbMapper.Connection.
		Select(&stories, "select stories.* from stories left join "+
			"columns on columns.Id = stories.ColumnId left join "+
			"boards on boards.Id = columns.BoardId where "+
			"boards.Name =?", board_name)
	if err != nil {
		log.Println("could not find boards")
	}
	return stories
}

func GetStoriesByColumnId(id int) Stories {
	var stories Stories

	_, err := dbMapper.Connection.
		Select(&stories, "select stories.* from stories left join "+
			"columns on columns.Id = stories.ColumnId "+
			"where columns.Id=? order by stories.Id", id)
	if err != nil {
		log.Println("could not find stories")
	}
	return stories
}

func GetStoryById(id int) Story {
	var story Story
	err := dbMapper.Connection.SelectOne(&story,
		"select * from stories where Id=? ", id)
	if err != nil {
		log.Println("could not find story", id)
	}
	return story
}

func (s Story) TableName() string {
	return "stories"
}

func (s Story) Save() bool {
	if !dbMapper.Save(&s) {
		return false
	}
	board := GetBoardByColumnId(s.ColumnId)
	UpdateWebsockets(board.Name, "Story updated")
	return true
}

func (s Story) Destroy() bool {
	if s.Id == 0 {
		return true
	}

	tasks := GetTasksByStoryId(s.Id)
	for _, task := range tasks {
		task.Destroy()
	}

	if _, errDelete := dbMapper.Connection.Delete(&s); errDelete != nil {
		log.Println("delete of story failed.", errDelete)
		return false
	}
	return true
}

func GetTasksByStoryId(story_id int) Tasks {
	var tasks Tasks

	_, err := dbMapper.Connection.Select(&tasks,
		"select * from tasks where StoryId=? order by Id ", story_id)
	if err != nil {
		log.Println("Error while fetching tasks", story_id)
	}
	return tasks
}

func (s Story) Validate() (bool, string) {
	success, message := true, ""

	if len(s.Name) <= 0 {
		log.Println("Story validation failed. Name not present")
		success = false
		message += "Name not present.\n"
	}
	if s.Points <= 0 {
		log.Println("Story validation failed. Points out of range.")
		success = false
		message += "Points out of range.\n"
	}
	if s.ColumnId <= 0 {
		log.Println("Story validation failed. ColumnId not set.")
		success = false
		message += "ColumnId not set.\n"
	}
	if s.Priority <= 0 || s.Priority > 10 {
		log.Println("Story validation failed. Priority out of range")
		success = false
		message += "Priority out of range.\n"
	}

	return success, message
}
