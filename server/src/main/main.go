package main

import (
	"komorebi"
	"log"
	"net/http"
	"os"
)

var (
	Version   string
	BuildTime string
)

func main() {

	db := komorebi.InitDb("komorebi.db")
	db.AddTable(komorebi.Board{}, "boards")
	db.AddTable(komorebi.Column{}, "columns")
	db.AddTable(komorebi.User{}, "users")
	db.AddTable(komorebi.Task{}, "tasks")
	db.AddTable(komorebi.Dump{}, "dumps")
	db.AddTable(komorebi.BoardUsers{}, "board_users")
	db.AddTable(komorebi.StoryUsers{}, "story_users")
	tableMap := db.AddTable(komorebi.Story{}, "stories")
	tableMap.ColMap("Desc").SetMaxSize(1024)
	tableMap.ColMap("Requirements").SetMaxSize(1024)
	db.CreateTables()

	if len(os.Args) >= 2 && os.Args[1] == "-d" {
		log.Println("Dump cards")
		komorebi.DumpIt()
	} else {
		router := komorebi.NewRouter()
		log.Fatal(http.ListenAndServe(":8080", router))
	}
}
