package komorebi

type Dod struct {
	DbModel
	Comment string `json:"comment"`
	State   int    `json:"state"`
	StoryId int    `json:"story_id"`
}

type DodTemplate struct {
	Id      int
	Name    string `json:"name"`
	BoardId int
}

type Dods []Dod
type DodTemplates []DodTemplate

func NewDod(name string, story_id int) Dod {
	return Dod{
		StoryId: story_id,
		DbModel: DbModel{
			Name: name,
		},
	}
}

func (d Dod) Save() bool {
	return dbMapper.Save(&d)
}

func (d Dod) TableName() string {
	return "dods"
}

func (d Dods) TableName() string {
	return "dods"
}

func (d Dod) Destroy() bool {
	if d.Id == 0 {
		return true
	}

	if _, errDelete := dbMapper.Connection.Delete(&d); errDelete != nil {
		Logger.Printf("delete of dod failed.", errDelete)
		return false
	}
	return true
}

func (d Dod) Validate() (bool, map[string][]string) {
	success := true
	errors := map[string][]string{}

	if len(d.Name) <= 0 {
		Logger.Printf("Definition of Done validation failed. Name not present")
		success = false
		errors["name"] = append(errors["name"], "Name not present.")
	}

	if d.StoryId <= 0 {
		Logger.Printf("Definition of Done  validation failed. StoryId missing")
		success = false
		errors["story_id"] = append(errors["story_id"], "StoryId not present.")
	}

	return success, errors
}

func GetDodsByStory(story Story) []Dod {
	dods := make([]Dod, 0)
	_, err := dbMapper.Connection.Select(&dods,
		"select * from dods where StoryId=?", story.Id)
	if err != nil {
		Logger.Printf("could not get dods from story", story.Name)
	}
	if len(dods) == 0 {
		var board Board
		GetById(&board, story.BoardId)
		for _, dod_name := range GetDodsTemplatesByBoardName(board.Name).DodNames {
			dod := NewDod(dod_name, story.Id)
			dod.Save()
		}
		dbMapper.Connection.Select(&dods,
			"select * from dods where StoryId=?", story.Id)
	}
	return dods
}

func GetDodsTemplatesByBoardName(board_name string) DodNames {
	var dods DodNames

	_, err := dbMapper.Connection.Select(&dods.DodNames,
		"select dod_templates.Name from dod_templates left join boards "+
			"ON boards.ID = dod_templates.BoardId where boards.Name=?", board_name)
	if err != nil {
		Logger.Printf("could not get dod templates from board", board_name)
	}
	return dods
}

func UpdateDods(dods Dods) bool {
	for _, dod := range dods {
		success, _ := dod.Validate()
		if success == false {
			return false
		}
		if dod.Save() == false {
			return false
		}
	}
	return true
}

func UpdateDodsFromBoard(dods DodNames, board Board) bool {
	_, err := dbMapper.Connection.Exec(
		"DELETE FROM dod_templates WHERE BoardId=?", board.Id)
	if err != nil {
		Logger.Printf("could not delete dod templates", dods)
		return false
	}
	for _, dod_name := range dods.DodNames {
		_, err := dbMapper.Connection.Exec(
			"INSERT INTO dod_templates (Name, BoardId) "+
				"VALUES (?, ?)", dod_name, board.Id)
		if err != nil {
			Logger.Printf("could not insert dod templates", dods)
			return false
		}
	}
	UpdateWebsockets(board.Name, "Definition of Dones updated")
	return true
}
