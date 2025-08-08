#!/usr/bin/bash
# does the following:
# - SimpleDeckyTDP Decky Plugin
if [ "$EUID" -eq 0 ]
  then echo "Please do not run as root"
  exit
fi

PLUGIN_NAME=SimpleDeckyTDP
PLUGIN_DIR=$HOME/homebrew/plugins/$PLUGIN_NAME

echo "removing previous install if it exists"

cd $HOME

sudo rm -rf $PLUGIN_DIR

echo "installing $PLUGIN_NAME plugin for TDP control"
# download + install simple decky tdp
curl -L $(curl -s https://api.github.com/repos/aarron-lee/$PLUGIN_NAME/releases/latest | grep "browser_download_url" | cut -d '"' -f 4) -o $HOME/$PLUGIN_NAME.zip

chmod -R +w "$HOME/homebrew/plugins"
mkdir -p $PLUGIN_DIR

TMP_DIR=/tmp/$PLUGIN_NAME

7z x ./$PLUGIN_NAME.zip  -o/tmp

sudo rsync -av $TMP_DIR/* $PLUGIN_DIR --delete

sudo chown root $PLUGIN_DIR/plugin.json

# curl -L $(curl -s https://api.github.com/repos/aarron-lee/$PLUGIN_NAME/releases/latest | grep "browser_download_url" | cut -d '"' -f 4) -o $HOME/$PLUGIN_NAME.tar.gz
# sudo tar -xzf $PLUGIN_NAME.tar.gz -C $HOME/homebrew/plugins

# sudo ark -ba ./$PLUGIN_NAME.zip -o $HOME/homebrew/plugins

# install complete, remove build dir
rm  $HOME/$PLUGIN_NAME.zip
# rm -rf $TMP_DIR
sudo systemctl restart plugin_loader.service

echo "Installation complete"
