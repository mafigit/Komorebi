package komorebi

import (
	"io/ioutil"
	"os"
	"testing"
)

func TestMain(m *testing.M) {
	file, _ := ioutil.TempFile(os.TempDir(), "komorebi")
	db := InitDb(file.Name())
	db.AddTable(Board{}, "boards")
	db.AddTable(Column{}, "columns")
	db.CreateTables()

	res := m.Run()

	defer os.Remove(file.Name())

	os.Exit(res)
}

func TestNewBoard(t *testing.T) {

	b := NewBoard("test")
	if b.Name != "test" {
		t.Error("Board should have name test")
	}
	if !b.Save() {
		t.Error("Should save a board")
	}

	boards := GetAllBoards()
	b = boards[0]
	if b.Name != "test" {
		t.Error("Board should have name test")
	}
	if b.Id != 1 {
		t.Error("Should return 1 board")
	}

	c1 := NewColumn("WIP", 0, b.Id)
	c2 := NewColumn("TEST", 1, b.Id)
	c1.Save()
	c2.Save()

	boardView := GetBoardColumnViewByName(b.Name)
	if boardView.Name != "test" {
		t.Error("Should retrive a BoardColumnView")
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
	if !b.Validate() {
		t.Error("Name 'testValidation' should be valid")
	}

	b = NewBoard("test foo")
	if b.Validate() {
		t.Error("Name 'test foo' should not be valid")
	}

	b = NewBoard("gz")
	b.Save()

	b = NewBoard("gz")
	if b.Validate() {
		t.Error("Name 'gz' should be uniq")
	}
}
