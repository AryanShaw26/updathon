const { existsSync } = require('node:fs')
const { join } = require('node:path')

const iconPath = join(__dirname, 'resources', 'icons', 'updathon.ico')
const hasIcon = existsSync(iconPath)

module.exports = {
  appId: 'com.updathon.app',
  productName: 'Updathon',
  directories: {
    output: 'dist',
  },
  files: [
    'out/**/*',
    'package.json',
    {
      from: 'node_modules/.prisma/client',
      to: 'node_modules/.prisma/client',
      filter: ['**/*'],
    },
  ],
  extraResources: [
    {
      from: 'resources/updathon-template.db',
      to: 'updathon-template.db',
    },
    {
      from: 'resources/icons',
      to: 'icons',
    },
  ],
  asarUnpack: [
    '**/*.node',
    'node_modules/.prisma/client/**/*',
  ],
  win: {
    executableName: 'Updathon',
    target: [
      { target: 'nsis', arch: ['x64'] },
      { target: 'portable', arch: ['x64'] },
    ],
    artifactName: '${productName} Portable.${ext}',
    ...(hasIcon ? { icon: iconPath } : {}),
  },
  nsis: {
    oneClick: false,
    perMachine: false,
    allowElevation: true,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'Updathon',
    runAfterFinish: true,
    deleteAppDataOnUninstall: false,
    artifactName: '${productName} Setup.${ext}',
    ...(hasIcon ? { installerIcon: iconPath, uninstallerIcon: iconPath } : {}),
  },
}
