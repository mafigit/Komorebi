package komorebi

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestIndex(t *testing.T) {
	req, _ := http.NewRequest("GET", "/", nil)
	w := httptest.NewRecorder()
	Index(w, req)

	fmt.Printf("%d - %s", w.Code, w.Body.String())
	if w.Code != 200 {
		t.Error("Request on / did not succeed")
	}
}
