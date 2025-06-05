#!/usr/bin/bash

git checkout main

if [ "$EUID" -eq 0 ]
  then echo "Please do not run as root"
  exit
fi

NEW_TAG=$1

sed -i "s/version\": \"[0-9]\+\.[0-9]\+\.[0-9]\+\"/version\": \"$NEW_TAG\"/" ./package.json

sed -i "s/__version__ = '[0-9]\+\.[0-9]\+\.[0-9]\+'/__version__ = '$NEW_TAG'/" ./decky.pyi

git add ./package.json

git add ./decky.pyi

git commit -m "Release version $NEW_TAG"

git tag v$NEW_TAG

git push

git push --tags
