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
	TableName() string
	Save() bool
	Validate() (bool, map[string][]string)
	Destroy() bool
}

type DbModel struct {
	Id        int    `json:"id"`
	Name      string `json:"name"`
	UpdatedAt int64  `json:"updated_at"`
}

type Models interface {
	TableName() string
}

func (m DbModel) GetId() int {
	return m.Id
}

func (m DbModel) SetUpdatedAt() {
	m.UpdatedAt = time.Now().UnixNano()
}

var dbMapper Db

func InitDb(path string) Db {
	db, err := sql.Open("sqlite3", path)
	checkErr(err, "sql.Open failed")

	if Logger == nil {
		Logger = log.New(os.Stdout, "komorebi:", log.Lmicroseconds)
	}

	// construct a gorp DbMap
	dbmap := &gorp.DbMap{Db: db, Dialect: gorp.SqliteDialect{}}
	dbmap.TraceOn("[gorp]", Logger)

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

func (m *DbModel) PreInsert(s gorp.SqlExecutor) error {
	m.UpdatedAt = time.Now().UnixNano()
	return nil
}

func (m *DbModel) PreUpdate(s gorp.SqlExecutor) error {
	m.UpdatedAt = time.Now().UnixNano()
	return nil
}

func (d Db) Save(i Model) bool {

	if i.GetId() == 0 {
		if err := dbMapper.Connection.Insert(i); err != nil {
			Logger.Printf("create failed", err)
			return false
		}
	} else {
		if _, errUpdate := dbMapper.Connection.Update(i); errUpdate != nil {
			Logger.Printf("update failed", errUpdate)
			return false
		}
	}
	return true
}

func GetById(i Model, id int) bool {
	err := dbMapper.Connection.SelectOne(i, "select * from "+
		i.TableName()+" where Id=?", id)
	if err != nil {
		Logger.Printf("could not find model", err)
		return false
	}
	return true
}

func GetByName(i Model, name string) bool {
	err := dbMapper.Connection.SelectOne(i, "select * from "+
		i.TableName()+" where Name=?", name)
	if err != nil {
		Logger.Printf("could not find model", err)
		return false
	}
	return true
}

func GetAll(i Models) bool {
	_, err := dbMapper.Connection.
		Select(i, "select * from "+
			i.TableName()+" order by Id")
	if err != nil {
		Logger.Printf("could not find model", err)
		return false
	}
	return true
}

func checkErr(err error, msg string) {
	if err != nil {
		Logger.Printf(msg, err)
	}
}
