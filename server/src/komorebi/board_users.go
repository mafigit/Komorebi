package komorebi

type BoardUsers struct {
	Id      int `json:"id"`
	BoardId int `json:"board_id"`
	UserId  int `json:"user_id"`
}
