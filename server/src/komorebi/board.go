package komorebi

type Board struct {
	Id      int      `json:"id"`
	Columns []Column `json:"columns"`
	Name    string   `json:"name"`
}

type Boards []Board
