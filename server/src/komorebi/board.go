package komorebi

import (
	"log"
	"regexp"
	"time"
)

type Board struct {
	Id        int    `json:"id"`
	Name      string `json:"name"`
	CreatedAt int64  `json:"created_at"`
	UpdatedAt int64  `json:"updated_at"`
}

type BoardColumnView struct {
	Id        int    `json:"id"`
	Name      string `json:"name"`
	CreatedAt int64  `json:"created_at"`
	UpdatedAt int64  `json:"updated_at"`
	Columns   `json:"columns"`
}

type BoardWs struct {
	Id        int
	Name      string
	CreatedAt int64
	UpdatedAt int64
	ColumnsWs
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

func (b Board) GetId() int {
	return b.Id
}

func (b Board) GetCreatedAt() int64 {
	return b.CreatedAt
}
func (b Board) SetUpdatedAt() {
	b.UpdatedAt = time.Now().UnixNano()
}

func (b Board) TableName() string {
	return "boards"
}

func (b Boards) TableName() string {
	return "boards"
}

func (b Board) Save() bool {
	return dbMapper.Save(&b)
}

func (b Board) Destroy() bool {
	if b.Id == 0 {
		return true
	}
	for _, column := range GetColumnsByBoardId(b.Id) {
		column.Destroy()
	}

	if _, errDelete := dbMapper.Connection.Delete(&b); errDelete != nil {
		log.Println("delete of board failed.", errDelete)
		return false
	}
	return true
}

func GetBoardWsByName(name string) BoardWs {
	var board BoardWs
	err := dbMapper.Connection.
		SelectOne(&board, "select * from boards where Name=?", name)
	if err != nil {
		log.Println("could not find board with name", name)
		return board
	}
	_, err = dbMapper.Connection.Select(&board.ColumnsWs,
		"select * from columns where boardId=? order by Position", board.Id)

	var stories Stories
	for col_index, col := range board.ColumnsWs {
		_, err = dbMapper.Connection.Select(&stories,
			"select * from stories where ColumnId=?", col.Id)
		board.ColumnsWs[col_index].Stories = stories
	}
	return board
}

func GetBoardColumnViewByName(name string) BoardColumnView {
	var board BoardColumnView
	err := dbMapper.Connection.
		SelectOne(&board, "select * from boards where Name=?", name)
	if err != nil {
		log.Println("could not find board by name", err)
		return board
	}
	var columns Columns
	_, err = dbMapper.Connection.Select(&columns,
		"select * from columns where boardId=? order by Position", board.Id)
	board.Columns = columns
	return board
}

func GetBoardByColumnId(c_id int) Board {
	var board Board

	err := dbMapper.Connection.
		SelectOne(&board, "select boards.* from boards left join "+
			"columns on columns.BoardId = boards.Id "+
			"where columns.Id=?", c_id)
	if err != nil {
		log.Println("could not find board")
	}
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
