package komorebi

import (
	"log"
	"time"
)

type Board struct {
	Id        int
	Name      string
	CreatedAt int64
}

type BoardColumnView struct {
	Id        int    `json:"id"`
	Name      string `json:"name"`
	CreatedAt int64  `json:"created_at"`
	Columns
}

type Boards []Board
type BoardColumnViews []BoardColumnView

func NewBoard(name string) Board {
	return Board{
		CreatedAt: time.Now().UnixNano(),
		Name:      name,
	}
}

func (b Board) Save() bool {
	if err := dbMapper.Connection.Insert(&b); err != nil {
		log.Fatalln("save of board failed", err)
		return false
	}
	return true
}
