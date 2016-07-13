package komorebi

import (
	"log"
	"time"
)

type User struct {
	Id        int    `json:"id"`
	Name      string `json:"name"`
	CreatedAt int64  `json:"created_at"`
	ImagePath string `json:"image_path"`
}

type Users []User

func NewUser(name string, image_path string) User {
	return User{
		Name:      name,
		ImagePath: image_path,
		CreatedAt: time.Now().UnixNano(),
	}
}

func (u User) GetId() int {
	return u.Id
}

func (u User) Save() bool {
	return dbMapper.Save(&u)
}

func GetUserByName(name string) User {
	var user User
	err := dbMapper.Connection.
		SelectOne(&user, "select * from users where Name=?", name)
	if err != nil {
		log.Println("could not find user with name", err)
		log.Println("could not find user with name", name)
	}
	return user
}

func (u User) Validate() (bool, string) {
	success, message := true, ""

	if len(u.Name) <= 0 {
		log.Println("User validation failed. Name not present")
		success = false
		message += "Name not present.\n"
	}

	otherUser := GetUserByName(u.Name)
	if otherUser.Id != 0 {
		log.Println("User validation failed. Name not uniq")
		success = false
		message += "Name not uniq.\n"
	}

	if len(u.ImagePath) <= 0 {
		log.Println("User validation failed. ImagePath not present")
		success = false
		message += "ImagePath not present.\n"
	}
	return success, message
}
