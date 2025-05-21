#!/bin/bash

echo "--- Building RyzenAdj ---"
cd RyzenAdj/
mkdir -p build && cd build
cmake -DCMAKE_BUILD_TYPE=Release ..
make
mkdir -p out
cp -f ryzenadj out/