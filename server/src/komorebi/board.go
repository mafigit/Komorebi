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

func GetAllBoards() Boards {
	var boards Boards
	_, err := dbMapper.Connection.
		Select(&boards, "select * from boards order by id")
	if err != nil {
		log.Fatalln("could not find boards")
	}
	return boards
}

func GetBoardColumnViewByName(name string) BoardColumnView {
	var board BoardColumnView
	err := dbMapper.Connection.
		SelectOne(&board, "select * from boards where Name=?", name)
	if err != nil {
		log.Fatalln("could not find board with name", name)
		return board
	}
	var columns Columns
	_, err = dbMapper.Connection.Select(&columns,
		"select * from columns where boardId=?", board.Id)
	board.Columns = columns
	return board
}
