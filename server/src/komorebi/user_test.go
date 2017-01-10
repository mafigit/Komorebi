package komorebi

import (
	"testing"
)

func TestNewUser(t *testing.T) {
	u := NewUser("haensel", "/tmp/foo")
	if u.Name != "haensel" {
		t.Error("Should have instanciate a user:", u.Name)
	}
}

func TestUserCreate(t *testing.T) {
	u := NewUser("haensel", "/tmp/foo")
	if !u.Save() {
		t.Error("Should have created the user")
	}

	if u.Name != "haensel" {
		t.Error("Should have saved a user", u.Name)
	}
}

func TestUserValidation(t *testing.T) {
	u := NewUser("About a boy", "/tmp/foo")
	success, msg := u.Validate()
	if success == false {
		t.Error("Should be valid")
	}
	u.Name = ""
	success, msg = u.Validate()
	if success == true || !contains(msg["name"], "Name not present.") {
		t.Error("Should be invalid by missing name")
	}
	u.Name = "Woot"
	u.ImagePath = ""
	success, msg = u.Validate()
	if success == true ||
		!contains(msg["image_path"], "ImagePath not present.") {
		t.Error("Should be invalid by missing ImagePath")
	}
	u2 := NewUser("Franz", "/tmp/foo")
	u2.Save()
	u.Name = u2.Name
	u.ImagePath = "/tmp/foo"
	success, msg = u.Validate()
	if success == true || !contains(msg["name"], "Name not uniq.") {
		t.Error("Should be invalid by not uniq")
	}
}

func TestGetById(t *testing.T) {
	var u User
	if !GetById(&u, 1) {
		t.Error("Should get user by Id")
	}
	if u.Name != "haensel" {
		t.Error("Should have name haensel got:", u.Name)
	}
}
