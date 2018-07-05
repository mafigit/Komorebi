package main

import (
	"flag"
	"github.com/gorilla/context"
	"github.com/gorilla/securecookie"
	"github.com/gorilla/sessions"
	"komorebi"
	"log"
	"net/http"
	"os"
	"time"
)

var (
	Version   string
	BuildTime string
)

func main() {

	port := flag.String("port", "", "Listening port (default 8080)")
	logfile := flag.String("logfile", "", "Logfile (default stdout)")
	dump := flag.Bool("dump", false, "Dump stories, make a snapshot")
	clear_board := flag.String("clear", "", "Clears dump from given board")
	flag.StringVar(&komorebi.PublicDir, "publicdir", "public/", "Public directory")
	flag.StringVar(&komorebi.HookDir, "hookdir", "hooks/", "Directory for hooks")

	server_crt := flag.String("crt", "", "Server cert file for https")
	server_key := flag.String("key", "", "Server key file for https")

	flag.Parse()

	if len(*logfile) > 0 {
		f, err := os.OpenFile(*logfile, os.O_APPEND|os.O_CREATE|os.O_RDWR, 0666)
		if err != nil {
			log.Printf("error opening logfile: %v", err)
		}
		defer f.Close()
		komorebi.Logger = log.New(f, "komorebi:", log.Lmicroseconds)
	} else {
		komorebi.Logger = log.New(os.Stdout, "komorebi:", log.Lmicroseconds)
	}

	komorebi.Logger.Printf("starting ")

	db := komorebi.InitDb("komorebi.db")
	db.AddTable(komorebi.Board{}, "boards")
	db.AddTable(komorebi.Column{}, "columns")
	db.AddTable(komorebi.User{}, "users")
	db.AddTable(komorebi.Task{}, "tasks")
	db.AddTable(komorebi.Dump{}, "dumps")
	db.AddTable(komorebi.BoardUsers{}, "board_users")
	db.AddTable(komorebi.TaskUsers{}, "task_users")
	db.AddTable(komorebi.DodTemplate{}, "dod_templates")
	db.AddTable(komorebi.Dod{}, "dods")
	db.AddTable(komorebi.Migration{}, "migrations")
	tableMap := db.AddTable(komorebi.Story{}, "stories")
	tableMap.ColMap("Desc").SetMaxSize(1024)
	tableMap.ColMap("Requirements").SetMaxSize(1024)
	db.CreateTables()

	komorebi.RunMigrations()

	if *dump {
		komorebi.Logger.Printf("Dump tasks")
		komorebi.DumpIt()
		os.Exit(0)
	}
	if len(*clear_board) > 0 {
		komorebi.Logger.Printf("Clear dump for board", *clear_board)
		komorebi.ClearDump(*clear_board)
		os.Exit(0)
	}
	komorebi.SessionStore = sessions.NewCookieStore(securecookie.GenerateRandomKey(64))
	komorebi.SessionStore.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   60 * 60 * 24 * 7,
		Secure:   false,
		HttpOnly: false,
	}

	komorebi.FailedLoginCount = make(map[string]int)

	ticker := time.NewTicker(time.Hour * 24)
	go func() {
		for _ = range ticker.C {

			// Clear FailedLoginCount
			komorebi.FailedLoginCount = make(map[string]int)

			weekday := time.Now().Weekday().String()
			if weekday == "Sunday" || weekday == "Saturday" {
				komorebi.Logger.Printf("Skip periodic task dump")
				continue
			}
			komorebi.Logger.Printf("Periodic task dump")
			komorebi.DumpIt()
		}
	}()

	router := komorebi.NewRouter()

	if len(*server_crt) > 0 && len(*server_key) > 0 {
		if len(*port) <= 0 {
			*port = "443"
		}
		log.Fatal(http.ListenAndServeTLS(":"+*port, *server_crt, *server_key,
			context.ClearHandler(router)))
	} else {
		if len(*port) <= 0 {
			*port = "8080"
		}
		log.Fatal(http.ListenAndServe(":"+*port, context.ClearHandler(router)))
	}
}
