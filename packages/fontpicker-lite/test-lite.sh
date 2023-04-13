#!/bin/bash
# Test npm packed fontpicker-lite build.
#
# @ae9is
#

# Allow calling script from other folders
# ref: https://stackoverflow.com/questions/59895
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd "${SCRIPT_DIR}"

VERSION=`grep version package.json | sed 's/[",:]//g' | awk '{print $2}'`
PACKNAME="react-fontpicker-ts-lite-${VERSION}.tgz"
echo "Testing ${PACKNAME} at `date` ..."
cd ../../test/pack-test
npm rm react-fontpicker-ts react-fontpicker-ts-lite
npm i "../../packages/fontpicker-lite/${PACKNAME}"
npm run test
echo "Finished testing ${PACKNAME} at `date`"
