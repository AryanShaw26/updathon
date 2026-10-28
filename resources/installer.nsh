!include "LogicLib.nsh"
!include "nsDialogs.nsh"

!ifndef BUILD_UNINSTALLER
Var DesktopShortcutCheckbox
Var CreateDesktopShortcut

!macro customPageAfterChangeDir
  Page custom DesktopShortcutPageCreate DesktopShortcutPageLeave
!macroend

Function DesktopShortcutPageCreate
  nsDialogs::Create 1018
  Pop $0
  ${NSD_CreateLabel} 0 0 100% 12u "Choose whether to add a shortcut to your desktop."
  Pop $0
  ${NSD_CreateCheckbox} 0 20u 100% 12u "Create a Desktop shortcut"
  Pop $DesktopShortcutCheckbox
  ${NSD_Check} $DesktopShortcutCheckbox
  nsDialogs::Show
FunctionEnd

Function DesktopShortcutPageLeave
  ${NSD_GetState} $DesktopShortcutCheckbox $CreateDesktopShortcut
FunctionEnd
!endif

!macro customInstall
  ${If} $CreateDesktopShortcut == ${BST_CHECKED}
    CreateShortCut "$DESKTOP\Updathon.lnk" "$INSTDIR\Updathon.exe"
    WriteRegStr HKCU "Software\Updathon" "DesktopShortcut" "1"
  ${Else}
    WriteRegStr HKCU "Software\Updathon" "DesktopShortcut" "0"
  ${EndIf}
!macroend

!macro customUnInstall
  ReadRegStr $0 HKCU "Software\Updathon" "DesktopShortcut"
  ${If} $0 == "1"
    Delete "$DESKTOP\Updathon.lnk"
  ${EndIf}
  DeleteRegKey HKCU "Software\Updathon"
!macroend
