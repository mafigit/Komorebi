package main

import (
	"komorebi"
	"log"
	"net/http"
)

var (
	Version   string
	BuildTime string
)

func main() {

	db := komorebi.InitDb("komorebi.db")
	db.AddTable(komorebi.Board{}, "boards")
	db.AddTable(komorebi.Column{}, "columns")
	tableMap := db.AddTable(komorebi.Story{}, "stories")
	tableMap.ColMap("Desc").SetMaxSize(1024)
	tableMap.ColMap("Requirements").SetMaxSize(1024)
	db.CreateTables()

	router := komorebi.NewRouter()

	log.Fatal(http.ListenAndServe(":8080", router))
}
