package komorebi

type Column struct {
	Id       int    `json:"id"`
	Name     string `json:"name"`
	Position int    `json:"position"`
	BoardId  int    `json:"boardId"`
}

type Columns []Column
