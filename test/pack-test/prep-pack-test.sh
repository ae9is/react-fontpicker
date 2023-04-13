#!/bin/bash
# Installs npm packages for fontpicker and fontpicker-lite.
#
# @ae9is
#

# Allow calling script from other folders
# ref: https://stackoverflow.com/questions/59895
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

echo "Prepping pack-test at `date` ..."

echo "Packing fontpicker ..."
cd "${SCRIPT_DIR}"
cd ../../packages/fontpicker/
npm pack
VERSION=`grep version package.json | sed 's/[",:]//g' | awk '{print $2}'`
PACKNAME="react-fontpicker-ts-${VERSION}.tgz"

echo "Packing fontpicker-lite ..."
cd "${SCRIPT_DIR}"
cd ../../packages/fontpicker-lite/
npm pack
VERSION_LITE=`grep version package.json | sed 's/[",:]//g' | awk '{print $2}'`
PACKNAME_LITE="react-fontpicker-ts-lite-${VERSION}.tgz"

echo "Installing packages ..."
cd "${SCRIPT_DIR}"
npm rm react-fontpicker-ts react-fontpicker-ts-lite
npm i "../../packages/fontpicker/${PACKNAME}"
npm i "../../packages/fontpicker-lite/${PACKNAME_LITE}"

echo "Finished prepping pack-test at `date`"
