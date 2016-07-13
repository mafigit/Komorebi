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

	boardView := GetBoardColumnViewByName(b.Name)
	if boardView.Name != "update" {
		t.Error("Should retrive a BoardColumnView:", boardView.Name)
	}
	if len(boardView.Columns) <= 0 {
		t.Error("Could not find any boardViews columns")
	}
	bcv1 := boardView.Columns[0]
	if bcv1.Name != "WIP" {
		t.Error("Should retrive columns with BoardColumnView")
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

func TestBoardWs(t *testing.T) {
	b := NewBoard("testValidationFoobar")
	b.Save()
	board := GetBoardColumnViewByName(b.Name)

	c := NewColumn("WIP", 0, board.Id)
	c.Save()
	c = NewColumn("DONE", 0, board.Id)
	c.Save()
	cols := GetColumnsByBoardId(board.Id)

	s := Story{
		Name:         "Story 1",
		Desc:         "description",
		Points:       5,
		Requirements: "Do this and that",
		ColumnId:     cols[0].Id,
	}
	s.Save()
	s = Story{
		Name:         "Story 2",
		Desc:         "description 2",
		Points:       3,
		Requirements: "Do this and that",
		ColumnId:     cols[1].Id,
	}
	s.Save()
	res1 := GetBoardWsByName(board.Name)
	res2 := GetBoardWsByName(board.Name)
	if !reflect.DeepEqual(res1, res2) {
		t.Error("should be equal")
	}
	if res1.Name != "testValidationFoobar" {
		t.Error("Board name should be 'testValidationFoobar'")
	}
	if res1.ColumnsWs[0].Name != "WIP" {
		t.Error("First Column name should be 'WIP'. Is:", res1.ColumnsWs[0].Name)
	}
	if res1.ColumnsWs[0].Stories[0].Name != "Story 1" {
		t.Error("First story of column 'WIP' should be 'Story 1'")
	}
	stories := GetStoriesByBoradName(board.Name)
	stories[0].Name = "fooo"
	stories[0].Save()
	res2 = GetBoardWsByName(board.Name)

	if reflect.DeepEqual(res1, res2) {
		t.Error("should not be equal")
	}
}
