package komorebi

import (
	"fmt"
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

func (s Story) Save() bool {
	if err := dbMapper.Connection.Insert(&s); err != nil {
		fmt.Println("save of story failed", err)
		return false
	}
	return true
}

func (s Story) Validate() (bool, string) {
	return true, ""
}
