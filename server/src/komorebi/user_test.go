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
	success, msg := true, ""
	u := User{
		Name:      "About a boy",
		ImagePath: "/tmp/foo",
	}
	success, msg = u.Validate()
	if success == false {
		t.Error("Should be valid")
	}
	u.Name = ""
	success, msg = u.Validate()
	if success == true || msg != "Name not present.\n" {
		t.Error("Should be invalid by missing name")
	}
	u.Name = "Woot"
	u.ImagePath = ""
	success, msg = u.Validate()
	if success == true || msg != "ImagePath not present.\n" {
		t.Error("Should be invalid by missing ImagePath")
	}
	u2 := User{
		Name:      "Franz",
		ImagePath: "/tmp/foo",
	}
	u2.Save()
	u.Name = u2.Name
	u.ImagePath = "/tmp/foo"
	success, msg = u.Validate()
	if success == true || msg != "Name not uniq.\n" {
		t.Error("Should be invalid by not uniq")
	}
}
