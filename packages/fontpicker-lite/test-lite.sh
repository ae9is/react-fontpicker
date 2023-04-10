#!/bin/bash
# Test npm packed fontpicker-lite build.
#
# @ae9is
#

VERSION=`grep version package.json | sed 's/[",:]//g' | awk '{print $2}'`
PACKNAME="react-fontpicker-ts-lite-${VERSION}.tgz"
echo "Testing ${PACKNAME} at `date` ..."
cd ../pack-test
npm i
npm rm react-fontpicker-ts-lite
npm i "../fontpicker-lite/${PACKNAME}"
npm run test
echo "Finished testing ${PACKNAME} at `date`"
