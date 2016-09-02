package komorebi

import (
	"log"
	"time"
)

type Dump struct {
	Id        int
	Type      string `json:"type"`
	Name      string `json:"name"`
	ColumnId  int    `json:"column_id"`
	BoardName string `json:"board_name"`
	CreatedAt int64  `json:"created_at"`
}

type Dumps []Dump

func DumpIt() {
	var boards Boards
	GetAll(&boards)
	for _, board := range boards {
		DumpForBoard(board)
	}
}

func DumpForBoard(board Board) {
	t := time.Now().UnixNano()
	for _, story := range GetStoriesByBoardName(board.Name) {
		var dump Dump
		dump.Name = story.Name
		dump.Type = story.TableName()
		dump.BoardName = board.Name
		dump.ColumnId = story.ColumnId
		dump.CreatedAt = t
		if err := dbMapper.Connection.Insert(&dump); err != nil {
			log.Println("save dump failed", err)
		}
	}
}
