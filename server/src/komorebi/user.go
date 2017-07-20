package komorebi

import (
	"crypto/md5"
	"encoding/hex"
	"math/rand"
	"strings"
)

type User struct {
	DbModel
	ImagePath    string `json:"image_path"`
	HashedPasswd string `json:"password"`
	Salt         string `json:"-"`
}

type Users []User

func GenerateSalt() string {
	r := make([]byte, 32)
	if _, err := rand.Read(r); err != nil {
		Logger.Printf("failed to get random salt:", err)
	}
	return string(r)
}

func HashPasswd(passwd string, salt string) string {
	hasher := md5.New()
	hasher.Write([]byte(passwd + salt))
	return hex.EncodeToString(hasher.Sum(nil))
}

func Authenticate(name string, passwd string) bool {
	var user User
	err := dbMapper.Connection.SelectOne(&user,
		"select * from users where Name=?", name)
	if err != nil {
		Logger.Printf("authentication failed: error:", err)
		return false
	}

	if FailedLoginCount[name] > 3 {
		return false
	}

	hashed_passwd := HashPasswd(passwd, user.Salt)

	if hashed_passwd == user.HashedPasswd {
		FailedLoginCount[name] = 0
		return true
	} else {
		FailedLoginCount[name] = FailedLoginCount[name] + 1
		return false
	}
}

func NewUser(name string, passwd string, image_path string) User {
	salt := GenerateSalt()
	hashed_passwd := HashPasswd(passwd, salt)
	return User{
		ImagePath:    image_path,
		Salt:         salt,
		HashedPasswd: hashed_passwd,
		DbModel: DbModel{
			Name: name,
		},
	}
}

func (u *User) Save() bool {

	if u.Id != 0 {
		// on update an user, keep the salt
		var old_user User
		dbMapper.Connection.SelectOne(&old_user,
			"select * from users where Id=?", u.Id)
		u.Salt = old_user.Salt

		if len(u.HashedPasswd) <= 0 {
			// update user without setting a new password: keep old password
			u.HashedPasswd = old_user.HashedPasswd
		} else if len(u.HashedPasswd) > 0 {
			// update user with setting a new password
			u.HashedPasswd = HashPasswd(u.HashedPasswd, u.Salt)
		}
	}
	return dbMapper.Save(u)
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
		Logger.Printf("delete of user failed.", errDelete)
		return false
	}
	return true
}

func (u User) Validate() (bool, map[string][]string) {
	success := true
	errors := map[string][]string{}

	if len(u.Name) <= 0 {
		Logger.Printf("User validation failed. Name not present")
		success = false
		errors["name"] = append(errors["name"], "Name not present.")
	}

	var otherUser User
	GetByName(&otherUser, u.Name)
	if otherUser.Id != 0 && otherUser.Id != u.Id {
		Logger.Printf("User validation failed. Name not uniq")
		success = false
		errors["name"] = append(errors["name"], "Name not uniq.")
	}

	return success, errors
}

func GetUsersByBoardId(board_id int) Users {
	users := make([]User, 0)
	var ids []string

	_, err := dbMapper.Connection.Select(&ids,
		"select UserId from board_users where BoardId=?", board_id)
	if err != nil {
		Logger.Printf("Could not get user_ids by board id", board_id)
	}
	user_ids := strings.Join(ids, ", ")

	if len(user_ids) <= 0 {
		return users
	}
	_, err = dbMapper.Connection.Select(&users,
		"select Id, Name, UpdatedAt, ImagePath from users where Id IN ("+user_ids+")")
	if err != nil {
		Logger.Printf("Could not get users by board id", board_id)
	}

	return users
}

func GetUsersByTaskId(task_id int) Users {
	users := make([]User, 0)
	var ids []string

	_, err := dbMapper.Connection.Select(&ids,
		"select UserId from task_users where TaskId=?", task_id)
	if err != nil {
		Logger.Println("Could not get user_ids by task id", task_id)
	}
	user_ids := strings.Join(ids, ", ")

	if len(user_ids) <= 0 {
		return users
	}

	_, err = dbMapper.Connection.Select(&users,
		"select Id, Name, UpdatedAt, ImagePath from users where Id IN ("+user_ids+")")
	if err != nil {
		Logger.Println("Could not get users by task id", task_id)
	}

	return users
}
