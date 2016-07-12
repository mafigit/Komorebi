package komorebi

import (
	"testing"
)

func TestNewColumn(t *testing.T) {
	b := NewColumn("test", 0, 1)
	if b.Name != "test" {
		t.Error("Column should have name test has: ", b.Name)
	}
	if b.Position != 0 {
		t.Error("Column should have position 0 has: ", b.Position)
	}
	if b.BoardId != 1 {
		t.Error("Column should have board id 1 has:", b.BoardId)
	}
	if !b.Save() {
		t.Error("Should save a board")
	}
}

func TestColumnValidation(t *testing.T) {
	b := NewBoard("testColumnValidation")
	b.Save()
	board := GetBoardColumnViewByName("testColumnValidation")

	c := NewColumn("WIP", 0, board.Id)
	if success, _ := c.Validate(); success == false {
		t.Error("Column should be valid with name: ", c.Name)
	}
	c.Save()

	c = NewColumn("Test", 0, board.Id)
	if success, _ := c.Validate(); success == true {
		t.Error("Column position should be uniq")
	}

	c = NewColumn("WIP", 1, board.Id)
	if success, _ := c.Validate(); success == true {
		t.Error("Column name should be uniq")
	}

	c = NewColumn("", 2, board.Id)
	if success, _ := c.Validate(); success == true {
		t.Error("Column name should be present")
	}
}
