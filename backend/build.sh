#!/bin/bash

echo "--- Building RyzenAdj ---"
cd RyzenAdj/
mkdir -p build && cd build
cmake -DCMAKE_BUILD_TYPE=Release ..
make
chmod +x ryzenadj
cp ryzenadj ../../
cd ../..
mkdir -p out
cp -f ryzenadj out/
cd out
ls
pwd