#!/bin/bash

# cleanup old files
rm -r tmp 2> /dev/null

# setup dirs
mkdir -p tmp/src/
mkdir -p tmp/build/

# setup files
cd tmp/src/
printf "%s" "application/epub+zip" > mimetype
printf "%s\n" "<!DOCTYPE html><span class=img-text>...</span><span hidden>alt</span>" > index.html

## setup epub file
### create an uncompressed file with no metadata as the first entry
zip -0X ../build/test.epub mimetype
### recursively compress all files in directory (while omitting the mimetype file)
zip -rX -u ../build/test.epub ./ -x "mimetype"
