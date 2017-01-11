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
	BoardId      int    `json:"board_id"`
	Archived     bool   `json:"archived"`
}

type StoryNested struct {
	DbModel
	Desc         string `json:"desc"`
	Points       int    `json:"points"`
	Priority     int    `json:"priority"`
	Requirements string `json:"requirements"`
	BoardId      int    `json:"board_id"`
	Tasks        `json:"tasks"`
	Archived     bool `json:"archived"`
}

type Stories []Story
type StoriesNested []StoryNested

func NewStory(name string, desc string, requirements string, points int,
	priority int, boardId int) Story {

	return Story{
		DbModel: DbModel{
			Name: name,
		},
		Requirements: requirements,
		Priority:     priority,
		Points:       points,
		BoardId:      boardId,
		Desc:         desc,
		Archived:     false,
	}
}

func GetStoriesByBoardName(board_name string) Stories {
	var stories Stories

	_, err := dbMapper.Connection.
		Select(&stories, "select stories.* from stories left join "+
			"boards on boards.Id = stories.BoardId where "+
			"boards.Name =?", board_name)
	if err != nil {
		log.Println("could not find boards")
	}
	return stories
}

func GetStoriesByBoardId(id int) Stories {
	var stories Stories

	_, err := dbMapper.Connection.
		Select(&stories, "select * from stories "+
			"where BoardId=? order by Id", id)
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
	var board Board
	GetById(&board, s.BoardId)
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

	var board Board
	GetById(&board, s.BoardId)
	UpdateWebsockets(board.Name, "Story deleted")

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

func (s Story) Validate() (bool, map[string][]string) {
	success := true
	errors := map[string][]string{}

	if len(s.Name) <= 0 {
		log.Println("Story validation failed. Name not present")
		success = false
		errors["name"] = append(errors["name"], "Name not present.")
	}
	if s.Points <= 0 {
		log.Println("Story validation failed. Points out of range.")
		success = false
		errors["points"] = append(errors["points"], "Points out of range.")
	}
	if s.BoardId <= 0 {
		log.Println("Story validation failed. BoardId not set.")
		success = false
		errors["board_id"] = append(errors["board_id"], "BoardId not set.")
	}
	if s.Priority <= 0 || s.Priority > 10 {
		log.Println("Story validation failed. Priority out of range")
		success = false
		errors["priority"] = append(errors["priority"],
			"Priority out of range.")
	}

	return success, errors
}
