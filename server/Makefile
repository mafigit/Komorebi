SOURCEDIR=.
SOURCES := $(shell find $(SOURCEDIR) -name '*.go')
GOPATH := $(shell git rev-parse --show-toplevel)/server

BINARY=bin/komorebi

VERSION=1.0.0
BUILD_TIME=`date +%FT%T%z`

LDFLAGS=-ldflags "-X src/main/core.Version=${VERSION} -X src/main/core.BuildTime=${BUILD_TIME}"

.DEFAULT_GOAL: $(BINARY)

$(BINARY): $(SOURCES)
	    GOPATH=${GOPATH} go build ${LDFLAGS} -o ${BINARY} src/main/main.go

.PHONY: install
install:
	GOPATH=${GOPATH} go install ${LDFLAGS} ./...

test:
	GOPATH=${GOPATH} go test komorebi

.PHONY: clean
clean:
	if [ -f ${BINARY} ] ; then rm ${BINARY} ; fi
