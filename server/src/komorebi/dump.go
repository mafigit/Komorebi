package komorebi

import (
	"log"
	"time"
)

type Dump struct {
	Id        int
	CreatedAt int64
	AllTasks  int64
	DoneTasks int64
	BoardId   int
}

type Burndown struct {
	CreatedAt int64 `json:"creation"`
	Todo      int64 `json:"todo"`
}

type Dumps []Dump
type Burndowns []Burndown

func DumpIt() {
	var boards Boards
	GetAll(&boards)
	for _, board := range boards {
		DumpForBoard(board)
	}
}

func DumpForBoard(board Board) {
	t := time.Now().UnixNano()
	var dump Dump
	dump.CreatedAt = t
	dump.AllTasks = CountAllTasks(board)
	dump.DoneTasks = CountDoneTasks(board)
	dump.BoardId = board.Id
	if err := dbMapper.Connection.Insert(&dump); err != nil {
		log.Println("save dump failed", err)
	}
}

func CountAllTasks(board Board) int64 {
	count, err := dbMapper.Connection.SelectInt(
		"select count(tasks.Id) from tasks left join "+
			"stories ON stories.Id = tasks.StoryId left join "+
			"boards ON boards.Id = stories.BoardId "+
			"where boards.Id=?", board.Id)
	if err != nil {
		log.Println("Cound not count all tasks from board", board.Name)
	}
	return count
}

func CountDoneTasks(board Board) int64 {
	done_column_id, err := dbMapper.Connection.SelectInt(
		"select columns.id from columns left join "+
			"boards ON boards.Id = columns.BoardId where boards.Id=? "+
			"order by columns.Position DESC LIMIT 1", board.Id)
	if err != nil {
		log.Println("Cound not get done column from board", board.Name)
	}
	count, err := dbMapper.Connection.SelectInt(
		"select count(tasks.Id) from tasks left join "+
			"columns ON columns.Id = tasks.ColumnId "+
			"where columns.Id=?", done_column_id)
	if err != nil {
		log.Println("Cound not count done tasks from board", board.Name)
	}
	return count
}

func ClearDump(board_name string) {
	var board Board
	GetByName(&board, board_name)

	_, err := dbMapper.Connection.Exec(
		"DELETE FROM dumps WHERE BoardId=?", board.Id)
	if err != nil {
		Logger.Printf("could not delete dumps from board", board_name)
	}
}

func GetDumpsByBoardId(board_id int) Burndowns {
	var dumps Dumps
	burndowns := make([]Burndown, 0)

	_, err := dbMapper.Connection.Select(&dumps,
		"select * from dumps where BoardId=?", board_id)
	if err != nil {
		Logger.Printf("could not get dumps from board", board_id)
	}

	for _, dump := range dumps {
		var burndown Burndown
		burndown.CreatedAt = dump.CreatedAt
		burndown.Todo = dump.AllTasks - dump.DoneTasks
		burndowns = append(burndowns, burndown)
	}

	return burndowns
}
