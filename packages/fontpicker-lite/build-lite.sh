#!/bin/bash
# Rebuild the font picker component (component and type definitions only) with a subset of fonts.
#
# @ae9is
#

echo "Building react-fontpicker-ts-lite at `date` ..."

cd ../fontpicker

# Move font-preview, dist to backup
if [ -e font-preview ]; then
  if [ -e font-preview-bak ]; then
    echo "Cowardly refusing to overwrite font-preview-bak and quitting..."
    exit 1
  fi
  mv font-preview font-preview-bak
fi
if [ -e dist ]; then
  if [ -e dist-bak ]; then
    echo "Cowardly refusing to overwrite dist-bak and quitting..."
    exit 1
  fi
  mv dist dist-bak
fi

cd ./scripts
php ./build-font-previews.php --lite
cd ..

npm run build:tsup
if [ -e .tsbuildinfo ]; then
  echo "Removing .tsbuildinfo ..."
  rm .tsbuildinfo
fi
npm run build:types

# Move new dist, font-preview to fontpicker-lite/
if [ ! -d dist ] || [ ! -d font-preview ]; then
  echo "Error: no built dist or font-previews folders found"
  exit 1
fi
if [ -e ../fontpicker-lite/dist ]; then
  echo "Removing old fontpicker-lite/dist ..."
  rm -r ../fontpicker-lite/dist
fi
if [ -e ../fontpicker-lite/font-preview ]; then
  echo "Removing old fontpicker-lite/font-preview ..."
  rm -r ../fontpicker-lite/font-preview
fi
mv dist ../fontpicker-lite
mv font-preview ../fontpicker-lite

# Move backup font-preview, dist back to original locations (fontpicker/dist, fontpicker/font-preview)
if [ -e font-preview-bak ]; then
  mv font-preview-bak font-preview
fi
if [ -e dist-bak ]; then
  mv dist-bak dist
fi

cp LICENSE README.md package.json ../fontpicker-lite
cd ../fontpicker-lite

# Modify README.md for fontpicker-lite
sed -i 's/^# react-fontpicker/# react-fontpicker lite/' README.md
sed -i 's/A Google font picker/A lighter weight Google font picker/g' README.md
sed -i 's/- [0-9]*+ Google/- 75 Google/g' README.md

# Modify package.json for fontpicker-lite
sed -i 's/react-fontpicker-ts/react-fontpicker-ts-lite/g' package.json
VERSION=`grep version package.json | sed 's/[",:]//g' | awk '{print $2}'`
PACKNAME="react-fontpicker-ts-lite-${VERSION}.tgz"

# (Note: only dist, package.json, LICENSE, and README.md are bundled into the npm package, with "files": ["dist"])
npm pack

# After all this, npm publish should just work (hopefully) from fontpicker-lite directory
echo "Finished building ${PACKNAME} at `date`"
echo "Test it out from your own project by running:"
echo "  npm i /path/to/${PACKNAME}"
echo ""
