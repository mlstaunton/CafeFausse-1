$ErrorActionPreference = "Stop"

$sourceFiles = @{
  "home-cafe-fausse.png" = "C:\Users\calib\.cursor\projects\empty-window\assets\c__Users_calib_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_home-cafe-fausse-938ad709-6841-4be3-b752-51cbc403e04f.png"
  "gallery-special-event.png" = "C:\Users\calib\.cursor\projects\empty-window\assets\c__Users_calib_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_gallery-special-event-4b370d4a-624e-471c-bff5-af784d83cb9c.png"
  "gallery-ribeye-steak.png" = "C:\Users\calib\.cursor\projects\empty-window\assets\c__Users_calib_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_gallery-ribeye-steak-377dccf3-d543-4baf-aeec-0f1113211439.png"
  "gallery-cafe-interior.png" = "C:\Users\calib\.cursor\projects\empty-window\assets\c__Users_calib_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_gallery-cafe-interior-28c4d8ad-56d9-4df6-9e49-b0780b9556b1.png"
}

$destinationDir = "C:\Users\calib\OneDrive\Documents\Quantic\Cafe Fausse\frontend\public\images"
New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null

foreach ($entry in $sourceFiles.GetEnumerator()) {
  Copy-Item -Path $entry.Value -Destination (Join-Path $destinationDir $entry.Key) -Force
}

Write-Host "Copied provided assets to frontend/public/images"
