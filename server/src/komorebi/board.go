package komorebi

import (
	"fmt"
	"log"
	"regexp"
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

func (b Board) Validate() (bool, string) {
	success, message := true, ""

	if len(b.Name) <= 0 {
		log.Println("Board validation failed. Name not present")
		success = false
		message += "Name not present.\n"
	}
	if match, _ := regexp.MatchString("^[a-zA-Z0-9-]+$", b.Name); match == false {
		log.Println("Board validation failed. Name not valid")
		success = false
		message += "Name not valid.\n"
	}
	board := GetBoardColumnViewByName(b.Name)
	if board.Id != 0 && board.CreatedAt != 0 {
		log.Println("Board validation failed. Name not uniq")
		success = false
		message += "Name not uniq.\n"
	}
	return success, message
}

func (b Board) Save() bool {
	if err := dbMapper.Connection.Insert(&b); err != nil {
		log.Println("save of board failed", err)
		return false
	}
	return true
}

func GetAllBoards() Boards {
	var boards Boards
	_, err := dbMapper.Connection.
		Select(&boards, "select * from boards order by id")
	if err != nil {
		log.Println("could not find boards")
	}
	return boards
}

func GetBoardColumnViewByName(name string) BoardColumnView {
	var board BoardColumnView
	err := dbMapper.Connection.
		SelectOne(&board, "select * from boards where Name=?", name)
	if err != nil {
		log.Println("could not find board with name", name)
		return board
	}
	var columns Columns
	_, err = dbMapper.Connection.Select(&columns,
		"select * from columns where boardId=?", board.Id)
	board.Columns = columns
	return board
}

func GetBoardColumnViewById(id int) BoardColumnView {
	var board BoardColumnView
	err := dbMapper.Connection.
		SelectOne(&board, "select * from boards where Id=?", id)
	if err != nil {
		log.Println("could not find board with id", id)
		return board
	}
	var columns Columns
	_, err = dbMapper.Connection.Select(&columns,
		"select * from columns where boardId=?", board.Id)
	board.Columns = columns
	return board
}
