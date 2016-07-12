package komorebi

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestIndex(t *testing.T) {
	req, _ := http.NewRequest("GET", "/", nil)
	w := httptest.NewRecorder()
	Index(w, req)

	fmt.Printf("%d - %s", w.Code, w.Body.String())
	if w.Code != 200 {
		t.Error("Request on / did not succeed")
	}
}

func TestBoardsGet(t *testing.T) {
	req, _ := http.NewRequest("GET", "/boards", nil)
	w := httptest.NewRecorder()
	BoardsGet(w, req)

	fmt.Printf("%d - %s", w.Code, w.Body.String())
	if w.Code != 200 {
		t.Error("Request on /boards did not succeed")
	}
	var boards Boards
	json.NewDecoder(w.Body).Decode(&boards)
	if boards[0].Name != "update" {
		t.Error("Request should contain a board with name update")
	}
}
