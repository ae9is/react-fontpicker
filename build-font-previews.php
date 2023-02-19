/*
MIT License

Copyright (c) 2020 Mikk3lRo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

<?php declare(strict_types = 1);

namespace Mikk3lRo\vueFontpicker;

ini_set('memory_limit', '5G');

if (!isset($argv[1]) || $argv[1] == 'googlefonts') {
    $apiKey = file_exists(__DIR__ . '/GOOGLE_API_KEY') ? file_get_contents(__DIR__ . '/GOOGLE_API_KEY') : '';

    if (!is_string($apiKey) || strlen($apiKey) < 20) {
        die('Invalid api key - get an api key for google fonts and put it in a file called GOOGLE_API_KEY (or hardcode it in
        build-font-previews.php)');
    }

    $fonts = GoogleFonts::fetchAll(
        $apiKey,
        __DIR__ . '/font-cache',
    );
    $outpath = __DIR__ . '/font-preview';
} else {
    $fonts = array();
    $dummy = array_shift($argv);
    $outpath = array_shift($argv);
    if (!is_dir(dirname($outpath))) {
        die('Need outpath as first argument!');
    }
    if (!is_dir($outpath)) {
        mkdir($outpath);
    }
    foreach ($argv as $arg) {
        // build-font-previews.php "FontName|sans-serif|0,400+0,700+1,400+1,700|/path/to/font.ttf" "Font2|serif|0,400|/path/to/font2.ttf"
        if (preg_match('#^(.+)\|(.+)\|((?:[0,1],[0-9]{1,4}\+)*(?:[0,1],[0-9]{1,4}))\|(.+)$#', $arg, $matches)) {
            $fontName = $matches[1];
            $fontCategory = $matches[2];
            $fontVariants = explode('+', $matches[3]);
            $fontFile = $matches[4];
            if (substr($fontFile, -4) !== '.ttf') {
                die('Not a TTF file: ' . $fontFile);
            } else if (!file_exists($fontFile)) {
                die('File does not exist: ' . $fontFile);
            }

            $fonts[] = [
                'name' => $fontName,
                'category' => $fontCategory,
                'localFile' => $fontFile,
                'variants' => $fontVariants,
            ];
        }
    }
}

fontPreviewBuilder::generatePreview($fonts, $outpath);

class GoogleFonts
{
    private static $apiKey;
    private static $fontPath;

    public static function fetchAll($apiKey, $fontPath)
    {
        self::$fontPath = $fontPath;
        self::$apiKey = $apiKey;

        if (!file_exists(self::$fontPath)) {
            mkdir(self::$fontPath, 0700, true);
        }

        $fontInfos = self::getFontList();

        //$fontInfos = array_slice($fontInfos, 0, 50);

        $fonts = [];
        foreach ($fontInfos as $num => $font) {
            if (isset($font['files']['regular'])) {
                $remoteFile = $font['files']['regular'];
            } elseif (isset($font['files']['400'])) {
                $remoteFile = $font['files']['400'];
            } elseif (isset($font['files']['300'])) {
                $remoteFile = $font['files']['300'];
            } elseif (isset($font['files']['500'])) {
                $remoteFile = $font['files']['500'];
            } else {
                $remoteFile = reset($font['files']);
            }

            $localFile = self::$fontPath . '/' . strtolower(preg_replace('#[^a-zA-Z0-9\-]#', '', str_replace(' ', '-', $font['family']))) . '.ttf';

            if (!file_exists($localFile)) {
                file_put_contents($localFile, file_get_contents($remoteFile));
                sleep(1);
            }

            $fonts[] = [
                'name' => $font['family'],
                'category' => $font['category'],
                'localFile' => $localFile,
                'variants' => self::shortVariants($font),
            ];
        }
        return $fonts;
    }


    private static function shortVariants($font)
    {
        $shortVariants = [];
        foreach ($font['variants'] as $longVariant) {
            if ($longVariant == 'regular') {
                $shortVariants[] = '0,400';
            } elseif ($longVariant == 'italic') {
                $shortVariants[] = '1,400';
            } elseif (is_numeric($longVariant)) {
                $shortVariants[] = '0,' . $longVariant;
            } elseif (preg_match('#^([0-9]+)italic$#', $longVariant, $matches)) {
                $shortVariants[] = '1,' . $matches[1];
            } else {
                die($longVariant);
            }
        }

        return $shortVariants;
    }

    private static function getFontList()
    {
        $localJsonFile = self::$fontPath . '/fonts.json';
        if (!is_file($localJsonFile) || filemtime($localJsonFile) < time() - 60 * 60 * 24) {
            $url = 'https://www.googleapis.com/webfonts/v1/webfonts?key=' . self::$apiKey . '&sort=alpha';
            $remoteJson = json_decode(
                file_get_contents($url),
                true,
            );
            if (is_array($remoteJson) && isset($remoteJson['items'])) {
                file_put_contents($localJsonFile, json_encode($remoteJson));
            }
        }
        $localJson = json_decode(file_get_contents($localJsonFile), true);
        if (!is_array($localJson) || !isset($localJson['items'])) {
            throw new Exception('Failed to get fonts');
        }

        $fonts = array_filter($localJson['items'], function ($font) {
            //We only want fonts with a latin subset
            if (!in_array('latin', $font['subsets'])) {
                return false;
            }
            //A few fonts just don't work for some reason
            if (in_array($font['family'], [
                'Kumar One',
                'Kumar One Outline',
            ])) {
                return false;
            }
            return true;
        });

        return array_values($fonts);
    }
}


class fontPreviewBuilder {
    private static $outputPath;
    private static $cellHeight = 40;
    private static $sliceSize = 200;


    public static function generatePreview($fonts, $outputPath) {
        self::$outputPath = $outputPath;
        if (!file_exists(self::$outputPath)) {
            mkdir(self::$outputPath, 0700, true);
        }

        foreach ($fonts as $num => &$font) {
            $font['sanename'] = strtolower(preg_replace('#[^a-zA-Z0-9\_]#', '', str_replace(' ', '_', $font['name'])));
            $font['top'] = ($num % self::$sliceSize) * self::$cellHeight;
        }

        self::makeJson($fonts);

        self::makeImages($fonts);

        self::makeCss($fonts);

        self::makeHtml($fonts);
    }


    private static function makeJson($fonts)
    {
        $json = [];

        foreach ($fonts as $font) {
            $json[] = [
                'category' => $font['category'],
                'name' => $font['name'],
                'sane' => $font['sanename'],
                'variants' => $font['variants'],
            ];
        }
        file_put_contents(self::$outputPath . '/fontInfo.json', json_encode($json, JSON_PRETTY_PRINT));
    }


    private static function makeImages($fonts)
    {
        for ($i = 0; $i < count($fonts) / self::$sliceSize; $i++) {
            echo 'Slice ' . ($i + 1) . '/' . (intdiv(count($fonts), self::$sliceSize) + 1) . "\n";
            $slice = array_slice($fonts, $i * self::$sliceSize, self::$sliceSize);
            self::makeImage($slice, self::$outputPath . '/sprite.' . ($i + 1));
        }
    }


    private static function makeImage($fonts, $outFile)
    {
        foreach ([1, 1.5, 2] as $outScale) {
            echo $outScale . "x\n";
            $scale = $outScale * 2;

            $dstW = intval(ceil(600 * $outScale));
            $dstH = intval(ceil(self::$cellHeight * count($fonts) * $outScale));
            $dstCellH = intval(ceil(self::$cellHeight * $outScale));

            $srcW = intval(ceil(600 * $scale));
            $srcH = intval(ceil(self::$cellHeight * $scale));

            $fontSize = 16 * $scale;
            $indent = intval(ceil(10 * $scale));
            $baseline = intval(ceil((self::$cellHeight - 12) * $scale));

            $dst = imagecreatetruecolor($dstW, $dstH);
            $trans = imagecolorallocatealpha($dst, 255, 255, 255, 127);
            imagealphablending($dst, true);
            imagefill($dst, 0, 0, $trans);

            foreach ($fonts as $num => $font) {
                $src = imagecreatetruecolor($srcW, $srcH);
                $trans = imagecolorallocatealpha($src, 255, 255, 255, 127);
                $black = imagecolorallocate($src, 0, 0, 0);
                imagefill($src, 0, 0, $trans);
                imagealphablending($src, true);

                imagettftext(
                    $src,
                    $fontSize,
                    0,
                    $indent,
                    $baseline,
                    $black,
                    $font['localFile'],
                    $font['name'],
                );
                $dstTop = intval(ceil($font['top'] * $outScale));
                imagecopyresampled($dst, $src, 0, $dstTop, 0, 0, $dstW, $dstCellH, $srcW, $srcH);
                imagedestroy($src);
            }

            imagesavealpha($dst, true);
            imagepng($dst, $outFile . '.' . $outScale . 'x.png');
            imagedestroy($dst);
        }
    }


    private static function makeCss($fonts)
    {
        $css = [];

        $css[] = '[class*=" font-preview-"],';
        $css[] = '[class^="font-preview-"] {';
        $css[] = '  background-size: 30em auto;';
        $css[] = '  background-repeat: no-repeat;';
        $css[] = '  height: 2em;';
        $css[] = '  image-rendering: optimizequality;';
        $css[] = '}';

        for ($i = 0; $i < count($fonts) / self::$sliceSize; $i++) {
            $slice = array_slice($fonts, $i * self::$sliceSize, self::$sliceSize);
            foreach ($slice as $font) {
                $css[] = '.font-preview-' . $font['sanename'] . ',';
            }
            $css[] = '.font-preview-on-medium-sized-screens {';
            $css[] = '  background-image: url(sprite.' . ($i + 1) . '.1.5x.png);';
            $css[] = '}';
        }

        $css[] = '@media';
        $css[] = '(-webkit-max-device-pixel-ratio: 1),';
        $css[] = '(max-resolution: 96dpi) {';
        for ($i = 0; $i < count($fonts) / self::$sliceSize; $i++) {
            $slice = array_slice($fonts, $i * self::$sliceSize, self::$sliceSize);
            foreach ($slice as $font) {
                $css[] = '  .font-preview-' . $font['sanename'] . ',';
            }
            $css[] = '  .font-preview-on-worse-than-1x {';
            $css[] = '    background-image: url(sprite.' . ($i + 1) . '.1x.png);';
            $css[] = '  }';
        }
        $css[] = '}';
        $css[] = '@media';
        $css[] = '(-webkit-min-device-pixel-ratio: 1.51),';
        $css[] = '(min-resolution: 145dpi) {';
        for ($i = 0; $i < count($fonts) / self::$sliceSize; $i++) {
            $slice = array_slice($fonts, $i * self::$sliceSize, self::$sliceSize);
            foreach ($slice as $font) {
                $css[] = '  .font-preview-' . $font['sanename'] . ',';
            }
            $css[] = '  .font-preview-on-better-than-1-and-a-half-x {';
            $css[] = '    background-image: url(sprite.' . ($i + 1) . '.2x.png);';
            $css[] = '  }';
        }
        $css[] = '}';

        foreach ($fonts as $font) {
            $css[] = '.font-preview-' . $font['sanename'] . '{ background-position: 0px -' . ($font['top'] / 20) . 'em }';
        }

        file_put_contents(self::$outputPath . '/font-previews.css', implode("\n", $css));
    }


    private static function makeHtml($fonts)
    {
        $html = [];

        $html[] = '<!DOCTYPE html>';
        $html[] = '<html>';
        $html[] = '<head>';
        $html[] = '    <title>Font previews</title>';
        $html[] = '    <meta charset="UTF-8">';
        $html[] = '    <meta name="viewport" content="width=device-width, initial-scale=1.0">';
        $html[] = '    <link href="font-previews.css" rel="stylesheet" />';
        $html[] = '</head>';
        $html[] = '<body>';

        foreach ($fonts as $font) {
            $html[] = '    <div class="font-preview-' . $font['sanename'] . '" title="' . $font['name'] . '"></div>';
        }
        $html[] = '</body>';
        $html[] = '</html>';

        file_put_contents(self::$outputPath . '/font-previews.html', implode("\n", $html));
    }
}
