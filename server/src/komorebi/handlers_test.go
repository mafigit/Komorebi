package komorebi

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/gorilla/securecookie"
	"github.com/gorilla/sessions"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestIndexHandler(t *testing.T) {
	req, _ := http.NewRequest("GET", "/", nil)
	w := httptest.NewRecorder()
	Index(w, req)

	fmt.Printf("%d - %s", w.Code, w.Body.String())
	if w.Code != 200 {
		t.Error("Request on / did not succeed")
	}
}

func TestBoardsGetHandler(t *testing.T) {
	req, _ := http.NewRequest("GET", "/boards", nil)
	w := httptest.NewRecorder()

	SessionStore = sessions.NewCookieStore(securecookie.GenerateRandomKey(64))
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

func TestBoardShowHandler(t *testing.T) {
	b := NewBoard("testBoardShow", false)
	b.Save()
	req, _ := http.NewRequest("GET", "/testBoardShow", nil)
	w := httptest.NewRecorder()
	BoardShow(w, req)
	fmt.Printf("body: %d - %s", w.Code, w.Body.String())

	//if w.Code == 404 {
	//		t.Error("Request on /testBoardShow should not return 404")
	//}
}

func TestBoardCreateHandler(t *testing.T) {
	req, _ := http.NewRequest("POST", "/boards",
		bytes.NewBufferString("{\"name\":\"testBoardCreate\"}"))
	w := httptest.NewRecorder()
	BoardCreate(w, req)

	if w.Code != 201 {
		t.Error("Request on /boards did not succeed")
	}

	body := w.Body.String()
	if !strings.Contains(body, "success\":true") {
		t.Error("Response is not success")
	}

	req, _ = http.NewRequest("POST", "/boards",
		bytes.NewBufferString("{\"name\":\"testBoardCreate\"}"))
	w = httptest.NewRecorder()
	BoardCreate(w, req)

	if w.Code == 201 {
		t.Error("Request on /boards should not succeed with non-uniq name")
	}

	body = w.Body.String()
	if strings.Contains(body, "success\":true") {
		t.Error("Response is not success")
	}
}

func TestColumnCreateHandler(t *testing.T) {
	b := NewBoard("test123", false)
	b.Save()
	board := GetBoardNestedByName("test123")
	data := fmt.Sprintf("{\"name\":\"testColumnCreate\",\"board_id\":%d}", board.Id)

	req, _ := http.NewRequest("POST", "/columns",
		bytes.NewBufferString(data))
	w := httptest.NewRecorder()
	ColumnCreate(w, req)

	if w.Code != 201 {
		t.Error("Request on /columns did not succeed")
	}

	body := w.Body.String()
	if !strings.Contains(body, "success\":true") {
		t.Error("Response is not success")
	}

	req, _ = http.NewRequest("POST", "/columns",
		bytes.NewBufferString(data))
	w = httptest.NewRecorder()
	ColumnCreate(w, req)

	if w.Code == 201 {
		t.Error("Request on /columns should not succeed with non-uniq name")
	}

	body = w.Body.String()
	if strings.Contains(body, "success\":true") {
		t.Error("Response is not success")
	}
}

func TestStoryCreateHandler(t *testing.T) {
	b := NewBoard("testStoryCreate", false)
	b.Save()
	var board Board
	GetByName(&board, "testStoryCreate")
	c := NewColumn("testColumn", 0, board.Id)
	c.Save()

	data := fmt.Sprintf("{\"name\":\"testStory\",\"points\":5,\"board_id\":%d}",
		board.Id)

	req, _ := http.NewRequest("POST", "/stories",
		bytes.NewBufferString(data))
	w := httptest.NewRecorder()
	StoryCreate(w, req)

	if w.Code != 201 {
		t.Error("Request on /stories did not succeed")
	}

	body := w.Body.String()
	if !strings.Contains(body, "success\":true") {
		t.Error("Response is not success")
	}
}

func TestTaskCreateHandler(t *testing.T) {
	b := NewBoard("testTaskCreate", false)
	b.Save()
	var board Board
	GetByName(&board, "testTaskCreate")
	c := NewColumn("testColumn", 0, board.Id)
	c.Save()
	var column Column
	columns := GetColumnsByBoardId(board.Id)
	for _, col := range columns {
		if col.Name == "testColumn" {
			column = col
		}
	}
	s := NewStory("testStory", "desc", "req", 4, board.Id, "green", 0)
	s.Save()

	stories := GetStoriesByBoardName(board.Name)
	var story Story
	for _, st := range stories {
		if st.Name == "testStory" {
			story = st
		}
	}

	data := fmt.Sprintf("{\"name\":\"testTask\",\"desc\":\"foo desc\","+
		"\"column_id\":%d,\"story_id\":%d}",
		column.Id, story.Id)

	req, _ := http.NewRequest("POST", "/task",
		bytes.NewBufferString(data))
	w := httptest.NewRecorder()
	TaskCreate(w, req)

	if w.Code != 201 {
		t.Error("Request on /tasks did not succeed")
	}

	body := w.Body.String()
	if !strings.Contains(body, "success\":true") {
		t.Error("Response is not success")
	}
}
