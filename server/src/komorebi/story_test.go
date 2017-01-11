package komorebi

import (
	"testing"
)

func contains(s []string, e string) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}

func TestNewStory(t *testing.T) {
	s := NewStory("haensel", "gretel", "requirements", 5, 4, 1)
	if s.Name != "haensel" {
		t.Error("Should have instanciate a story:", s.Name)
	}
	if s.Archived != false {
		t.Error("A new Story schould not be archived:", s.Archived)
	}
}

func TestStoryCreate(t *testing.T) {
	s := NewStory("haensel", "gretel", "requirements", 5, 4, 1)
	if !s.Save() {
		t.Error("Should have created the story")
	}

	if s.Name != "haensel" {
		t.Error("Should have saved a story", s.Name)
	}
}

func TestStoryValidation(t *testing.T) {
	s := NewStory("About a boy", "A meaningful description",
		"Do this and that", 5, 4, 1)
	success, msg := s.Validate()
	if success == false {
		t.Error("Should be valid")
	}
	s.Name = ""
	success, msg = s.Validate()
	if success == true || !contains(msg["name"], "Name not present.") {
		t.Error("Should be invalid by missing name")
	}
	s.Name = "Woot"
	s.Points = 0
	success, msg = s.Validate()
	if success == true || !contains(msg["points"], "Points out of range.") {
		t.Error("Should be invalid by missing points")
	}
	s.Points = 5
	s.BoardId = 0
	success, msg = s.Validate()
	if success == true || !contains(msg["board_id"], "BoardId not set.") {
		t.Error("Should be invalid by missing board id")
	}
	s.BoardId = 5
	s.Priority = 0
	success, msg = s.Validate()
	if success == true ||
		!contains(msg["priority"], "Priority out of range.") {
		t.Error("Should be invalid by priority")
	}
	s.Points = 11
	success, msg = s.Validate()
	if success == true ||
		!contains(msg["priority"], "Priority out of range.") {
		t.Error("Should be invalid by priority")
	}
}

func TestStoryDelete(t *testing.T) {
	s := NewStory(
		"Story to delete",
		"A description",
		"a lot of requirements",
		5,
		3,
		1,
	)
	s.Save()

	var story Story
	GetByName(&story, "Story to delete")
	if !story.Destroy() {
		t.Error("Should destroy a story")
	}
}
