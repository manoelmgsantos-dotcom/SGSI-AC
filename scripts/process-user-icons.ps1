Add-Type -AssemblyName System.Drawing

$baseDir = "C:\Users\manoelmgsantos\.gemini\antigravity\brain\b938f834-ea4d-406f-a695-f70c62039ec9\.user_uploaded"
$appIconSrc = Join-Path $baseDir "media_1794488179031_faea751b.png"
$faviconSrc = Join-Path $baseDir "media_1794488179050_31093e43.png"
$rootDir = Resolve-Path (Join-Path $PSScriptRoot "..")

Write-Output "Iniciando processamento dos ícones oficiais do usuário..."

# 1. CROP DO APP ICON (Squircle) - Excluindo completamente o texto 'APP ICON / TOUCH'
# Bounding box medido: X: [164, 437] (W=274), Y: [28, 302] (H=274)
$appBmp = [System.Drawing.Bitmap]::FromFile($appIconSrc)

# Vamos pegar um quadrado de 274x274 centrado no ícone
$cropX = 163
$cropY = 28
$cropSize = 274

$tileBmp = [System.Drawing.Bitmap]::new($cropSize, $cropSize)
$gTile = [System.Drawing.Graphics]::FromImage($tileBmp)
$gTile.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gTile.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gTile.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$srcRect = [System.Drawing.Rectangle]::new($cropX, $cropY, $cropSize, $cropSize)
$destRect = [System.Drawing.Rectangle]::new(0, 0, $cropSize, $cropSize)
$gTile.DrawImage($appBmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$gTile.Dispose()
$appBmp.Dispose()

# Função auxiliar para redimensionar com qualidade máxima
function Resize-Bmp {
    param([System.Drawing.Bitmap]$source, [int]$w, [int]$h)
    $res = [System.Drawing.Bitmap]::new($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($res)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($source, [System.Drawing.Rectangle]::new(0, 0, $w, $h))
    $g.Dispose()
    return $res
}

# Salvar icon-512.png (512x512)
$bmp512 = Resize-Bmp -source $tileBmp -w 512 -h 512
$bmp512.Save((Join-Path $rootDir "icon-512.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$bmp512.Dispose()
Write-Output " -> icon-512.png (512x512) gerado a partir do App Icon recortado."

# Salvar icon-192.png (192x192)
$bmp192 = Resize-Bmp -source $tileBmp -w 192 -h 192
$bmp192.Save((Join-Path $rootDir "icon-192.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$bmp192.Dispose()
Write-Output " -> icon-192.png (192x192) gerado a partir do App Icon recortado."

# Salvar apple-touch-icon.png (180x180)
$bmp180 = Resize-Bmp -source $tileBmp -w 180 -h 180
$bmp180.Save((Join-Path $rootDir "apple-touch-icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$bmp180.Dispose()
Write-Output " -> apple-touch-icon.png (180x180) gerado."

# Salvar app-logo.png (para uso interno no site / navbar / login)
$bmpTileCopy = Resize-Bmp -source $tileBmp -w 256 -h 256
$bmpTileCopy.Save((Join-Path $rootDir "app-logo.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$bmpTileCopy.Dispose()
Write-Output " -> app-logo.png (256x256) gerado para o site."

$tileBmp.Dispose()

# 2. CROP DO ESCUDO / FAVICON PADRÃO
# Bounding box medido em media_1794488179050_31093e43.png:
# X: [195, 405] (W=211), Y: [5, 251] (H=247)
# Vamos pegar o escudo centralizado num quadrado de 256x256
$favBmp = [System.Drawing.Bitmap]::FromFile($faviconSrc)
$cropFavX = 172
$cropFavY = 3
$cropFavSize = 256

$shieldBmp = [System.Drawing.Bitmap]::new($cropFavSize, $cropFavSize)
$gShield = [System.Drawing.Graphics]::FromImage($shieldBmp)
$gShield.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gShield.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gShield.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$srcFavRect = [System.Drawing.Rectangle]::new($cropFavX, $cropFavY, $cropFavSize, $cropFavSize)
$destFavRect = [System.Drawing.Rectangle]::new(0, 0, $cropFavSize, $cropFavSize)
$gShield.DrawImage($favBmp, $destFavRect, $srcFavRect, [System.Drawing.GraphicsUnit]::Pixel)
$gShield.Dispose()
$favBmp.Dispose()

# Salvar favicon.png (64x64)
$bmp64 = Resize-Bmp -source $shieldBmp -w 64 -h 64
$bmp64.Save((Join-Path $rootDir "favicon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$bmp64.Dispose()
Write-Output " -> favicon.png (64x64) gerado a partir do Favicon Padrão recortado."

# Salvar favicon-32.png e favicon.ico
$bmp32 = Resize-Bmp -source $shieldBmp -w 32 -h 32
$bmp32.Save((Join-Path $rootDir "favicon-32.png"), [System.Drawing.Imaging.ImageFormat]::Png)

$hIcon = $bmp32.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$fs = [System.IO.File]::OpenWrite((Join-Path $rootDir "favicon.ico"))
$icon.Save($fs)
$fs.Close()
$bmp32.Dispose()
Remove-Item (Join-Path $rootDir "favicon-32.png") -Force -ErrorAction SilentlyContinue
Write-Output " -> favicon.ico (multi-resolução) gerado com sucesso."

# Salvar também uma versão com fundo transparente do escudo para uso no site
# Vamos criar shield-transparent.png
$shieldTrans = [System.Drawing.Bitmap]::new($cropFavSize, $cropFavSize)
$bgCol = $shieldBmp.GetPixel(5, 5)

for ($y = 0; $y -lt $cropFavSize; $y++) {
    for ($x = 0; $x -lt $cropFavSize; $x++) {
        $pixel = $shieldBmp.GetPixel($x, $y)
        $dist = [Math]::Abs([int]$pixel.R - [int]$bgCol.R) + [Math]::Abs([int]$pixel.G - [int]$bgCol.G) + [Math]::Abs([int]$pixel.B - [int]$bgCol.B)
        if ($dist -lt 25) {
            $shieldTrans.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
        } else {
            $shieldTrans.SetPixel($x, $y, $pixel)
        }
    }
}
$shieldTrans.Save((Join-Path $rootDir "shield-transparent.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$shieldTrans.Dispose()
Write-Output " -> shield-transparent.png gerado com fundo transparente."

$shieldBmp.Dispose()

Write-Output "Processamento e corte dos ícones concluídos com sucesso!"
