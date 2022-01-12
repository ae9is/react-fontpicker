<?php declare(strict_types = 1);

namespace Mikk3lRo\vueFontpicker;

$apiKey = file_get_contents(__DIR__ . '/GOOGLE_API_KEY');

if (!is_string($apiKey) || strlen($apiKey) < 20) {
    die('Invalid api key - get an api key for google fonts and put it in a file called GOOGLE_API_KEY (or hardcode it in
    generate-font-previews.php)');
}

ini_set('memory_limit', '5G');

class GoogleFonts
{
    private static $apiKey;
    private static $fontPath;
    private static $outputPath;

    private static $cellHeight = 40;
    private static $sliceSize = 200;

    public static function generatePreview($apiKey, $fontPath, $outputPath)
    {
        self::$fontPath = $fontPath;
        self::$outputPath = $outputPath;
        self::$apiKey = $apiKey;

        if (!file_exists(self::$outputPath)) {
            mkdir(self::$outputPath, 0700, true);
        }
        if (!file_exists(self::$fontPath)) {
            mkdir(self::$fontPath, 0700, true);
        }

        $fontInfos = self::getFontList();

        //$fontInfos = array_slice($fontInfos, 0, 50);

        $fonts = [];
        foreach ($fontInfos as $num => $font) {
            $sanename = strtolower(preg_replace('#[^a-zA-Z0-9\-]#', '', str_replace(' ', '-', $font['family'])));
            $fonts[] = [
                'name' => $font['family'],
                'sanename' => $sanename,
                'slice' => intdiv($num, self::$sliceSize),
                'top' => ($num % self::$sliceSize) * self::$cellHeight,
                'remoteFile' => reset($font['files']),
                'localFile' => self::$fontPath . '/' . $sanename . '.ttf',
                'variants' => $font['variants'],
            ];
        }

        self::fetchFonts($fonts);

        self::makeJson($fonts);

        self::makeImages($fonts);

        self::makeCss($fonts);

        self::makeHtml($fonts);
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


    private static function fetchFonts($fontInfo)
    {
        foreach ($fontInfo as $font) {
            if (!file_exists($font['localFile'])) {
                file_put_contents($font['localFile'], file_get_contents($font['remoteFile']));
            }
        }
    }


    private static function makeJson($fonts)
    {
        $json = [];

        foreach ($fonts as $font) {
            $json[] = [
                'name' => $font['name'],
                'sane' => $font['sanename'],
                'variants' => self::shortVariants($font),
            ];
        }
        file_put_contents(self::$outputPath . '/fontInfo.json', json_encode($json, JSON_PRETTY_PRINT));
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


GoogleFonts::generatePreview(
    $apiKey,
    __DIR__ . '/font-cache',
    __DIR__ . '/font-preview',
);
