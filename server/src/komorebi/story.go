package komorebi

import (
	"strconv"
)

type Story struct {
	DbModel
	Desc         string `json:"desc"`
	Points       int    `json:"points"`
	Requirements string `json:"requirements"`
	BoardId      int    `json:"board_id"`
	Archived     bool   `json:"archived"`
	Color        string `json:"color"`
	IssueNr      int    `json:"issue_nr"`
}

type StoryNested struct {
	Story
	TasksNested `json:"tasks"`
}

type Stories []Story
type StoriesNested []StoryNested

func NewStory(name string, desc string, requirements string, points int,
	boardId int, color string, issue int) Story {

	return Story{
		DbModel: DbModel{
			Name: name,
		},
		Requirements: requirements,
		Points:       points,
		BoardId:      boardId,
		Desc:         desc,
		Archived:     false,
		Color:        color,
		IssueNr:      issue,
	}
}

func GetStoriesByBoardName(board_name string) Stories {
	var stories Stories

	_, err := dbMapper.Connection.
		Select(&stories, "select stories.* from stories left join "+
			"boards on boards.Id = stories.BoardId where "+
			"boards.Name =?", board_name)
	if err != nil {
		Logger.Printf("could not find boards")
	}
	return stories
}

func GetArchivedStoriesByBoardName(board_name string) Stories {
	var stories Stories

	_, err := dbMapper.Connection.
		Select(&stories, "select stories.* from stories left join "+
			"boards on boards.Id = stories.BoardId WHERE "+
			"(stories.Archived=1 AND "+
			"boards.Name =?)", board_name)
	if err != nil {
		Logger.Printf("could not find boards")
	}
	return stories
}

func GetStoriesByBoardId(id int) Stories {
	var stories Stories

	_, err := dbMapper.Connection.
		Select(&stories, "select * from stories "+
			"where BoardId=? order by Id", id)
	if err != nil {
		Logger.Printf("could not find stories")
	}
	return stories
}

func (s Story) TableName() string {
	return "stories"
}

func (s *Story) Save() bool {
	create := false
	if s.Id == 0 {
		create = true
		Exe("before.story.create", s.Name)
	} else {
		Exe("before.story.update", strconv.Itoa(s.Id), s.Name)
	}

	if !dbMapper.Save(s) {
		return false
	}
	var board Board
	GetById(&board, s.BoardId)
	UpdateWebsockets(board.Name, "Story updated")

	if create {
		Exe("after.story.create", strconv.Itoa(s.Id), s.Name)
	} else {
		Exe("after.story.update", strconv.Itoa(s.Id), s.Name)
	}
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

	Exe("before.story.delete", strconv.Itoa(s.Id), s.Name)
	if _, errDelete := dbMapper.Connection.Delete(&s); errDelete != nil {
		Logger.Printf("delete of story failed. %s", errDelete)
		return false
	}

	var board Board
	GetById(&board, s.BoardId)
	UpdateWebsockets(board.Name, "Story deleted")

	Exe("after.story.delete", strconv.Itoa(s.Id), s.Name)
	return true
}

func (s Story) Validate() (bool, map[string][]string) {
	success := true
	errors := map[string][]string{}

	if len(s.Name) <= 0 {
		Logger.Printf("Story validation failed. Name not present")
		success = false
		errors["name"] = append(errors["name"], "Name not present.")
	}
	if s.Points <= 0 {
		Logger.Printf("Story validation failed. Points out of range.")
		success = false
		errors["points"] = append(errors["points"], "Points out of range.")
	}
	if s.BoardId <= 0 {
		Logger.Printf("Story validation failed. BoardId not set.")
		success = false
		errors["board_id"] = append(errors["board_id"], "BoardId not set.")
	}

	return success, errors
}
