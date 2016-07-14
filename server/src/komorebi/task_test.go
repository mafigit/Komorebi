package komorebi

import (
	"testing"
)

func TestNewTask(t *testing.T) {
	task := NewTask("haensel", "desctip", 1, 5, 1)
	if task.Name != "haensel" {
		t.Error("Should have instanciate a task:", task.Name)
	}
}

func TestTaskCreate(t *testing.T) {
	task := NewTask("haensel", "desctip", 1, 4, 1)
	if !task.Save() {
		t.Error("Should have created the task")
	}

	if task.Name != "haensel" {
		t.Error("Should have saved a user", task.Name)
	}
}

func TestTaskValidation(t *testing.T) {
	success, msg := true, ""
	task := NewTask("haensel", "desctip", 1, 5, 1)
	success, msg = task.Validate()
	if success == false {
		t.Error("Should be valid")
	}
	task.Name = ""
	success, msg = task.Validate()
	if success == true || msg != "Name not present.\n" {
		t.Error("Should be invalid by missing name")
	}
	task.Name = "Woot"
	task.ColumnId = 0
	success, msg = task.Validate()
	if success == true || msg != "ColumnId not present.\n" {
		t.Error("Should be invalid by missing ColumnId")
	}
	task.ColumnId = 1
	task.StoryId = 0
	success, msg = task.Validate()
	if success == true || msg != "StoryId not present.\n" {
		t.Error("Should be invalid by missing StoryId")
	}
}

func TestTaskDelete(t *testing.T) {
	ta := NewTask(
		"Task to delete",
		"A description",
		1,
		1,
		1,
	)
	ta.Save()

	var task Task
	GetByName(&task, "Task to delete")
	if !task.Destroy() {
		t.Error("Should destroy a task")
	}
}
