 #!/bin/bash

pnpm run build
sudo rm -r /home/$USER/homebrew/plugins/SimpleDeckyTDP/
sudo cp -r /home/$USER/Development/SimpleDeckyTDP/ ~/homebrew/plugins/
sudo systemctl restart plugin_loader.service
