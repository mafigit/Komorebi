package komorebi

import (
	"github.com/gorilla/sessions"
	"net/http"
)

func CreateSession(w http.ResponseWriter, r *http.Request, username string) {
	session := getSession(w, r) //get session or creates a session

	session.Values["logged_id"] = "true"
	session.Values["username"] = username
	if err := SessionStore.Save(r, w, session); err != nil {
		Logger.Printf("error on saving session ", err)
	}
}

func DestroySession(w http.ResponseWriter, r *http.Request) {
	session := getSession(w, r)
	session.Values["logged_in"] = nil
	session.Options = &sessions.Options{
		MaxAge: -1,
	}
	if err := SessionStore.Save(r, w, session); err != nil {
		Logger.Printf("error on saving session ", err)
	}
}

func LoggedIn(w http.ResponseWriter, r *http.Request) bool {
	session := getSession(w, r)
	return session.Values["logged_id"] != nil
}

func getSession(w http.ResponseWriter, r *http.Request) *sessions.Session {
	session, err := SessionStore.Get(r, "loginSession")

	if err != nil {
		Logger.Printf("error on getting session ", err)
	}
	return session
}

func BoardAuthorized(w http.ResponseWriter, r *http.Request, board_name string) bool {
	sess := getSession(w, r)
	sess_user := sess.Values["username"]
	if sess_user == nil {
		return false
	}

	authorized, err := dbMapper.Connection.SelectInt(
		"Select 1 from board_users LEFT JOIN boards "+
			"ON boards.Id = board_users.BoardId LEFT JOIN users "+
			"ON board_users.UserId = users.Id WHERE boards.Name = ? "+
			"AND users.Name = ?", board_name, sess_user)

	if err != nil || authorized != 1 {
		return false
	}
	return true
}
