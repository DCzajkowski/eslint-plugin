#!/bin/bash

rm -rf dist
rollup -c
mv dist/types/src/index.d.ts dist/index.d.ts
rm -rf dist/types
cp dist/index.d.ts dist/index.d.cts
mv dist/index.d.ts dist/index.d.mts
sed -i 's/export default/export =/g' dist/index.d.cts
