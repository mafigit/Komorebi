package komorebi

import (
	"log"
)

type User struct {
	DbModel
	ImagePath string `json:"image_path"`
}

type Users []User

func NewUser(name string, image_path string) User {
	return User{
		ImagePath: image_path,
		DbModel: DbModel{
			Name: name,
		},
	}
}

func (u User) Save() bool {
	return dbMapper.Save(&u)
}

func (u User) TableName() string {
	return "users"
}

func (u Users) TableName() string {
	return "users"
}

func (u User) Destroy() bool {
	if u.Id == 0 {
		return true
	}

	if _, errDelete := dbMapper.Connection.Delete(&u); errDelete != nil {
		log.Println("delete of user failed.", errDelete)
		return false
	}
	return true
}

func (u User) Validate() (bool, map[string][]string) {
	success := true
	errors := map[string][]string{}

	if len(u.Name) <= 0 {
		log.Println("User validation failed. Name not present")
		success = false
		errors["name"] = append(errors["name"], "Name not present.")
	}

	var otherUser User
	GetByName(&otherUser, u.Name)
	if otherUser.Id != 0 && otherUser.Id != u.Id {
		log.Println("User validation failed. Name not uniq")
		success = false
		errors["name"] = append(errors["name"], "Name not uniq.")
	}

	if len(u.ImagePath) <= 0 {
		log.Println("User validation failed. ImagePath not present")
		success = false
		errors["image_path"] = append(errors["image_path"],
			"ImagePath not present.")
	}
	return success, errors
}
