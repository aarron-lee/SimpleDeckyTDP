 #!/bin/bash

./scripts/build_i18n_json.sh
if [ -L "./i18n" ]; then
  echo "The symlink ./i18n exists."
else
  # echo "The symlink ./i18n does not exist."
  ln -s ./defaults/i18n ./i18n
fi
pnpm run build
sudo rm -r /home/$USER/homebrew/plugins/SimpleDeckyTDP/
sudo cp -r /home/$USER/Development/SimpleDeckyTDP/ ~/homebrew/plugins/
sudo systemctl restart plugin_loader.service
