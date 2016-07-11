package komorebi

import (
	"database/sql"
	_ "github.com/mattn/go-sqlite3"
	"gopkg.in/gorp.v1"
	"log"
)

type DbMap struct {
	Connection *gorp.DbMap
	Path       string
}

func initDbMap(path string) DbMap {
	db, err := sql.Open("sqlite3", path)
	checkErr(err, "sql.Open failed")

	// construct a gorp DbMap
	dbmap := &gorp.DbMap{Db: db, Dialect: gorp.SqliteDialect{}}

	return DbMap{dbmap, path}
}

func checkErr(err error, msg string) {
	if err != nil {
		log.Fatalln(msg, err)
	}
}
