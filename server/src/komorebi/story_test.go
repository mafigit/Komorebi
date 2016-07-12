package komorebi

import (
	"testing"
)

func TestNewStory(t *testing.T) {
	s := NewStory("haensel", "gretel", "requirements", 5, 1)
	if s.Name != "haensel" {
		t.Error("Should have instanciate a story:", s.Name)
	}
}

func TestStoryCreate(t *testing.T) {
	s := NewStory("haensel", "gretel", "requirements", 5, 1)
	s.Save()

	if s.Name != "haensel" {
		t.Error("Should have saved a story", s.Name)
	}
}
