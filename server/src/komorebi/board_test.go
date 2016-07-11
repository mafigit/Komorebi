package komorebi

import (
	"math/rand"
	"os"
	"strconv"
	"testing"
)

func TestNewBoard(t *testing.T) {
	r := rand.New(rand.NewSource(99))
	rand_int := r.Int()
	rand_str := strconv.Itoa(rand_int)
	tmp_path := "/tmp/komorebi." + rand_str + ".db"
	db := InitDb(tmp_path)
	db.AddTable(Board{}, "boards")
	db.CreateTables()

	b := NewBoard("test")
	if b.Name != "test" {
		t.Error("Board should have name test")
	}
	if !b.Save() {
		t.Error("Should save a board")
	}
	os.Remove(tmp_path)
}
