package komorebi

import (
	"math/rand"
	"os"
	"strconv"
	"testing"
)

func TestNewColumn(t *testing.T) {
	r := rand.New(rand.NewSource(99))
	rand_int := r.Int()
	rand_str := strconv.Itoa(rand_int)
	tmp_path := "/tmp/komorebi." + rand_str + ".db"
	db := InitDb(tmp_path)
	db.AddTable(Column{}, "columns")
	db.CreateTables()

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
	os.Remove(tmp_path)
}
