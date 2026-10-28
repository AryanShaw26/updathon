# Updathon Windows icon

The PNG is used for the system-tray icon and the multi-resolution ICO is used
for the Windows executable, installer, and shortcuts. To replace the branding,
overwrite `resources/icons/updathon.ico` with a Windows icon containing 16, 32,
48, and 256 pixel images. The Windows packaging configuration detects this
file automatically; an ICO remains optional and a missing file will not fail
the build.
