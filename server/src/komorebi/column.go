package komorebi

type Column struct {
	DbModel
	BoardId  int `json:"board_id"`
	Position int `json:"position"`
}

type ColumnNested struct {
	Column
	Tasks `json:"tasks"`
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

func (c *Column) Save() bool {
	if c.Id == 0 {
		if c.Position == 0 {
			var column Column
			err := dbMapper.Connection.SelectOne(&column,
				"select * from columns where BoardId=? order by Position Desc limit 1", c.BoardId)
			if err == nil {
				c.Position = column.Position + 1
			}
		}
		if errInsert := dbMapper.Connection.Insert(c); errInsert != nil {
			Logger.Printf("save of column failed", errInsert)
			return false
		}
	} else {
		if _, errUpdate := dbMapper.Connection.Update(c); errUpdate != nil {
			Logger.Printf("save of column failed", errUpdate)
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

	tasks := GetTasksByColumnId(c.Id)
	for _, task := range tasks {
		task.Destroy()
	}

	if _, errDelete := dbMapper.Connection.Delete(&c); errDelete != nil {
		Logger.Printf("delete of column failed.", errDelete)
		return false
	}
	reorderColumns(c.BoardId)

	var board Board
	GetById(&board, c.BoardId)
	UpdateWebsockets(board.Name, "Column deleted")

	return true
}

func reorderColumns(board_id int) {
	for index, column := range GetColumnsByBoardId(board_id) {
		column.Position = index
		if _, errUpdate := dbMapper.Connection.Update(&column); errUpdate != nil {
			Logger.Printf("save of column failed", errUpdate)
		}
	}
}

func (c Column) Validate() (bool, map[string][]string) {
	success := true
	errors := map[string][]string{}

	if len(c.Name) <= 0 {
		Logger.Printf("Column validation failed. Name not present")
		success = false
		errors["name"] = append(errors["name"], "Name not present.")
	}

	var board Board
	GetById(&board, c.BoardId)
	if board.Id == 0 {
		Logger.Printf("Column validation failed. BoardId does not exist:", c.BoardId)
		success = false
		errors["board_id"] = append(errors["board_id"], "Board does not exist.")
	}

	for _, column := range GetColumnsByBoardId(board.Id) {
		if column.Name == c.Name && column.Id != c.Id {
			Logger.Printf("Column validation failed. Name not uniq")
			success = false
			errors["name"] = append(errors["name"], "Name not uniq.")
		}
	}
	return success, errors
}

func GetNestedColumnByColumnId(id int) ColumnNested {
	var column ColumnNested

	err := dbMapper.Connection.SelectOne(&column,
		"select * from columns where Id=?", id)

	if err != nil {
		Logger.Printf("could not find column", err)
		return column
	}

	var tasks Tasks
	_, err = dbMapper.Connection.Select(&tasks,
		"select * from tasks where ColumnId=?", column.Id)
	column.Tasks = tasks

	return column
}

func GetColumnsByBoardId(board_id int) Columns {
	var cols Columns
	_, err := dbMapper.Connection.Select(&cols,
		"select * from columns where BoardId=? order by Position, Id ", board_id)
	if err != nil {
		Logger.Printf("Error while fetching columns", board_id)
	}
	return cols
}

func MoveColumn(column Column, dir string) bool {
	if dir == "right" {
		max_pos, _ := dbMapper.Connection.SelectInt(
			"select MAX(Position) from columns where BoardId=?", column.BoardId)
		if max_pos == int64(column.Position) {
			return false
		}
		column.Position = column.Position + 1
	} else {
		if column.Position == 0 {
			return false
		}
		column.Position = column.Position - 1
	}
	if _, errUpdate := dbMapper.Connection.Update(&column); errUpdate != nil {
		Logger.Printf("save of column failed", errUpdate)
	}
	for _, c := range GetColumnsByBoardId(column.BoardId) {
		if c.Position == column.Position && c.Id != column.Id {
			if dir == "right" {
				c.Position = c.Position - 1
			} else {
				c.Position = c.Position + 1
			}
			if _, errUpdate := dbMapper.Connection.Update(&c); errUpdate != nil {
				Logger.Printf("save of column failed", errUpdate)
			}
		}
	}
	return true
}
