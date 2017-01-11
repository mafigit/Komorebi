package komorebi

type StoryUsers struct {
	Id      int `json:"id"`
	StoryId int `json:"story_id"`
	UserId  int `json:"user_id"`
}
