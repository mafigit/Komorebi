package komorebi

import (
	"database/sql"
	_ "github.com/mattn/go-sqlite3"
	"gopkg.in/gorp.v1"
	"log"
	"os"
)

type Db struct {
	Connection *gorp.DbMap
	Path       string
}

type Model interface {
	GetId() int
}

var dbMapper Db

func InitDb(path string) Db {
	db, err := sql.Open("sqlite3", path)
	checkErr(err, "sql.Open failed")

	// construct a gorp DbMap
	dbmap := &gorp.DbMap{Db: db, Dialect: gorp.SqliteDialect{}}
	dbmap.TraceOn("[gorp]", log.New(os.Stdout, "komorebi:",
		log.Lmicroseconds))

	dbMapper = Db{dbmap, path}
	return dbMapper
}

func (d Db) AddTable(i interface{}, name string) *gorp.TableMap {
	con := d.Connection
	t := con.AddTableWithName(i, name).SetKeys(true, "Id")
	return t
}

func (d Db) CreateTables() {
	// create the table. in a production system you'd generally
	// use a migration tool, or create the tables via scripts
	err := d.Connection.CreateTablesIfNotExists()
	checkErr(err, "Create tables failed")
}

func (d Db) Save(i Model) bool {
	if i.GetId() == 0 {
		if err := dbMapper.Connection.Insert(i); err != nil {
			log.Println("create failed", err)
			return false
		}
	} else {
		if _, errUpdate := dbMapper.Connection.Update(i); errUpdate != nil {
			log.Println("update failed", errUpdate)
			return false
		}
	}
	return true
}

func checkErr(err error, msg string) {
	if err != nil {
		log.Fatalln(msg, err)
	}
}
