#!/bin/sh


function test_equal() {
    exp="$1"
    got="$2"
    if [ "X$exp" != "X$got" ];then
        fatal "${exp} expected, got: ${got}"
    fi
}

function test_match() {
    regex="$1"
    got="$2"
    (echo $got | grep -qE "${regex}") || fatal "regex not matched \nregex:${regex} \ngot: ${got}"
}

function fatal() {
    echo $1
    kill -9 $komorebi_pid
    exit 1
}

if [ ! -x ../../bin/komorebi ]; then
    echo "Komorebi executable not found."
    cd ../..
    make
    cd src/komorebi
fi

if [ -f komorebi.db ]; then
    echo "Deleting existing database"
    rm komorebi.db
fi

echo "Starting komorebi..."
./../../bin/komorebi > /dev/null 2>&1 &
komorebi_pid=$!

sleep 5

echo "Starting tests..."


### Board routes

echo "Create board gz"
resp=`curl -H "Content-Type: application/json" -d '{"name":"gz"}' localhost:8080/boards 2>/dev/null`
test_equal "{\"success\":true,\"messages\":{}}" $resp

echo "Create board test"
resp=`curl -H "Content-Type: application/json" -d '{"name":"test"}' localhost:8080/boards 2>/dev/null`
test_equal "{\"success\":true,\"messages\":{}}" $resp

echo "Get all boards"
resp=`curl  localhost:8080/boards 2>/dev/null`
test_match "[{\"id\":1,\"name\":\"gz\",\"updated_at\":[0-9]{19},\"private\":false},{\"id\":2,\"name\":\"test\",\"updated_at\":[0-9]{19},\"private\":false}]" $resp

echo "Delete board test"
resp=`curl  -X DELETE localhost:8080/boards/2 2>/dev/null`
test_equal "{\"success\":true,\"messages\":{}}" $resp

echo "Get all boards"
resp=`curl  localhost:8080/boards 2>/dev/null`
test_match "[{\"id\":1,\"name\":\"gz\",\"updated_at\":[0-9]{19},\"private\":false}]" $resp

echo "Update board gz with new name foo"
resp=`curl  -H "Content-Type: application/json" -d '{"name":"foo","id":1}' localhost:8080/boards/1 2>/dev/null`
test_equal "{\"success\":true,\"messages\":{}}" $resp

echo "Get board foo"
resp=`curl  -H "Accept: application/json" localhost:8080/foo 2>/dev/null`
test_match "{\"id\":1,\"name\":\"foo\",\"updated_at\":[0-9]{19},\"private\":false,\"stories\":\[*\],\"columns\":\[*\]}" $resp

echo "Get empty burndown data"
resp=`curl localhost:8080/boards/1/burndown 2>/dev/null`
test_equal "[]" $resp

echo "Clear burndown data"
resp=`curl localhost:8080/boards/1/clear 2>/dev/null`
test_equal "{\"success\":true,\"messages\":{}}" $resp



### Column routes

echo "Create column WIP for board foo"
resp=`curl  -H "Content-Type: application/json" -d '{"name":"WIP", "position":0, "board_id":1}' localhost:8080/columns 2>/dev/null`
test_equal "{\"success\":true,\"messages\":{}}" $resp

echo "Create column DONE for board foo"
resp=`curl  -H "Content-Type: application/json" -d '{"name":"DONE", "position":1, "board_id":1}' localhost:8080/columns 2>/dev/null`
test_equal "{\"success\":true,\"messages\":{}}" $resp

echo "Delete column DONE"
resp=`curl  -X DELETE localhost:8080/columns/2 2>/dev/null`
test_equal "{\"success\":true,\"messages\":{}}" $resp

echo "Get board with columns"
resp=`curl  -H "Accept: application/json" localhost:8080/foo 2>/dev/null`
test_match "{\"id\":1,\"name\":\"foo\",\"updated_at\":[0-9]{19},\"private\":false,\"stories\":\[*\],\"columns\":\[{\"id\":1,\"name\":\"WIP\",\"updated_at\":[0-9]{19},\"board_id\":1,\"position\":0}\]}" $resp

echo "Update board WIP with new name BACKLOG"
resp=`curl  -H "Content-Type: application/json" -d '{"name":"BACKLOG", "position":0, "id":1}' localhost:8080/columns/1 2>/dev/null`
test_equal "{\"success\":true,\"messages\":{}}" $resp

echo "Get column BACKLOG"
resp=`curl  localhost:8080/columns/1 2>/dev/null`
test_match "{\"id\":1,\"name\":\"BACKLOG\",\"updated_at\":[0-9]{19},\"board_id\":1,\"position\":0,\"tasks\":\[*\]}" $resp



### Story routes

echo "Create story doit"
resp=`curl -H "Content-Type: application/json" -d '{"name":"doit","desc":"a_description","points":5,"requirements":"Do_this!","board_id":1 }' localhost:8080/stories 2>/dev/null`
test_equal "{\"success\":true,\"messages\":{}}" $resp

echo "Create story test"
resp=`curl -H "Content-Type: application/json" -d '{"name":"test","desc":"desc","points":3,"requirements":"Do this!","board_id":1 }' localhost:8080/stories 2>/dev/null`
test_equal "{\"success\":true,\"messages\":{}}" $resp

echo "Delete Story test"
resp=`curl  -X DELETE localhost:8080/stories/2 2>/dev/null`
test_equal "{\"success\":true,\"messages\":{}}" $resp

echo "Get Story by ID"
resp=`curl  localhost:8080/stories/1 2>/dev/null`
test_match "{\"id\":1,\"name\":\"doit\",\"updated_at\":[0-9]{19},\"desc\":\"a_description\",\"points\":5,\"requirements\":\"Do_this!\",\"board_id\":1,\"archived\":false,\"color\":\"\"}" $resp

echo "Get Stories by board name"
resp=`curl  localhost:8080/foo/stories 2>/dev/null`
test_match "\[{\"id\":1,\"name\":\"doit\",\"updated_at\":[0-9]{19},\"desc\":\"a_description\",\"points\":5,\"requirements\":\"Do_this!\",\"board_id\":1,\"archived\":false,\"color\":\"\"}\]" $resp

echo "Update Story doit with new name do_that"
resp=`curl -H "Content-Type: application/json" -d '{"id":1,"name":"do_that","points":5,"requirements":"Do_this!","board_id":1,"color":"blue"}' localhost:8080/stories/1 2>/dev/null`
test_equal "{\"success\":true,\"messages\":{}}" $resp



### Task routes

echo "Create task foo"
resp=`curl -H "Content-Type: application/json" -d '{"name":"foo", "desc":"desc", "story_id":1, "column_id":1}' localhost:8080/tasks 2>/dev/null`
test_equal "{\"success\":true,\"messages\":{}}" $resp

echo "Get task foo by Id"
resp=`curl localhost:8080/tasks/1 2>/dev/null`
test_match "{\"id\":1,\"name\":\"foo\",\"updated_at\":[0-9]{19},\"desc\":\"desc\",\"story_id\":1,\"column_id\":1,\"archived\":false,\"users\":\[*\]}" $resp

echo "Create task test"
resp=`curl -H "Content-Type: application/json" -d '{"name":"test", "desc":"desc", "story_id":1, "column_id":1}' localhost:8080/tasks 2>/dev/null`
test_equal "{\"success\":true,\"messages\":{}}" $resp

echo "Delete task test"
resp=`curl -X DELETE localhost:8080/tasks/2 2>/dev/null`
test_equal "{\"success\":true,\"messages\":{}}" $resp

echo "Get tasks with story id"
resp=`curl localhost:8080/stories/1/tasks 2>/dev/null`
test_match "\[{\"id\":1,\"name\":\"foo\",\"updated_at\":[0-9]{19},\"desc\":\"desc\",\"story_id\":1,\"column_id\":1,\"archived\":false}\]" $resp

echo "Get tasks with column id"
resp=`curl localhost:8080/columns/1/tasks 2>/dev/null`
test_match "\[{\"id\":1,\"name\":\"foo\",\"updated_at\":[0-9]{19},\"desc\":\"desc\",\"story_id\":1,\"column_id\":1,\"archived\":false}\]" $resp

echo "Update task with new name bar"
resp=`curl -H "Content-Type: application/json" -d '{"name":"bar", "desc":"desc", "story_id":1, "column_id":1, "id":1}' localhost:8080/tasks/1 2>/dev/null`
test_equal "{\"success\":true,\"messages\":{}}" $resp

echo "Update task to archived it"
resp=`curl -H "Content-Type: application/json" -d '{"name":"bar", "desc":"desc", "story_id":1, "column_id":1, "id":1,"archived":true}' localhost:8080/tasks/1 2>/dev/null`
test_equal "{\"success\":true,\"messages\":{}}" $resp

echo "Update task without column_id"
resp=`curl -H "Content-Type: application/json" -d '{"name":"bar", "desc":"desc", "story_id":1, "id":1,"archived":true}' localhost:8080/tasks/1 2>/dev/null`
test_equal "{\"success\":false,\"messages\":{\"column_id\":[\"ColumnId not present.\"]}}" "${resp}"

echo "Get task bar"
resp=`curl localhost:8080/stories/1/tasks 2>/dev/null`
test_match "\[{\"id\":1,\"name\":\"bar\",\"updated_at\":[0-9]{19},\"desc\":\"desc\",\"story_id\":1,\"column_id\":1,\"archived\":true}\]" $resp



### User routes

echo "Create user franz"
resp=`curl  -H "Content-Type: application/json" -d '{"name":"Franz", "image_path":"/public/franz.jpg"}' localhost:8080/users 2>/dev/null`
test_equal "{\"success\":true,\"messages\":{}}" $resp

echo "Create user hans-peter"
resp=`curl  -H "Content-Type: application/json" -d '{"name":"hans-peter", "image_path":"/public/franz.jpg"}' localhost:8080/users 2>/dev/null`
test_equal "{\"success\":true,\"messages\":{}}" $resp

echo "Delete user hans-peter"
resp=`curl  -X DELETE localhost:8080/users/2 2>/dev/null`
test_equal "{\"success\":true,\"messages\":{}}" $resp

echo "Get all users"
resp=`curl localhost:8080/users 2>/dev/null`
test_match "\[{\"id\":1,\"name\":\"Franz\",\"updated_at\":[0-9]{19},\"image_path\":\"/public/franz.jpg\"}\]" $resp

echo "Update user franz with name august"
resp=`curl -H "Content-Type: application/json" -d '{"name":"August", "image_path":"/public/franz.jpg", "id":1 }' localhost:8080/users/1 2>/dev/null`
test_equal "{\"success\":true,\"messages\":{}}" $resp



### Assign users to Board

echo "Assign user august to board foo"
resp=`curl -H "Content-Type: application/json" -d '{"user_ids":[1]}' localhost:8080/boards/1/assign_users 2>/dev/null`
test_equal "{\"success\":true,\"messages\":{}}" $resp

echo "Get users from board foo"
resp=`curl localhost:8080/boards/1/users 2>/dev/null`
test_match "\[{\"id\":1,\"name\":\"August\",\"updated_at\":[0-9]{19},\"image_path\":\"/public/franz.jpg\"}\]" $resp

echo "Assign no user to board foo"
resp=`curl -H "Content-Type: application/json" -d '{"user_ids":[]}' localhost:8080/boards/1/assign_users 2>/dev/null`
test_equal "{\"success\":true,\"messages\":{}}" $resp

echo "Get no users from board foo"
resp=`curl localhost:8080/boards/1/users 2>/dev/null`
test_match "\[\]" $resp

echo "Assign wrong user to board foo"
resp=`curl -H "Content-Type: application/json" -d '{"user_ids":[99999]}' localhost:8080/boards/1/assign_users 2>/dev/null`
test_equal "{\"success\":false,\"messages\":{\"user_ids\":[\"UserIds not valid.\"]}}" "${resp}"



### Assign users to Task

echo "Assign user august to task 1"
resp=`curl -H "Content-Type: application/json" -d '{"user_ids":[1]}' localhost:8080/tasks/1/assign_users 2>/dev/null`
test_equal "{\"success\":true,\"messages\":{}}" $resp

echo "Get users from task 1"
resp=`curl localhost:8080/tasks/1/users 2>/dev/null`
test_match "\[{\"id\":1,\"name\":\"August\",\"updated_at\":[0-9]{19},\"image_path\":\"/public/franz.jpg\"}\]" $resp

echo "Assign no user to task 1"
resp=`curl -H "Content-Type: application/json" -d '{"user_ids":[]}' localhost:8080/tasks/1/assign_users 2>/dev/null`
test_equal "{\"success\":true,\"messages\":{}}" $resp

echo "Get no users from task 1"
resp=`curl localhost:8080/tasks/1/users 2>/dev/null`
test_match "\[\]" $resp

echo "Assign wrong user to task 1"
resp=`curl -H "Content-Type: application/json" -d '{"user_ids":[99999]}' localhost:8080/tasks/1/assign_users 2>/dev/null`
test_equal "{\"success\":false,\"messages\":{\"user_ids\":[\"UserIds not valid.\"]}}" "${resp}"



### Definiton of Done routes

echo "Get (empty) Definition of dones for board foo"
resp=`curl localhost:8080/foo/dods 2>/dev/null`
test_equal "{\"dods\":[]}" $resp

echo "Create Definition of dones for board foo"
resp=`curl -H "Content-Type: application/json" -d '{"dods":["HA testen", "global search"]}' localhost:8080/foo/dods 2>/dev/null`
test_equal "{\"success\":true,\"messages\":{}}" $resp

echo "Get Definition of dones for board foo"
resp=`curl localhost:8080/foo/dods 2>/dev/null`
test_equal "{\"dods\":[\"HA testen\",\"global search\"]}" "$resp"

echo "Get Definition of dones for story 1"
resp=`curl localhost:8080/stories/1/dods 2>/dev/null`
test_match "\[{\"id\":1,\"name\":\"HA testen\",\"updated_at\":[0-9]{19},\"comment\":\"\",\"state\":0,\"story_id\":1},{\"id\":2,\"name\":\"global search\",\"updated_at\":[0-9]{19},\"comment\":\"\",\"state\":0,\"story_id\":1}\]" "$resp"

echo "Update Definition of dones for story 1"
resp=`curl -H "Content-Type: application/json" -d '[{"id":1,"name":"HA testen","comment":"genubox HA","state":1,"story_id":1},{"id":2,"name":"global search","comment":"nicht relevant","state":2,"story_id":1}]' localhost:8080/stories/1/dods 2>/dev/null`
test_equal "{\"success\":true,\"messages\":{}}" $resp

echo "Get Definition of dones for story 1"
resp=`curl localhost:8080/stories/1/dods 2>/dev/null`
test_match "[{\"id\":1,\"name\":\"HA testen\",\"updated_at\":[0-9]{19},\"comment\":\"genubox HA\",\"state\":1,\"story_id\":1},{\"id\":2,\"name\":\"global search\",\"updated_at\":[0-9]{19},\"comment\":\"nicht relevant\",\"state\":2,\"story_id\":1}]" "$resp"


echo 
echo "#############"
echo "all tests passed"
kill -9 $komorebi_pid
exit 0
