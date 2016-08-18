package komorebi

import (
	"log"
)

type Column struct {
	DbModel
	BoardId  int `json:"board_id"`
	Position int `json:"position"`
}

type ColumnNested struct {
	DbModel
	StoriesNested `json:"stories"`
	Position      int `json:"position"`
	BoardId       int `json:"board_id"`
}

type ColumnsNested []ColumnNested
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

	var board Board
	GetById(&board, c.BoardId)
	if board.Id == 0 {
		log.Println("Column validation failed. BoardId does not exist:", c.BoardId)
		success = false
		message += "Board does not exist.\n"
	}

	for _, column := range GetColumnsByBoardId(board.Id) {
		if column.Name == c.Name && column.Id != c.Id {
			log.Println("Column validation failed. Name not uniq")
			success = false
			message += "Name not uniq.\n"
		}
	}
	return success, message
}

func GetNestedColumnByColumnId(id int) ColumnNested {
	var column ColumnNested

	err := dbMapper.Connection.SelectOne(&column,
		"select * from columns where Id=?", id)

	if err != nil {
		log.Println("could not find column", err)
		return column
	}
	_, err = dbMapper.Connection.Select(&column.StoriesNested,
		"select * from stories where ColumnId=?", column.Id)

	if err != nil {
		log.Println("could not find stories", err)
		return column
	}

	var tasks Tasks
	for story_index, st := range column.StoriesNested {
		_, err = dbMapper.Connection.Select(&tasks,
			"select * from tasks where StoryId=?", st.Id)
		column.StoriesNested[story_index].Tasks = tasks
	}
	return column
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
