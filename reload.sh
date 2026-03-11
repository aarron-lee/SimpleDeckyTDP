 #!/bin/bash

./scripts/build_i18n_json.sh
pnpm run build
sudo rm -r /home/$USER/homebrew/plugins/SimpleDeckyTDP/
sudo cp -r /home/$USER/Development/SimpleDeckyTDP/ ~/homebrew/plugins/
sudo systemctl restart plugin_loader.service
