package komorebi

import (
	"log"
	"time"
)

type Column struct {
	Id        int    `json:"id"`
	Name      string `json:"name"`
	Position  int    `json:"position"`
	BoardId   int    `json:"boardId"`
	CreatedAt int64  `json:"created_at"`
}

type Columns []Column

func NewColumn(name string, position int, boardId int) Column {
	return Column{
		CreatedAt: time.Now().UnixNano(),
		Name:      name,
		Position:  position,
		BoardId:   boardId,
	}
}

func (c Column) Save() bool {
	if err := dbMapper.Connection.Insert(&c); err != nil {
		log.Fatalln("save of board failed", err)
		return false
	}
	return true
}
