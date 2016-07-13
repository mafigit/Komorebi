package komorebi

import (
	"github.com/gorilla/mux"
	"net/http"
)

type Route struct {
	Name        string
	Method      string
	Pattern     string
	HandlerFunc http.HandlerFunc
}

type Routes []Route

func NewRouter() *mux.Router {

	router := mux.NewRouter().StrictSlash(true)
	for _, route := range routes {
		router.
			Methods(route.Method).
			Path(route.Pattern).
			Name(route.Name).
			Handler(route.HandlerFunc)
	}
	router.NotFoundHandler = http.HandlerFunc(OwnNotFound)

	return router
}

var routes = Routes{
	Route{
		"Index",
		"GET",
		"/",
		Index,
	},
	Route{
		"GetBoards",
		"GET",
		"/boards",
		BoardsGet,
	},
	Route{
		"GetStories",
		"GET",
		"/{board_name}/stories",
		GetStories,
	},
	Route{
		"BoardShow",
		"GET",
		"/{board_name}",
		BoardShow,
	},
	Route{
		"BoardCreate",
		"POST",
		"/boards",
		BoardCreate,
	},
	Route{
		"BoardUpdate",
		"POST",
		"/boards/{board_id}",
		BoardUpdate,
	},
	Route{
		"BoardDelete",
		"DELETE",
		"/boards/{board_id}",
		BoardDelete,
	},
	Route{
		"ColumnUpdate",
		"POST",
		"/columns/{column_id}",
		ColumnUpdate,
	},
	Route{
		"StoriesGetByColumn",
		"GET",
		"/columns/{column_id}/stories",
		StoriesGetByColumn,
	},
	Route{
		"ColumnCreate",
		"POST",
		"/columns",
		ColumnCreate,
	},
	Route{
		"ColumnDelete",
		"DELETE",
		"/columns/{column_id}",
		ColumnDelete,
	},
	Route{
		"StoryCreate",
		"POST",
		"/stories",
		StoryCreate,
	},
	Route{
		"StoryUpdate",
		"POST",
		"/stories/{story_id}",
		StoryUpdate,
	},
	Route{
		"UserCreate",
		"POST",
		"/users",
		UserCreate,
	},
	Route{
		"HandleWS",
		"GET",
		"/{board_name}/ws",
		HandleWs,
	},
	Route{
		"TaskCreate",
		"POST",
		"/tasks",
		TaskCreate,
	},
}
