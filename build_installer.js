const { MSICreator } = require("electron-wix-msi")
const path = require('path')

const APP_DIR = path.resolve(__dirname, './OnCode-win32-x64')
const OUT_DIR = path.resolve(__dirname, './windows_installer')

const msiCreator = new MSICreator({
    appDirectory: APP_DIR,
    outputDirectory: OUT_DIR,

    description: 'Open yours App',
    exe: 'OnCode.exe',
    name: 'OnCode',
    manufacturer: 'Jordanoo',
    version: '1.1.0',
    ui: {
        chooseDirectory: true
    }
})
msiCreator.create().then(() => msiCreator.compile())