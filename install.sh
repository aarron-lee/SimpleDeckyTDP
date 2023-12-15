#!/usr/bin/bash
# does the following:
# - SimpleDeckyTDP Decky Plugin
if [ "$EUID" -eq 0 ]
  then echo "Please do not run as root"
  exit
fi


echo "removing previous install if it exists"

cd $HOME

sudo rm -rf $HOME/homebrew/plugins/SimpleDeckyTDP

echo "installing SimpleDeckyTDP plugin for TDP control"
# download + install simple decky tdp
curl -L $(curl -s https://api.github.com/repos/aarron-lee/SimpleDeckyTDP/releases/latest | grep "browser_download_url" | cut -d '"' -f 4) -o $HOME/SimpleDeckyTDP.tar.gz
sudo tar -xzf SimpleDeckyTDP.tar.gz -C $HOME/homebrew/plugins

# install complete, remove build dir
rm  $HOME/SimpleDeckyTDP.tar.gz
sudo systemctl restart plugin_loader.service

echo "Installation complete"
