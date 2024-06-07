<?php declare(strict_types = 1);
namespace ae9is\reactFontpicker;
require 'easySVG.php';
use EasySVG;
use Exception;
ini_set('memory_limit', '5G');

function println($line) {
    return print($line . "\n");
}

function printHelp($scriptName) {
    $l = [];
    $l[] = 'Usage:';
    $l[] = '';
    $l[] = "Manual font previews generation...";
    $l[] = "\t" . $scriptName . ' ' . '<output-directory> "FontName|font-category|0,400+0,700+1,400+1,700|/path/to/font.ttf" "Font2|serif|0,400|/path/to/font2.ttf"';
    $l[] = '';
    $l[] = "Google font previews generation...";
    $l[] = "\t" . $scriptName . ' OPTIONS';
    $l[] = '';
    $l[] = "\tOPTIONS:";
    $l[] = "\t--filter <file>: Font filter file, one font name per line. Additional filter on fonts included in previews.";
    $l[] = "\t--googlefonts: Retrieve fonts from Google (as opposed to manual preview generation). Implied by --lite.";
    $l[] = "\t--lite: Build a lighter weight set of font previews. Implies --lite.";
    $l[] = "\t--no-replace: Don't replace old downloaded Google font info JSON.";
    $l[] = "\t--num-fonts <int>: Number of fonts to limit the list to.";
    $l[] = "\t--slice-size <int>: Number of fonts to include per preview image.";
    foreach ($l as $line) {
        println($line);
    }
}

# Convert from space delimited arguments to ' --' delimited arguments.
$argsString = implode(' ', $argv);
$newArgs = explode(' --', $argsString);

$args = array();
for ($i = 1; $i < count($newArgs); $i++) {
    if (preg_match('/^([^=\s]+)([=\s]?)(.*)/', $newArgs[$i], $matches)) {
        $key = $matches[1];
        $val = $matches[3];
        if ($val == null) {
            $val = true;
        }
        $args[$key] = $val;
    }
}

if (isset($args['help'])) {
    printHelp($argv[0]);
    exit(0);
}

$noReplaceOldFontInfos = false;
$outScales = [1, 1.5, 2];
$filterFile = null;
$numFonts = null;
$lite = false;
$sliceSize = 200;
$googlefonts = false;

# --lite mode limits to only 1x scale font preview generation, for a selection of fonts.
# Font filter list curated by [Typewolf](https://www.typewolf.com/google-fonts),
#  adding of the extras in the article's FAQ for flavour, plus some of the most popular 
#  Google fonts to make it 75.
if (isset($args['lite'])) {
    $lite = $args['lite'];
    if ($lite) {
        $googlefonts = true;
        $outScales = [1];
        $sliceSize = 15;
        $numFonts = 75;
        $filterFile = './75-google-fonts.txt';
    }
}

if (isset($args['no-replace'])) {
    $noReplaceOldFontInfos = $args['no-replace'];
}

if (isset($args['num-fonts'])) {
    $numFonts = $args['num-fonts'];
}

if (isset($args['slice-size'])) {
    $sliceSize = $args['slice-size'];
}

if (isset($args['googlefonts'])) {
    $googlefonts = $args['googlefonts'];
}

if (isset($args['filter'])) {
    $filterFile = $args['filter'];
}

println('Start building font previews at ' . date(DATE_RFC2822) . ' ...');

println('Script called with arguments:');
print_r($args);

// If no arguments passed, by default assume Google fonts preview job.
if (!isset($argv[1]) || $googlefonts) {
    println('Downloading and building previews for all Google fonts ...');
    $apiKey = file_exists(__DIR__ . '/GOOGLE_API_KEY') ? trim(file_get_contents(__DIR__ . '/GOOGLE_API_KEY')) : '';
    if (!is_string($apiKey) || strlen($apiKey) < 20) {
        die('Invalid api key - get an api key for google fonts and put it in a file called GOOGLE_API_KEY (or hardcode it in
        build-font-previews.php)');
    }
    $fonts = GoogleFonts::fetchAll(
        $apiKey,
        __DIR__ . '/../font-cache',
        $numFonts,
        $noReplaceOldFontInfos,
        $filterFile,
    );
    $outpath = __DIR__ . '/../font-preview';
} else {
    println('Building manual font previews ...');
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
        // build-font-previews.php manual-fonts-test "FontName|sans-serif|0,400+0,700+1,400+1,700|/path/to/font.ttf" "Font2|serif|0,400|/path/to/font2.ttf"
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

fontPreviewBuilder::generatePreview($fonts, $outpath, $outScales, $sliceSize);

class GoogleFonts
{
    private static $apiKey;
    private static $fontPath;

    public static function fetchAll($apiKey, $fontPath, $numFonts, $noReplaceOldFontInfos, $filterFile)
    {
        self::$fontPath = $fontPath;
        self::$apiKey = $apiKey;
        if (!file_exists(self::$fontPath)) {
            println('Creating cache directory: ' . self::$fontPath);
            mkdir(self::$fontPath, 0755, true);
        }
        $fontInfos = self::getFontList($noReplaceOldFontInfos, $numFonts, $filterFile);
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
            $localFileBase = self::$fontPath . '/' . strtolower(preg_replace('#[^a-zA-Z0-9\-]#', '', str_replace(' ', '-', $font['family'])));
            $localFile = $localFileBase . '.ttf';
            $localFileSvg = $localFileBase . '.svg';
            if (!file_exists($localFile)) {
                println('Downloading font file ' . $remoteFile . ' ...');
                file_put_contents($localFile, file_get_contents($remoteFile));
                sleep(1);
            }
            $fonts[] = [
                'name' => $font['family'],
                'category' => $font['category'],
                'localFile' => $localFile,
                'localFileSvg' => $localFileSvg,
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

    private static function getFontList($noReplaceOldFontInfos, $numFonts, $filterFile)
    {
        $filterList = [];
        if (isset($filterFile)) {
            if (!is_file($filterFile)) {
                die('Font filter file does not exist: ' . $filterFile);
            }
            foreach (file($filterFile) as $line) {
                $font = trim($line);
                $filterList[] = $font;
            }
        }
        $localJsonFile = self::$fontPath . '/fonts.json';
        if (!is_file($localJsonFile) || (!$noReplaceOldFontInfos && filemtime($localJsonFile) < time() - 60 * 60 * 24 * 7)) {
            println('Font cache info file missing or out of date, downloading ...');
            // Only useful to sort by popularity if we're limiting the number of fonts. But this lets us keep our font-cache
            //  the same between --lite and regular builds.
            // ref: https://developers.google.com/fonts/docs/developer_api
            $apiBaseUrl = 'https://www.googleapis.com/webfonts/v1/webfonts?key=';
            $url = $apiBaseUrl . self::$apiKey . '&sort=popularity';
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
        $filter = function ($font) { return true; };
        if ($filterList) {
            $filter = function ($font) use ($filterList) {
                if (in_array($font['family'], $filterList)) {
                    return true;
                }
                return false;
            };
        } else {
            $filter = function ($font) {
                // We only want fonts with a latin subset
                if (!in_array('latin', $font['subsets'])) {
                    return false;
                }
                // A few fonts just don't work for some reason
                if (in_array($font['family'], [
                    'Kumar One',
                    'Kumar One Outline',
                ])) {
                    return false;
                }
                return true;
            };
        }
        $fonts = array_filter($localJson['items'], $filter);
        // Slice off extra before sorting, i.e. respect user font order in manual font filter list
        if ($numFonts) {
            array_slice($fonts, 0, $numFonts);
        }
        usort($fonts, function ($fontA, $fontB) {
            return strnatcasecmp($fontA['family'], $fontB['family']);
        });
        return array_values($fonts);
    }
}

class fontPreviewBuilder {
    private static $outputPath;
    private static int $cellHeight = 40;

    public static function generatePreview($fonts, $outputPath, $outScales, $sliceSize) {
        println('Generating previews for ' . sizeof($fonts) . ' fonts to: ' . $outputPath);
        self::$outputPath = $outputPath;
        if (!file_exists(self::$outputPath)) {
            println('Creating output font previews directory: ' . $outputPath);
            mkdir(self::$outputPath, 0755, true);
        }
        foreach ($fonts as $num => &$font) {
            $font['sanename'] = strtolower(preg_replace('#[^a-zA-Z0-9\_]#', '', str_replace(' ', '_', $font['name'])));
            $font['top'] = ($num % $sliceSize) * self::$cellHeight;
        }
        println('Creating font info JSON file ...');
        self::makeJson($fonts);
        println('Creating font preview images ...');
        self::makeImages($fonts, $outScales, $sliceSize);
        println('Generating CSS ...');
        self::makeCss($fonts, $outScales, $sliceSize);
        println('Generating HTML ...');
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

    private static function makeImages($fonts, $outScales, $sliceSize)
    {
        for ($i = 0; $i < count($fonts) / $sliceSize; $i++) {
            echo 'Slice ' . ($i + 1) . '/' . (intdiv(count($fonts), $sliceSize) + 1) . "\n";
            $slice = array_slice($fonts, intval(ceil($i * $sliceSize)), $sliceSize);
            self::makeImage($slice, self::$outputPath . '/sprite.' . ($i + 1), $outScales);
        }
    }

    private static function makeImage($fonts, $outFile, $outScales, $svg = false)
    {
        foreach ($outScales as $outScale) {
            echo $outScale . "x\n";
            $scale = $outScale * 2;
            $dstW = intval(ceil(600 * $outScale));
            $dstH = intval(ceil(self::$cellHeight * count($fonts) * $outScale));
            $dstCellH = intval(ceil(self::$cellHeight * $outScale));
            $srcW = intval(ceil(600 * $scale));
            $srcH = intval(ceil(self::$cellHeight * $scale));
            $fontSize = intval(ceil(16 * $scale));
            $indent = intval(ceil(10 * $scale));
            $baseline = intval(ceil((self::$cellHeight - 12) * $scale));
            if ($svg) {
                $svgImage = [];
                $svgImage[] = '<svg xmlns="http://www.w3.org/2000/svg" ';
                $svgImage[] = 'xmlns:xlink="http://www.w3.org/1999/xlink" ';
                $svgImage[] = 'version="1.1" ';
                $svgImage[] = 'x="0px" y="0px" ';
                $svgImage[] = 'width="' . $dstW . 'px" height="' . $dstH . 'px" ';
                $svgImage[] = 'viewBox="0 0 ' . $dstW . ' ' . $dstH . '">';
                foreach ($fonts as $num => $font) {
                    $text = $font['name'];
                    $svg = new EasySVG();
                    $svg->setFontSVG($font['localFileSvg']);
                    $svg->setFontSize($fontSize);
                    $svg->setFontColor('#000000');
                    //$svg->setLineHeight(1.2);
                    //$svg->setLetterSpacing(.1);
                    //$svg->setUseKerning(true);
                    $svg->addText($text, $indent, $baseline);
                    // Set width/height according to text
                    //list($textWidth, $textHeight) = $svg->textDimensions($text);
                    //$svg->addAttribute("width", $textWidth."px");
                    //$svg->addAttribute("height", $textHeight."px");
                    $svg->addAttribute("width", $srcW."px");
                    $svg->addAttribute("height", $srcH."px");
                    $svgImage[] = $svg->asXML();
                }
                $svgImage[] = '</svg>';
                file_put_contents($outFile . '.' . $outScale . 'x.svg', implode("\n", $svgImage));
            } else {
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
    }

    private static function makeCss($fonts, $outScales, $sliceSize)
    {
        $css = [];
        $css[] = '[class*=" font-preview-"],';
        $css[] = '[class^="font-preview-"] {';
        $css[] = '  background-size: 30em auto;';
        $css[] = '  background-repeat: no-repeat;';
        $css[] = '  height: 2em;';
        $css[] = '  image-rendering: optimizequality;';
        $css[] = '}';
        $i = 0;
        $numScales = sizeof($outScales);
        for ($i = 0; $i < $numScales; $i++) {
            $outScale = $outScales[$i];
            $tab = '';
            if ($numScales > 1) {
                if ($i !== 0) {
                    $tab = '  ';
                    $css[] = '@media';
                    $prevScale = $outScales[$i - 1];
                    $css[] = '(-webkit-min-device-pixel-ratio: ' . ($prevScale + 0.01) . '),';
                    $css[] = '(min-resolution: ' . ($prevScale + 0.01) . 'dppx) {';
                }
            }
            for ($j = 0; $j < count($fonts) / $sliceSize; $j++) {
                $slice = array_slice($fonts, intval(ceil($j * $sliceSize)), $sliceSize);
                foreach ($slice as $font) {
                    $css[] = $tab . '.font-preview-' . $font['sanename'] . ',';
                }
                if ($numScales > 1) {
                    $css[] = $tab . '.font-preview-for-' . str_replace(".", "", strval($outScale)) . 'x {';
                } else {
                    $css[] = $tab . '.font-preview-on-all {';
                }
                $css[] = $tab . '  background-image: url(sprite.' . ($j + 1) . '.' . $outScale . 'x.png);';
                $css[] = $tab . '}';
            }
            if ($numScales > 1 && $i !== 0) {
                $css[] = '}';
            }
        }
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

println('Done at ' . date(DATE_RFC2822));