 #!/bin/bash

pnpm run build
sudo rm -r /home/$USER/.unofficial_homebrew/plugins/SimpleDeckyTDP/
sudo cp -r /home/$USER/Development/SimpleDeckyTDP/ ~/.unofficial_homebrew/plugins/
sudo systemctl restart unofficial_plugin_loader.service
