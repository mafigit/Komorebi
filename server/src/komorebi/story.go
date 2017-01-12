package komorebi

import (
	"log"
	"strconv"
	"strings"
)

type Story struct {
	DbModel
	Desc         string `json:"desc"`
	Points       int    `json:"points"`
	Requirements string `json:"requirements"`
	BoardId      int    `json:"board_id"`
	Archived     bool   `json:"archived"`
}

type StoryNested struct {
	DbModel
	Desc         string `json:"desc"`
	Points       int    `json:"points"`
	Requirements string `json:"requirements"`
	BoardId      int    `json:"board_id"`
	Tasks        `json:"tasks"`
	Archived     bool `json:"archived"`
}

type Stories []Story
type StoriesNested []StoryNested

func NewStory(name string, desc string, requirements string, points int,
	boardId int) Story {

	return Story{
		DbModel: DbModel{
			Name: name,
		},
		Requirements: requirements,
		Points:       points,
		BoardId:      boardId,
		Desc:         desc,
		Archived:     false,
	}
}

func GetStoriesByBoardName(board_name string) Stories {
	var stories Stories

	_, err := dbMapper.Connection.
		Select(&stories, "select stories.* from stories left join "+
			"boards on boards.Id = stories.BoardId where "+
			"boards.Name =?", board_name)
	if err != nil {
		log.Println("could not find boards")
	}
	return stories
}

func GetStoriesByBoardId(id int) Stories {
	var stories Stories

	_, err := dbMapper.Connection.
		Select(&stories, "select * from stories "+
			"where BoardId=? order by Id", id)
	if err != nil {
		log.Println("could not find stories")
	}
	return stories
}

func GetStoryById(id int) Story {
	var story Story
	err := dbMapper.Connection.SelectOne(&story,
		"select * from stories where Id=? ", id)
	if err != nil {
		log.Println("could not find story", id)
	}
	return story
}

func (s Story) TableName() string {
	return "stories"
}

func (s Story) Save() bool {
	if !dbMapper.Save(&s) {
		return false
	}
	var board Board
	GetById(&board, s.BoardId)
	UpdateWebsockets(board.Name, "Story updated")
	return true
}

func (s Story) Destroy() bool {
	if s.Id == 0 {
		return true
	}

	tasks := GetTasksByStoryId(s.Id)
	for _, task := range tasks {
		task.Destroy()
	}

	if _, errDelete := dbMapper.Connection.Delete(&s); errDelete != nil {
		log.Println("delete of story failed.", errDelete)
		return false
	}

	var board Board
	GetById(&board, s.BoardId)
	UpdateWebsockets(board.Name, "Story deleted")

	return true
}

func GetTasksByStoryId(story_id int) Tasks {
	var tasks Tasks

	_, err := dbMapper.Connection.Select(&tasks,
		"select * from tasks where StoryId=? order by Id ", story_id)
	if err != nil {
		log.Println("Error while fetching tasks", story_id)
	}
	return tasks
}

func (s Story) Validate() (bool, map[string][]string) {
	success := true
	errors := map[string][]string{}

	if len(s.Name) <= 0 {
		log.Println("Story validation failed. Name not present")
		success = false
		errors["name"] = append(errors["name"], "Name not present.")
	}
	if s.Points <= 0 {
		log.Println("Story validation failed. Points out of range.")
		success = false
		errors["points"] = append(errors["points"], "Points out of range.")
	}
	if s.BoardId <= 0 {
		log.Println("Story validation failed. BoardId not set.")
		success = false
		errors["board_id"] = append(errors["board_id"], "BoardId not set.")
	}

	return success, errors
}

func AddUsersToStory(story Story, users UserIds) bool {
	user_id_array := []string{}
	for _, user_id := range users.UserIds {
		user_id_array = append(user_id_array, strconv.Itoa(user_id))
	}
	user_ids := strings.Join(user_id_array, ", ")

	count, err := dbMapper.Connection.SelectInt(
		"select count(Id) from users where Id IN (" + user_ids + ")")
	if count != int64(len(users.UserIds)) || err != nil {
		log.Println("UserIds not valid", users)
		return false
	}

	_, err = dbMapper.Connection.Exec(
		"DELETE FROM story_users WHERE StoryId=?", story.Id)
	if err != nil {
		log.Println("could not delete users from story", story.Id)
		return false
	}

	for _, user_id := range users.UserIds {
		_, err = dbMapper.Connection.Exec(
			"INSERT INTO story_users (StoryId, UserId) "+
				"VALUES (?, ?)", story.Id, user_id)
	}
	if err != nil {
		log.Println("could not insert users", users)
		return false
	}
	return true
}
