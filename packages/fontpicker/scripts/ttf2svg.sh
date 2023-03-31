#!/bin/bash
#
# WIP
#
# Run Batik to convert TTF font files under font cache to SVG font files.
# Needed to generate SVG text font preview names from the SVG fonts.
# (In the PHP ecosystem, possibly the Cairo PHP bindings could directly do:
#  TTF font file -> write SVG text images. But the bindings are unmaintained and old.
#  Opentype.js is one possible solution for Node.js.)
# 
# ref: https://xmlgraphics.apache.org/batik/tools/font-converter.html
# 
# Example usage:
#  ttf2svg.sh annie-use-your-telescope abel abeezee
#
# @ae9is
#

FONT_CACHE="../font-cache"
DEPENDENCIES="java wget sha512sum"

if [ -z "${1}" ]; then
  echo "Usage: $0 [font-name]..."
  exit 2
fi

# Check dependencies

function inPath {
  builtin type -P "$1" &> /dev/null || (echo "Error: $1 is not in path" && echo "$0 requires: ${DEPENDENCIES}" && exit 1)
}

for prog in ${DEPENDENCIES}; do
  inPath "${prog}" || exit 1
done

# Download Batik, checksum, extract

BATIK="batik-1.16/batik-ttf2svg-1.16.jar"
BATIK_DIST="batik-bin-1.16.tar.gz"
BATIK_CHECKSUM="batik-bin-1.16.tar.gz.sha512"

if [ ! -f "${BATIK_DIST}" ]; then
  wget "https://www.apache.org/dyn/closer.cgi?filename=/xmlgraphics/batik/binaries/batik-bin-1.16.tar.gz&action=download" -O "${BATIK_DIST}"
fi


if [ ! -f "${BATIK_CHECKSUM}" ]; then
  wget "https://www.apache.org/dist/xmlgraphics/batik/binaries/batik-bin-1.16.tar.gz.sha512" -O "${BATIK_CHECKSUM}"
fi

sha512sum -c "${BATIK_CHECKSUM}" &> /dev/null || (echo "Error: failed checksum for script dependency: ${BATIK_CHECKSUM}")

tar -xf "${BATIK_DIST}"

if [ ! -f "${BATIK}" ]; then
  echo "Error: Couldn't find Batik at ${BATIK}"
  exit 1
fi

# Run Batik ttf2svg on specified font TTFs

for arg in "$@"; do
  FONT="$arg"
  INPUT="${FONT_CACHE}/${FONT}.ttf"
  if [ ! -f "${INPUT}" ]; then
    echo "Error: ${INPUT} is not a file, skipping..."
    continue
  fi
  OUTPUT="${FONT_CACHE}/${FONT}.svg"
  if [ -f "${OUTPUT}" ]; then
    echo "Warning: overwriting output file ${OUTPUT}"
  fi
  # TODO FIXME Batik output testcard renders without the custom font applied!
  java -jar "${BATIK}" "${INPUT}" -autorange -id "${FONT}" -o "${OUTPUT}" -testcard
done

