
# Initialise paths

$path = $MyInvocation.MyCommand.Path
$parentDir = $path.Remove($path.LastIndexOf("\"))

$cmplPath = "C:\Temp\google-closure\compiler.jar"
$srcPath = $parentDir + "\src\"
$bldPath = $parentDir + "\build\"

Write-Host "---- minify embed.js ---- `n"

$embedSrc = $srcPath + "js\embed.js"
$embedBuild = $bldPath + "embed.min.js"
java -jar $cmplPath --js $embedSrc --js_output_file $embedBuild

Write-Host "complete `n"

Write-Host "---- combine scripts ---- `n"

$combinedPath = $bldPath + "wellcomeTimeline.js"
$minifiedPath = $bldPath + "wellcomeTimeline.min.js"

New-Item $combinedPath -type file -force | out-null
New-Item $minifiedPath -type file -force | out-null

$files = @()
$files += $srcPath + "js\julianDateConverter.js"
$files += $srcPath + "js\jquery.plugins.js"
$files += $srcPath + "js\utils.js"
$files += $srcPath + "js\baseProvider.js"
$files += $srcPath + "js\wellcomeTimelineProvider.js"
$files += $srcPath + "js\baseTimeline.js"
$files += $srcPath + "js\wellcomeTimeline.js"
$files += $srcPath + "js\timeline.js"
$files += $srcPath + "js\shell.js"
$files += $srcPath + "js\headerPanelView.js"
$files += $srcPath + "js\mainPanelView.js"
$files += $srcPath + "js\footerPanelView.js"
$files += $srcPath + "js\baseDialogueView.js"
$files += $srcPath + "js\genericDialogueView.js"
$files += $srcPath + "js\embedView.js"
$files += $srcPath + "js\detailsView.js"

foreach($file in $files){
    $item = Get-Item $file
    $fileContent = Get-Content $item
    Add-Content $combinedPath $fileContent
    Write-Host $file
}

Write-Host "`r"
Write-Host "complete `n"

Write-Host "---- minify combined scripts ---- `n"

java -jar $cmplPath --js $combinedPath --js_output_file $minifiedPath

Write-Host "complete `n"

Write-Host "---- minify third-party scripts ---- `n"

<#
$libs = @()

foreach($lib in $libs){
	$i =$lib.LastIndexOf(".js")
    $minifiedName = $lib.Remove($i) + ".min.js"
    java -jar $cmplPath --js $lib --js_output_file $minifiedName
}
#>

Write-Host "build complete :-) `n"

pause