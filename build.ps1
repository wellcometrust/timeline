
# Get last commit hash and date
$commitComment = "// " + (git log --pretty=format:"%h - %ad" -1 --date=short)

# Initialise paths
$path = $MyInvocation.MyCommand.Path
$parentDir = $path.Remove($path.LastIndexOf("\"))

$cmplPath = "C:\Temp\google-closure\compiler.jar"
$srcPath = $parentDir + "\src\"
$bldPath = $parentDir + "\build\"

# Minify embed.js
Write-Host "---- minify embed.js ---- `n"

$embedSrc = $srcPath + "js\embed.js"
$embedBuild = $bldPath + "embed.min.js"

New-Item $embedBuild -type file -force | out-null

$minifiedResult = java -jar $cmplPath --js $embedSrc
$minifiedResult = $commitComment + "`n" + $minifiedResult

Add-Content $embedBuild $minifiedResult

Write-Host "complete `n"

# Combine timeline scripts
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

Add-Content $combinedPath $commitComment

foreach($file in $files){
    $item = Get-Item $file
    $fileContent = Get-Content $item
    Add-Content $combinedPath $fileContent
    Write-Host $file
}

Write-Host "`r"
Write-Host "complete `n"

# Minify combined timeline scripts
Write-Host "---- minify combined scripts ---- `n"

$minifiedResult = java -jar $cmplPath --js $combinedPath
$minifiedResult = $commitComment + "`n" + $minifiedResult
Add-Content $minifiedPath $minifiedResult

Write-Host "complete `n"

# Minify any further third party scripts (optional)
Write-Host "---- minify third-party scripts ---- `n"

<#
$libs = @()

foreach($lib in $libs){
	$i =$lib.LastIndexOf(".js")
    $minifiedName = $lib.Remove($i) + ".min.js"
    java -jar $cmplPath --js $lib --js_output_file $minifiedName
}
#>

Write-Host "build complete `n"

pause