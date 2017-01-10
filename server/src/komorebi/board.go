package komorebi

import (
	"log"
	"regexp"
	"strconv"
	"strings"
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
		"select * from columns where BoardId=? order by Position", board.Id)

	column_id_array := []string{}
	for _, col := range board.ColumnsNested {
		column_id_array = append(column_id_array, strconv.Itoa(col.Id))
	}
	column_ids := strings.Join(column_id_array, ", ")

	var stories StoriesNested
	_, err = dbMapper.Connection.Select(&stories,
		"select * from stories where ColumnId IN ("+column_ids+")")

	story_id_array := []string{}
	for _, story := range stories {
		story_id_array = append(story_id_array, strconv.Itoa(story.Id))
	}
	story_ids := strings.Join(story_id_array, ", ")

	var tasks Tasks
	_, err = dbMapper.Connection.Select(&tasks,
		"select * from tasks where StoryId IN ("+story_ids+")")

	for col_index, col := range board.ColumnsNested {
		col_stories := make([]StoryNested, 0)
		for _, s := range stories {
			if s.ColumnId == col.Id {
				col_stories = append(col_stories, s)
			}
		}
		board.ColumnsNested[col_index].StoriesNested = col_stories
		for sto_index, sto := range board.ColumnsNested[col_index].StoriesNested {
			sto_tasks := make([]Task, 0)
			for _, t := range tasks {
				if t.StoryId == sto.Id {
					sto_tasks = append(sto_tasks, t)
				}
			}
			board.ColumnsNested[col_index].StoriesNested[sto_index].Tasks = sto_tasks
		}
	}
	return board
}

func GetBoardByName(name string) Board {
	var board Board
	err := dbMapper.Connection.
		SelectOne(&board, "select * from boards where Name=?", name)
	if err != nil {
		log.Println("could not find board with name", name)
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
