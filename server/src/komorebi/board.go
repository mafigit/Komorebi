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
	StoriesNested `json:"stories"`
	Columns       `json:"columns"`
}

type Boards []Board

func NewBoard(name string) Board {
	return Board{
		DbModel: DbModel{
			Name: name,
		},
	}
}

func (b Board) Validate() (bool, map[string][]string) {
	success := true
	errors := map[string][]string{}

	if len(b.Name) <= 0 {
		log.Println("Board validation failed. Name not present")
		success = false
		errors["name"] = append(errors["name"], "Name not present.")
	}
	if match, _ := regexp.MatchString("^[a-zA-Z0-9-]+$", b.Name); match == false {
		log.Println("Board validation failed. Name not valid")
		success = false
		errors["name"] = append(errors["name"], "Name not valid.")
	}
	var board Board
	GetByName(&board, b.Name)
	if board.Id != 0 && board.Id != b.Id {
		log.Println("Board validation failed. Name not uniq")
		success = false
		errors["name"] = append(errors["name"], "Name not uniq.")
	}
	return success, errors
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
	for _, story := range GetStoriesByBoardId(b.Id) {
		story.Destroy()
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
	_, err = dbMapper.Connection.Select(&board.Columns,
		"select * from columns where BoardId=? order by Position", board.Id)

	_, err = dbMapper.Connection.Select(&board.StoriesNested,
		"select * from stories where BoardId=?", board.Id)

	story_id_array := []string{}
	for _, story := range board.StoriesNested {
		story_id_array = append(story_id_array, strconv.Itoa(story.Id))
	}
	story_ids := strings.Join(story_id_array, ", ")

	var tasks Tasks
	_, err = dbMapper.Connection.Select(&tasks,
		"select * from tasks where StoryId IN ("+story_ids+")")

	for sto_index, sto := range board.StoriesNested {
		sto_tasks := make([]Task, 0)
		for _, t := range tasks {
			if t.StoryId == sto.Id {
				sto_tasks = append(sto_tasks, t)
			}
		}
		board.StoriesNested[sto_index].Tasks = sto_tasks
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

func AddUsersToBoard(board Board, users UserIds) bool {
	user_id_array := []string{}
	for _, user_id := range users.UserIds {
		user_id_array = append(user_id_array, strconv.Itoa(user_id))
	}
	user_ids := strings.Join(user_id_array, ", ")

	count, err := dbMapper.Connection.SelectInt(
		"select count(Id) from users where Id IN (" + user_ids + ")")
	if count != int64(len(users.UserIds)) || err != nil {
		log.Println("UserIds not valid", users)
		return false
	}

	_, err = dbMapper.Connection.Exec(
		"DELETE FROM board_users WHERE BoardId=?", board.Id)
	if err != nil {
		log.Println("could not delete users from board", board.Id)
		return false
	}

	for _, user_id := range users.UserIds {
		_, err = dbMapper.Connection.Exec(
			"INSERT INTO board_users (BoardId, UserId) "+
				"VALUES (?, ?)", board.Id, user_id)
	}
	if err != nil {
		log.Println("could not insert users", users)
		return false
	}
	UpdateWebsockets(board.Name, "Users updated")
	return true
}
