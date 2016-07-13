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

	c = NewColumn("WIP", 1, board.Id)
	if success, _ := c.Validate(); success == true {
		t.Error("Column name should be uniq")
	}

	c = NewColumn("", 2, board.Id)
	if success, _ := c.Validate(); success == true {
		t.Error("Column name should be present")
	}

	c = NewColumn("", 2, 99999)
	if success, _ := c.Validate(); success == true {
		t.Error("BoardId should not exists")
	}
}

func TestColumnReorder(t *testing.T) {
	b := NewBoard("testColumnReorder")
	b.Save()
	board := GetBoardColumnViewByName("testColumnReorder")

	c := NewColumn("Backlog", 0, board.Id)
	c.Save()
	c = NewColumn("WIP", 0, board.Id)
	c.Save()
	c = NewColumn("DONE", 0, board.Id)
	c.Save()

	columns := GetColumnsByBoardId(board.Id)
	if columns[0].Name != "Backlog" || columns[0].Position != 0 {
		t.Error("Column 'Backlog' should be the first one")
	}
	if columns[2].Name != "DONE" || columns[2].Position != 2 {
		t.Error("Column 'Done' should be the last one")
	}

	columns[1].Destroy()
	columns = GetColumnsByBoardId(board.Id)

	if columns[0].Name != "Backlog" || columns[0].Position != 0 {
		t.Error("Column 'Backlog' should be the first one")
	}
	if columns[1].Name != "DONE" || columns[1].Position != 1 {
		t.Error("Column 'DONE' should be the last one")
	}

	c = NewColumn("DONE-QS", 0, board.Id)
	c.Save()

	columns = GetColumnsByBoardId(board.Id)
	if columns[0].Name != "Backlog" || columns[0].Position != 0 {
		t.Error("Column 'Backlog' should be the first one")
	}
	if columns[1].Name != "DONE" || columns[1].Position != 1 {
		t.Error("Column 'DONE' should be in the middle")
	}
	if columns[2].Name != "DONE-QS" || columns[2].Position != 2 {
		t.Error("Column 'DONE-QS' should be the last one")
	}
}
