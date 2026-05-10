#!/usr/bin/bash
# does the following:
# - SimpleDeckyTDP Decky Plugin

VERSION=${VERSION:-"LATEST"}


if [ "$EUID" -eq 0 ]
  then echo "Please do not run as root"
  exit
fi


echo "removing previous install if it exists"

cd $HOME

sudo rm -rf $HOME/homebrew/plugins/SimpleDeckyTDP

echo "installing SimpleDeckyTDP plugin for TDP control"


FINAL_URL='https://api.github.com/repos/aarron-lee/SimpleDeckyTDP/releases/latest'
if [ $VERSION != "LATEST" ] ; then
  FINAL_URL="https://api.github.com/repos/aarron-lee/SimpleDeckyTDP/releases/tags/$VERSION"
fi

# download + install simple decky tdp
curl -L $(curl -s $FINAL_URL | grep "browser_download_url" | cut -d '"' -f 4) -o $HOME/SimpleDeckyTDP.zip
sudo 7z x ./SimpleDeckyTDP.zip  -o$HOME/homebrew/plugins

# curl -L $(curl -s https://api.github.com/repos/aarron-lee/SimpleDeckyTDP/releases/latest | grep "browser_download_url" | cut -d '"' -f 4) -o $HOME/SimpleDeckyTDP.tar.gz
# sudo tar -xzf SimpleDeckyTDP.tar.gz -C $HOME/homebrew/plugins

# sudo ark -ba ./SimpleDeckyTDP.zip -o $HOME/homebrew/plugins

# install complete, remove build dir
rm  $HOME/SimpleDeckyTDP.zip
sudo systemctl restart plugin_loader.service

echo "Installation complete"
