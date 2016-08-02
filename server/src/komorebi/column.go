package komorebi

import (
	"log"
)

type Column struct {
	DbModel
	BoardId  int `json:"board_id"`
	Position int `json:"position"`
}

type ColumnWs struct {
	DbModel
	StoriesWs
	Position int
	BoardId  int
}

type ColumnsWs []ColumnWs
type Columns []Column

func NewColumn(name string, position int, boardId int) Column {
	return Column{
		DbModel: DbModel{
			Name: name,
		},
		Position: position,
		BoardId:  boardId,
	}
}

func (c Column) TableName() string {
	return "columns"
}

func (c Column) Save() bool {
	if c.Id == 0 {
		if c.Position == 0 {
			var column Column
			err := dbMapper.Connection.SelectOne(&column,
				"select * from columns where BoardId=? order by Position Desc limit 1", c.BoardId)
			if err == nil {
				c.Position = column.Position + 1
			}
		}
		if errInsert := dbMapper.Connection.Insert(&c); errInsert != nil {
			log.Println("save of column failed", errInsert)
			return false
		}
	} else {
		if _, errUpdate := dbMapper.Connection.Update(&c); errUpdate != nil {
			log.Println("save of column failed", errUpdate)
			return false
		}
	}
	reorderColumns(c.BoardId)
	var board Board
	GetById(&board, c.BoardId)
	UpdateWebsockets(board.Name, "Columns updated")
	return true
}

func (c Column) Destroy() bool {
	if c.Id == 0 {
		return true
	}

	stories := GetStoriesByColumnId(c.Id)
	for _, story := range stories {
		story.Destroy()
	}

	if _, errDelete := dbMapper.Connection.Delete(&c); errDelete != nil {
		log.Println("delete of column failed.", errDelete)
		return false
	}
	reorderColumns(c.BoardId)
	return true
}

func reorderColumns(board_id int) {
	for index, column := range GetColumnsByBoardId(board_id) {
		column.Position = index
		if _, errUpdate := dbMapper.Connection.Update(&column); errUpdate != nil {
			log.Println("save of column failed", errUpdate)
		}
	}
}

func (c Column) Validate() (bool, string) {
	success, message := true, ""

	if len(c.Name) <= 0 {
		log.Println("Column validation failed. Name not present")
		success = false
		message += "Name not present.\n"
	}

	board := GetBoardColumnViewById(c.BoardId)
	if board.Id == 0 {
		log.Println("Column validation failed. BoardId does not exist:", c.BoardId)
		success = false
		message += "Board does not exist.\n"
	}

	for _, column := range board.Columns {
		if column.Name == c.Name {
			log.Println("Column validation failed. Name not uniq")
			success = false
			message += "Name not uniq.\n"
		}
	}
	return success, message
}

func GetColumnsByBoardId(board_id int) Columns {
	var cols Columns
	_, err := dbMapper.Connection.Select(&cols,
		"select * from columns where BoardId=? order by Position, Id ", board_id)
	if err != nil {
		log.Println("Error while fetching columns", board_id)
	}
	return cols
}
