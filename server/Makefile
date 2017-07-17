SOURCEDIR=.
SOURCES := $(shell find $(SOURCEDIR) -name '*.go')
GOPATH := $(shell git rev-parse --show-toplevel)/server
UNAME := $(shell uname)

ifeq ($(UNAME), Darwin)
    LDFLAGS =  -ldflags -s
endif

BINARY=bin/komorebi

.DEFAULT_GOAL: $(BINARY)

$(BINARY): $(SOURCES)
	    GOPATH=${GOPATH} go build ${LDFLAGS} -o ${BINARY} src/main/main.go

.PHONY: install
install:
	GOPATH=${GOPATH} go install ./...

test:
	GOPATH=${GOPATH} go test ${LDFLAGS} komorebi && cd src/komorebi && bash ./test_all_routes.sh

.PHONY: clean
clean:
	if [ -f ${BINARY} ] ; then rm ${BINARY} ; fi
