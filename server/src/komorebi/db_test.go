package komorebi

import (
	"math/rand"
	"os"
	"strconv"
	"testing"
)

func TestInitDb(t *testing.T) {
	r := rand.New(rand.NewSource(99))
	rand_int := r.Int()
	rand_str := strconv.Itoa(rand_int)
	tmp_path := "/tmp/komorebi." + rand_str + ".db"
	dbmap := InitDb(tmp_path)

	type Test struct {
		Id   int
		Name string
	}

	dbmap.AddTable(Test{}, "test")
	dbmap.CreateTables()

	if dbmap.Path != tmp_path {
		t.Error("Expected: " + tmp_path + " but got: " + dbmap.Path)
	}

	if _, err := os.Stat(tmp_path); os.IsNotExist(err) {
		t.Error("Expected " + tmp_path + " to exist.")
	}

	os.Remove(tmp_path)
}
