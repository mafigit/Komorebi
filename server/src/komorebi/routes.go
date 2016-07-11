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
		"BoardDelete",
		"DELETE",
		"/boards",
		BoardDelete,
	},
}
