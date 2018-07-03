package komorebi

type Migration struct {
	Id    int
	MigNr int
}

func RunMigrations() {

	mig_numbers := map[int]func(){
		1: addIsAdminToUser,
		2: addDisabledToUser,
	}

	for mig_nr, method := range mig_numbers {
		exists, _ := dbMapper.Connection.SelectInt(
			"select 1 from migrations where MigNr = ?",
			mig_nr)
		if exists != 1 {
			method()
			dbMapper.Connection.Exec(
				"insert into migrations (MigNr) VALUES (?)", mig_nr)
		}
	}
}

func addIsAdminToUser() {
	_, err := dbMapper.Connection.Exec(
		"ALTER TABLE users ADD COLUMN IsAdmin integer")
	if err != nil {
		Logger.Printf("could not add IsAdmin to users", err)
		return
	}
	_, err = dbMapper.Connection.Exec(
		"UPDATE users SET IsAdmin=0")
	if err != nil {
		Logger.Printf("could not set IsAdmin on users", err)
	}
}

func addDisabledToUser() {
	_, err := dbMapper.Connection.Exec(
		"ALTER TABLE users ADD COLUMN Disabled integer")
	if err != nil {
		Logger.Printf("could not add Disabled to users", err)
		return
	}
	_, err = dbMapper.Connection.Exec(
		"UPDATE users SET Disabled=0")
	if err != nil {
		Logger.Printf("could not set Disabled on users", err)
	}
}
