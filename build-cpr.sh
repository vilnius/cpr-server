#!/bin/bash
#
# A script for building/updating frontend and backend
#
# ROOT = directory of this bash file
ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/.."
#
# CPR Frontend
cd $ROOT/cpr-frontend
echo "- Updating frontend source code..."
git pull
echo "- Installing npm dependencies..."
npm install
echo "- Building frontend..."
npm run build:prod
#
# CPR Server
cd $ROOT/cpr-server
echo "- Updating backend source code..."
git pull
echo "- Installing npm dependencies..."
npm install
echo "- (Re)starting server..."
sudo service cpr restart
