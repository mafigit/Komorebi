SOURCEDIR=.
SOURCES := $(shell find $(SOURCEDIR) -name '*.go')

BINARY=bin/komorebi

VERSION=1.0.0
BUILD_TIME=`date +%FT%T%z`

LDFLAGS=-ldflags "-X src/main/core.Version=${VERSION} -X src/main/core.BuildTime=${BUILD_TIME}"

.DEFAULT_GOAL: $(BINARY)

$(BINARY): $(SOURCES)
	    go build ${LDFLAGS} -o ${BINARY} src/main/main.go

.PHONY: install
install:
	go install ${LDFLAGS} ./...

test:
	go test komorebi

.PHONY: clean
clean:
	if [ -f ${BINARY} ] ; then rm ${BINARY} ; fi
