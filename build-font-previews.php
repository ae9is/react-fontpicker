<?php declare(strict_types = 1);

namespace Mikk3lRo\vueFontpicker;

$apiKey = file_get_contents(__DIR__ . '/GOOGLE_API_KEY');

if (!is_string($apiKey) || strlen($apiKey) < 20) {
    die('Invalid api key - get an api key for google fonts and put it in a file called GOOGLE_API_KEY (or hardcode it in
    generate-font-previews.php)');
}

ini_set('memory_limit', '2G');

class GoogleFonts
{
    private static $apiKey;
    private static $fontPath;
    private static $outputPath;

    private static $cellHeight = 40;

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

        //$fontInfos = array_slice($fontInfos, 0, 5);

        $fonts = [];
        foreach ($fontInfos as $num => $font) {
            $sanename = strtolower(preg_replace('#[^a-zA-Z0-9\-]#', '', str_replace(' ', '-', $font['family'])));
            $fonts[] = [
                'name' => $font['family'],
                'sanename' => $sanename,
                'top' => $num * self::$cellHeight,
                'remoteFile' => reset($font['files']),
                'localFile' => self::$fontPath . '/' . $sanename . '.ttf'
            ];
        }

        self::fetchFonts($fonts);

        self::makeJson($fonts);

        self::makeImage($fonts);

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
            ];
        }
        file_put_contents(self::$outputPath . '/fontInfo.json', json_encode($json, JSON_PRETTY_PRINT));
    }


    private static function makeImage($fonts)
    {
        $im = imagecreatetruecolor(600, self::$cellHeight * count($fonts));

        $black = imagecolorallocate($im, 0, 0, 0);
        $trans = imagecolorallocatealpha($im, 255, 255, 255, 127);
        imagefill($im, 0, 0, $trans);

        foreach ($fonts as $font) {
            imagettftext(
                $im,
                16,
                0,
                10,
                self::$cellHeight + $font['top'] - 12,
                $black,
                $font['localFile'],
                $font['name'],
            );
        }

        imagesavealpha($im, true);
        header('Content-Type: image/png');
        imagepng($im, self::$outputPath . '/sprite.png');
        imagedestroy($im);
    }


    private static function makeCss($fonts)
    {
        $css = [];

        $css[] = '[class*=" font-preview-"],';
        $css[] = '[class^="font-preview-"] {';
        $css[] = '    background: url(sprite.png);';
        $css[] = '    background-size: 600px auto;';
        $css[] = '    background-repeat: no-repeat;';
        $css[] = '    height: 40px;';
        $css[] = '    width: 600px;';
        $css[] = '}';

        foreach ($fonts as $font) {
            $css[] = '.font-preview-' . $font['sanename'] . '{ background-position: 0px -' . $font['top'] . 'px }';
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
