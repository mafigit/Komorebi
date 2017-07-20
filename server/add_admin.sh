#!/bin/bash

usage () {
    echo "$0 DATABASE USERNAME"
    exit 1
}

if [ $# -ne 2 ]; then
    usage
fi

db=$1
user=$2

if [ ! -f $db ]; then
    echo "no database found: $db"
    exit 1
fi

sqlite3 $db "UPDATE users set IsAdmin=1 where users.Name=\"$user\";"

exit $?
