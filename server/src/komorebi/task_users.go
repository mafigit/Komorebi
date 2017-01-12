package komorebi

type TaskUsers struct {
	Id     int `json:"id"`
	TaskId int `json:"task_id"`
	UserId int `json:"user_id"`
}
