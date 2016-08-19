package komorebi

import (
	"log"
	"regexp"
)

type Board struct {
	DbModel
}

type BoardNested struct {
	DbModel
	ColumnsNested `json:"columns"`
}

type Boards []Board

func NewBoard(name string) Board {
	return Board{
		DbModel: DbModel{
			Name: name,
		},
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
	var board Board
	GetByName(&board, b.Name)
	if board.Id != 0 && board.Id != b.Id {
		log.Println("Board validation failed. Name not uniq")
		success = false
		message += "Name not uniq.\n"
	}
	return success, message
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

func GetBoardNestedByName(name string) BoardNested {
	var board BoardNested
	err := dbMapper.Connection.
		SelectOne(&board, "select * from boards where Name=?", name)
	if err != nil {
		log.Println("could not find board with name", name)
		return board
	}
	_, err = dbMapper.Connection.Select(&board.ColumnsNested,
		"select * from columns where boardId=? order by Position", board.Id)

	for col_index, col := range board.ColumnsNested {

		_, err = dbMapper.Connection.Select(&board.ColumnsNested[col_index].StoriesNested,
			"select * from stories where ColumnId=?", col.Id)

		var tasks Tasks
		for story_index, st := range board.ColumnsNested[col_index].StoriesNested {
			_, err = dbMapper.Connection.Select(&tasks,
				"select * from tasks where StoryId=?", st.Id)
			board.ColumnsNested[col_index].StoriesNested[story_index].Tasks = tasks
		}
	}
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
