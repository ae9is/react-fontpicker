# Fonted text SVG generation

## References 

List of reference material on generating fonted text in SVG format.

Batik - Java 8+ command line TTF to SVG font file converter
https://xmlgraphics.apache.org/batik/tools/font-converter.html

EasySVG - PHP script to generate fonted text SVG using an SVG font.
https://github.com/kartsims/easysvg

PHP GD - Original library for PHP font preview generation. For working with raster graphics (PNG), not vector graphics (SVG). Link is function to write fonted text to image.
https://www.php.net/manual/en/function.imagettftext.php

Opentype.js - Can use multiple different font files (or online font files at a URL) to write out SVG (XML) representation of some fonted text. Link is to latest release of project. Main branch is much more up-to-date and with breaking API changes (but releases have been stalled due to lead maintainer.)
https://github.com/opentypejs/opentype.js/tree/1.3.4

text-to-svg - Javascript wrapper library for Opentype.js. Good example for how to use Opentype.js, and also implements easy anchor for generated text within the SVG. Uses very old version of Opentype.js however.
https://github.com/shrhdk/text-to-svg

Cairo - 2D graphics library. Link is "toy API" to render fonted text. PHP bindings are very old and unmaintained. Could be paired with Pango, a proper text rendering engine. The PHP bindings project for Pango is even older and seems partly finished.
https://www.cairographics.org/manual/cairo-text.html#cairo-select-font-face
https://www.cairographics.org/cairo-php/
https://docs.gtk.org/Pango/pango_rendering.html
https://github.com/gtkforphp/pango

## Notes

Batik output currently broken (test cards aren't fonted).

Opentype.js works fine, just be careful of the breaking API changes and difference between main and latest release. The build-font-previews.php script could just be rewritten in Typescript at some point.

Generated SVG text previews are ~ 2-3x bigger than a decent PNG preview file. Compressed, about the same size. With SVG previews, could eliminate the different font previews for each scale (1x, 1.5x, 2x).

Could rewrite font preview generation script in Typescript and swap to Opentype.js at some point, anyways, just for the font preview quality upgrade and consistent language. But won't actually trim font preview sizes, unfortunately.
