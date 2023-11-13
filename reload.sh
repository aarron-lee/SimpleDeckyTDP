 #!/bin/bash

pnpm run build
sudo rm -r /home/deck/homebrew/plugins/SimpleDeckyTDP/
sudo cp -r /home/deck/Development/SimpleDeckyTDP/ ~/homebrew/plugins/
sudo systemctl restart plugin_loader.service
