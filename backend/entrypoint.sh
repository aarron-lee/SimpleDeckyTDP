#!/bin/sh

# credit: https://github.com/totallynotbakadestroyer/Decky-Undervolt/blob/master/backend/entrypoint.sh

set -e

echo "Container's IP address: `awk 'END{print $1}' /etc/hosts`"

cd /backend

echo "--- Building ryzenadj lib ---"
git clone https://github.com/FlyGoat/RyzenAdj /tmp/ryzenadj
cd /tmp/ryzenadj
mkdir build && cd build
cmake -DCMAKE_BUILD_TYPE=Release .. || exit 1
make || exit 1
mv libryzenadj.so /backend/out/libryzenadj.so || exit 1
mv ryzenadj /backend/out/ryzenadj || exit 1
chmod +x /backend/out/ryzenadj || exit 1
mv ../LICENSE /backend/out/LICENSE-ryzenadj || exit 1

cd /backend

echo "--- Cleaning up ---"
# remove newly-cloned git repo and artifacts
rm -rf ./ryzenadj
