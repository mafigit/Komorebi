package komorebi

import (
	"database/sql"
	_ "github.com/mattn/go-sqlite3"
	"gopkg.in/gorp.v1"
	"log"
	"os"
	"time"
)

type Db struct {
	Connection *gorp.DbMap
	Path       string
}

type Model interface {
	GetId() int
	SetUpdatedAt()
	SetCreatedAt(int64)
	TableName() string
	Save() bool
	Validate() (bool, string)
	GetCreatedAt() int64
}

type DbModel struct {
	Id        int    `json:"id"`
	Name      string `json:"name"`
	CreatedAt int64  `json:"created_at"`
	UpdatedAt int64  `json:"updated_at"`
}

type Models interface {
	TableName() string
}

func (m DbModel) GetId() int {
	return m.Id
}

func (m DbModel) GetCreatedAt() int64 {
	return m.CreatedAt
}

func (m DbModel) SetCreatedAt(time int64) {
	m.CreatedAt = time
}

func (m DbModel) SetUpdatedAt() {
	m.UpdatedAt = time.Now().UnixNano()
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

	i.SetUpdatedAt()
	if i.GetId() == 0 {
		if err := dbMapper.Connection.Insert(i); err != nil {
			log.Println("create failed", err)
			return false
		}
	} else {
		var time int64
		err := dbMapper.Connection.SelectOne(&time, "select CreatedAt from "+
			i.TableName()+" where Id=?", i.GetId())
		if err != nil {
			log.Println("could not fetch CreatedAt", err)
			return false
		}
		i.SetCreatedAt(time)
		if _, errUpdate := dbMapper.Connection.Update(i); errUpdate != nil {
			log.Println("update failed", errUpdate)
			return false
		}
	}
	return true
}

func GetById(i Model, id int) bool {
	err := dbMapper.Connection.SelectOne(i, "select * from "+
		i.TableName()+" where Id=?", id)
	if err != nil {
		log.Println("could not find model", err)
		return false
	}
	return true
}

func GetByName(i Model, name string) bool {
	err := dbMapper.Connection.SelectOne(i, "select * from "+
		i.TableName()+" where Name=?", name)
	if err != nil {
		log.Println("could not find model", err)
		return false
	}
	return true
}

func GetAll(i Models) bool {
	_, err := dbMapper.Connection.
		Select(i, "select * from "+
			i.TableName()+" order by id")
	if err != nil {
		log.Println("could not find model", err)
		return false
	}
	return true
}

func checkErr(err error, msg string) {
	if err != nil {
		log.Fatalln(msg, err)
	}
}
