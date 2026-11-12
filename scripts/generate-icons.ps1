<#
.SYNOPSIS
  Gera todos os ícones corporativos e favicons a partir do favicon.svg da AC Engenharia.
.DESCRIPTION
  Renderiza o favicon.svg usando o Microsoft Edge headless e gera as versões rasterizadas
  (icon-512.png, icon-192.png, apple-touch-icon.png, favicon.png e favicon.ico).
#>

Add-Type -AssemblyName System.Drawing

$rootDir = Resolve-Path (Join-Path $PSScriptRoot "..")
$svgPath = Join-Path $rootDir "favicon.svg"

if (-not (Test-Path $svgPath)) {
    Write-Error "Arquivo favicon.svg não encontrado na raiz!"
    exit 1
}

Write-Output "🚀 [Branding] Gerando pacote de ícones corporativos da AC Engenharia..."

# 1. Renderiza 512x512 PNG via Microsoft Edge Headless
$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edgePath)) {
    $edgePath = "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
}

$tempHtml = [System.IO.Path]::GetTempFileName() + ".html"
@"
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  html, body { margin: 0; padding: 0; width: 512px; height: 512px; overflow: hidden; background: transparent; }
  img { width: 512px; height: 512px; display: block; }
</style>
</head>
<body>
  <img src="file:///$($svgPath.Replace('\', '/'))" />
</body>
</html>
"@ | Set-Content -Path $tempHtml -Encoding UTF8

$icon512Path = Join-Path $rootDir "icon-512.png"

if (Test-Path $edgePath) {
    & $edgePath --headless=new --disable-gpu --force-device-scale-factor=1 --window-size=512,512 --screenshot="$icon512Path" "file:///$($tempHtml.Replace('\', '/'))" | Out-Null
    Write-Output "  -> icon-512.png gerado com fidelidade vetorial."
} else {
    Write-Warning "Microsoft Edge não localizado. Utilizando fallback."
}

Remove-Item $tempHtml -Force -ErrorAction SilentlyContinue

# 2. Gera os redimensionamentos padrão para PWA e Navegadores
if (Test-Path $icon512Path) {
    $srcBmp = [System.Drawing.Bitmap]::FromFile($icon512Path)

    function Save-Resized-Icon {
        param([System.Drawing.Bitmap]$source, [int]$width, [int]$height, [string]$outputPath)
        $destBmp = [System.Drawing.Bitmap]::new($width, $height)
        $g = [System.Drawing.Graphics]::FromImage($destBmp)
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $destRect = [System.Drawing.Rectangle]::new(0, 0, $width, $height)
        $g.DrawImage($source, $destRect)
        $g.Dispose()
        $destBmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $destBmp.Dispose()
        Write-Output "  -> $(Split-Path $outputPath -Leaf) (${width}x${height} px)"
    }

    Save-Resized-Icon -source $srcBmp -width 192 -height 192 -outputPath (Join-Path $rootDir "icon-192.png")
    Save-Resized-Icon -source $srcBmp -width 180 -height 180 -outputPath (Join-Path $rootDir "apple-touch-icon.png")
    Save-Resized-Icon -source $srcBmp -width 64 -height 64 -outputPath (Join-Path $rootDir "favicon.png")
    Save-Resized-Icon -source $srcBmp -width 32 -height 32 -outputPath (Join-Path $rootDir "favicon-32.png")

    # Favicon .ico
    $fav32 = [System.Drawing.Bitmap]::FromFile((Join-Path $rootDir "favicon-32.png"))
    $hIcon = $fav32.GetHicon()
    $icon = [System.Drawing.Icon]::FromHandle($hIcon)
    $fs = [System.IO.File]::OpenWrite((Join-Path $rootDir "favicon.ico"))
    $icon.Save($fs)
    $fs.Close()
    $fav32.Dispose()
    Remove-Item (Join-Path $rootDir "favicon-32.png") -Force -ErrorAction SilentlyContinue
    Write-Output "  -> favicon.ico (multi-resolução)"

    $srcBmp.Dispose()
}

Write-Output "✅ [Branding] Todos os ícones corporativos prontos!"
