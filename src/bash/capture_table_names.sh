#!/bin/sh
path_to_db=$1
table_names=$(sqlite3 $path_to_db .tables)
echo $table_names