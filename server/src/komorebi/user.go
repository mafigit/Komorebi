package komorebi

import (
	"log"
	"strings"
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

func GetUsersByBoardId(board_id int) Users {
	var users Users
	var ids []string

	_, err := dbMapper.Connection.Select(&ids,
		"select UserId from board_users where BoardId=?", board_id)
	if err != nil {
		log.Println("Could not get user_ids by board id", board_id)
	}
	user_ids := strings.Join(ids, ", ")

	_, err = dbMapper.Connection.Select(&users,
		"select * from users where Id IN ("+user_ids+")")
	if err != nil {
		log.Println("Could not get users by board id", board_id)
	}

	return users
}
