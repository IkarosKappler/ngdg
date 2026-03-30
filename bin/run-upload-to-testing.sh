#!/bin/bash

echo "Loading up .env-testing file ..."
set -o allexport
[[ -f ../.env-testing ]] && source ../.env-testing
set +o allexport

if [[ -z "$user" && -z "$server" && -z "$destination" ]]; then
    echo "Error: No env vars found! Did you create an .env-testing file?"
    exit 1
else
    echo "Testing Env vars found and loaded."

    while true; do
	read -p "Do you really wish to overwrite all files on your testing system on $server (y/n)? " yn
	case $yn in
            [Yy]* ) break;;
            [Nn]* ) exit;;
            * ) echo "Please answer y or n.";;
	esac
    done
fi


# ./run-upload-to-production.sh

echo "Uploading to $server ..."

# rsync -avH ../docs_jekyll/_site/*  -e ssh user@server:/your/destination/path
# rsync -avH ../docs_jekyll/_site/*  -e ssh $user@$server:$destination
# rsync -avH ../demos_with_tracker/* -e ssh $user@$server:"$destination/repo/demos/"
rsync -avH ../demos                -e ssh $user@$server:"$destination/"
rsync -avH ../dist                 -e ssh $user@$server:"$destination/"
rsync -avH ../exampledata          -e ssh $user@$server:"$destination/"
rsync -avH ../public               -e ssh $user@$server:"$destination/"
rsync -avH ../src                  -e ssh $user@$server:"$destination/"
rsync -avH ../favicon.ico          -e ssh $user@$server:"$destination/"
rsync -avH ../README.md            -e ssh $user@$server:"$destination/"
# rsync -avH ../README.md            -e ssh $user@$server:"$destination/"

# Clear demos with tracker dir
# rm -rf ../demos_with_tracker

