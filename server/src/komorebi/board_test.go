package komorebi

import (
	"fmt"
	"io/ioutil"
	"os"
	"reflect"
	"testing"
)

func TestMain(m *testing.M) {
	file, _ := ioutil.TempFile(os.TempDir(), "komorebi")
	db := InitDb(file.Name())
	tableMap := db.AddTable(Story{}, "stories")
	tableMap.ColMap("Desc").SetMaxSize(1024)
	tableMap.ColMap("Requirements").SetMaxSize(1024)
	db.AddTable(Board{}, "boards")
	db.AddTable(Column{}, "columns")
	db.AddTable(User{}, "users")
	db.AddTable(Task{}, "tasks")
	db.CreateTables()
	fmt.Println("created db " + file.Name())

	//Fixtures
	b := NewBoard("test1")
	b.Save()
	c1 := NewColumn("WIP", 0, 1)
	c2 := NewColumn("TEST", 1, 1)
	c1.Save()
	c2.Save()

	res := m.Run()

	err := os.Remove(file.Name())
	if err != nil {
		fmt.Println("Error while removing file:", err)
	} else {
		fmt.Println("removed file:", file.Name())
	}

	os.Exit(res)
}

func TestBoardDatabase(t *testing.T) {
	b := NewBoard("test")
	if b.Name != "test" {
		t.Error("Board should have name test")
	}
	if !b.Save() {
		t.Error("Should save a board")
	}

	var boards Boards
	GetAll(&boards)
	b = boards[1]
	if b.Name != "test" {
		t.Error("Board should have name test", b.Name)
	}
	if b.Id != 2 {
		t.Error("Should return 2 board:", b.Id)
	}

	b.Name = "update"
	if !b.Save() {
		t.Error("Should have saved the board", b.Name)
	}
	var new_boards Boards
	GetAll(&new_boards)
	lenBoards := len(new_boards)
	if lenBoards < 2 {
		t.Error("Should retrieve all boards")
	}
	b = new_boards[1]
	if b.Name != "update" {
		t.Error("Should have updated the name to", b.Name)
	}

	c1 := NewColumn("WIP", 0, b.Id)
	c2 := NewColumn("TEST", 1, b.Id)
	c1.Save()
	c2.Save()

	bDelete := new_boards[0]
	if bDelete.Id != 1 {
		t.Error("Unexpeted board to delete")
	}
	if !bDelete.Destroy() {
		t.Error("Should destroy a board")
	}
	var other_boards Boards
	GetAll(&other_boards)
	newlenboards := len(other_boards)
	if lenBoards != (newlenboards + 1) {
		t.Error("Did not destroy the board")
	}

	var board Board
	GetByName(&board, b.Name)
	if board.Name != "update" {
		t.Error("Should retrive a Board:", board.Name)
	}
	if len(GetColumnsByBoardId(board.Id)) <= 0 {
		t.Error("Could not find any board columns")
	}
	bcv1 := GetColumnsByBoardId(board.Id)[0]
	if bcv1.Name != "WIP" {
		t.Error("Should retrive columns with Board")
	}
}

func TestBoardValidation(t *testing.T) {
	b := NewBoard("testValidation")
	if success, _ := b.Validate(); success == false {
		t.Error("Name 'testValidation' should be valid")
	}

	b = NewBoard("test foo")
	if success, _ := b.Validate(); success == true {
		t.Error("Name 'test foo' should not be valid")
	}

	b = NewBoard("gz")
	b.Save()

	b = NewBoard("gz")
	if success, _ := b.Validate(); success == true {
		t.Error("Name 'gz' should be uniq")
	}
}

func TestBoardNested(t *testing.T) {
	b := NewBoard("testValidationFoobar")
	b.Save()
	var board Board
	GetByName(&board, b.Name)

	c := NewColumn("WIP", 0, board.Id)
	c.Save()
	c = NewColumn("DONE", 0, board.Id)
	c.Save()
	cols := GetColumnsByBoardId(board.Id)

	s := NewStory("Story 1", "description", "Do this and that", 5, 4,
		board.Id)
	s.Save()
	s = NewStory("Story 2", "description 2", "Do this and that", 3, 4,
		board.Id)
	s.Save()
	stories := GetStoriesByBoardName(board.Name)
	task := NewTask("task for story2", "desctip", stories[1].Id, cols[1].Id, 1)
	task.Save()
	res1 := GetBoardNestedByName(board.Name)
	res2 := GetBoardNestedByName(board.Name)
	if !reflect.DeepEqual(res1, res2) {
		t.Error("should be equal")
	}
	if res1.Name != "testValidationFoobar" {
		t.Error("Board name should be 'testValidationFoobar'")
	}
	if res1.Columns[0].Name != "WIP" {
		t.Error("First Column name should be 'WIP'. Is:", res1.Columns[0].Name)
	}
	s_ws := res1.StoriesNested[0]
	if s_ws.Name != "Story 1" {
		t.Error("First story of column 'WIP' should be 'Story 1'")
	}
	stories = GetStoriesByBoardName(board.Name)
	stories[0].Name = "fooo"
	stories[0].Save()

	ta := res1.StoriesNested[1].Tasks[0]
	if ta.Name != task.Name {
		t.Error("Task in story 2 should be 'task for story2'. Is:", ta.Name)
	}

	if s_ws.Name != "Story 1" {
		t.Error("First story of column 'WIP' should be 'Story 1'")
	}

	res2 = GetBoardNestedByName(board.Name)

	if reflect.DeepEqual(res1, res2) {
		t.Error("should not be equal res1: ", res1)
		t.Error("should not be equal res2: ", res1)
	}
}

func TestBoardNestedDelete(t *testing.T) {
	b := NewBoard("testNestedDelete")
	b.Save()
	var board Board
	GetByName(&board, b.Name)

	c := NewColumn("ColumnToDelete", 0, board.Id)
	c.Save()
	var column Column
	GetByName(&column, c.Name)

	s := NewStory(
		"Storytodelete",
		"description",
		"Do this and that",
		5,
		4,
		board.Id,
	)
	s.Save()
	var story Story
	GetByName(&story, s.Name)

	ta := NewTask(
		"TasktoDelete",
		"a desc",
		story.Id,
		column.Id,
		1,
	)
	ta.Save()
	var task Task
	GetByName(&task, ta.Name)

	board.Destroy()

	if GetByName(&board, board.Name) {
		t.Error("Board should be deleted")
	}

	if GetByName(&column, c.Name) {
		t.Error("column should be deleted")
	}

	if GetByName(&story, s.Name) {
		t.Error("story should be deleted")
	}

	if GetByName(&task, ta.Name) {
		t.Error("task should be deleted")
	}
}
