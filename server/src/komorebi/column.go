package komorebi

type Column struct {
	DbModel
	BoardId  int `json:"board_id"`
	Position int `json:"position"`
}

type ColumnNested struct {
	DbModel
	Tasks    `json:"tasks"`
	Position int `json:"position"`
	BoardId  int `json:"board_id"`
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
			Logger.Printf("save of column failed", errInsert)
			return false
		}
	} else {
		if _, errUpdate := dbMapper.Connection.Update(&c); errUpdate != nil {
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
