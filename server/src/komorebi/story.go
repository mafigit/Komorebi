package komorebi

import (
	"log"
	"time"
)

type Story struct {
	Id           int    `json:"id"`
	Name         string `json:"name"`
	Desc         string `json:"desc"`
	Points       int    `json:"points"`
	Requirements string `json:"requirements"`
	CreatedAt    int64  `json:"created_at"`
	ColumnId     int    `json:"column_id"`
}

type Stories []Story

func NewStory(name string, desc string, requirements string, points int,
	columnId int) Story {

	return Story{
		CreatedAt:    time.Now().UnixNano(),
		Name:         name,
		Desc:         desc,
		Requirements: requirements,
		Points:       points,
		ColumnId:     columnId,
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

func (s Story) Save() bool {
	if err := dbMapper.Connection.Insert(&s); err != nil {
		log.Println("save of story failed", err)
		return false
	}
	return true
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

	return success, message
}
