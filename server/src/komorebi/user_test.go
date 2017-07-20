package komorebi

import (
	"testing"
)

func TestNewUser(t *testing.T) {
	u := NewUser("haensel", "1234", "/tmp/foo")
	if u.Name != "haensel" {
		t.Error("Should have instanciate a user:", u.Name)
	}
	if len(u.HashedPasswd) <= 0 || u.HashedPasswd == "" ||
		u.HashedPasswd == "1234" {
		t.Error("Should have a hashed passwd:", u.HashedPasswd)
	}
}

func TestUserCreate(t *testing.T) {
	u := NewUser("haensel", "1234", "/tmp/foo")
	if !u.Save() {
		t.Error("Should have created the user")
	}

	if u.Name != "haensel" {
		t.Error("Should have saved a user", u.Name)
	}
	if len(u.HashedPasswd) <= 0 || u.HashedPasswd == "" ||
		u.HashedPasswd == "1234" {
		t.Error("Should have a hashed passwd:", u.HashedPasswd)
	}
}

func TestUserValidation(t *testing.T) {
	u := NewUser("About a boy", "abcd", "/tmp/foo")
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
	u2 := NewUser("Franz", "abcd", "/tmp/foo")
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

func TestUserAuthentication(t *testing.T) {
	// we have to set the global variable because the initialiation
	// in main() is not executed in a test
	FailedLoginCount = make(map[string]int)

	u := NewUser("herbert", "secure", "/images/herbert.jpg")
	u.Save()
	defer u.Destroy()
	if Authenticate("herbert", "secure") == false {
		t.Error("Authentication failed")
	}
}

func TestUserLock(t *testing.T) {
	// we have to set the global variable because the initialiation
	// in main() is not executed in a test
	FailedLoginCount = make(map[string]int)

	u := NewUser("herbert", "secure", "/images/herbert.jpg")
	u.Save()
	defer u.Destroy()
	if Authenticate("herbert", "secure") == false {
		t.Error("Authentication failed")
	}
	// fail login four times with wrong password
	Authenticate("herbert", "wrong")
	Authenticate("herbert", "wrong1")
	Authenticate("herbert", "wrong2")
	Authenticate("herbert", "wrong3")

	if Authenticate("herbert", "secure") == true {
		t.Error("User should be locked after four wrong logins")
	}
}
