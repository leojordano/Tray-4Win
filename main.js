const {app, Tray, Menu, BrowserWindow, dialog, shell} = require("electron");
const child = require('child_process').spawn
const path = require('path')
const Store = require('electron-store');
const { spawn } = require("cross-spawn");
const prompt = require('electron-prompt');

const schema = {
    projects: {
        type: 'string',
    }
}

const store = new Store({ schema })

let top = {}

function render(tray = top.trey) {
    top.win = new BrowserWindow({
        width: 800, height: 600, center: true, minimizable: false, show: false,
        webPreferences: {
            nodeIntegration: false,
            webSecurity: true,
            sandbox: true,
        },                                
    });

    top.win.on("close", ev => {
        ev.sender.hide();
        ev.preventDefault();
    });

    // store.clear()
    let storedProjects = store.get('projects') 
    let p = storedProjects ? JSON.parse(storedProjects) : []

    const items = p.map((sp, i) => {

        // NPM
        if(sp.type == 1) {

            return { label: sp.name, submenu: [
                {label: 'VS Code', click: () => spawn.sync('code', [sp.path])},
                {label: 'NPM'},
                {label: 'Remove', click: () => { 
                    store.set('projects', JSON.stringify(p.filter(i => i.name !== sp.name)))
                    render()
                }},
                {label: 'Repo', click: () => require("openurl").open( sp.repo )},
                {label: 'Open Directory', click: () => spawn.sync('explorer', ['.'])},
                {label: 'Open Terminal', click: () => spawn.sync('start', ['cmd'], { cwd: String(sp.path)})},
            ] }
        }

        // YARN
        if(sp.type == 0) {

            return { label: sp.name, submenu: [
                {label: 'VS Code', click: () => spawn.sync('code', [sp.path])},
                {label: 'Yarn'},
                {label: 'Remove', click: () => { 
                    store.set('projects', JSON.stringify(p.filter(i => i.name !== sp.name)))
                    render()
                }},
                {label: 'Repo', click: () => require("openurl").open( sp.repo )},
                {label: 'Directory', click: () => spawn.sync('explorer', [sp.path])},
                {label: 'Terminal', click: () => {
                    let t = spawn.sync('start', ['cmd'], { cwd: String(sp.path)})
                }},
            ] }
        }

        // WP
        return { label: sp.name, submenu: [
            {label: 'VS Code', click: () => spawn.sync('code', [sp.path])},
            {label: 'WordPress'},
            {label: 'Remover', click: () => { 
                store.set('projects', JSON.stringify(p.filter(i => i.name !== sp.name)))
                render()
            }},
            {label: 'Repo', click: () => require("openurl").open( sp.repo )},
            {label: 'Open Directory', click: () => spawn.sync('explorer', ['.'])},
            {label: 'Open Terminal', click: () => spawn.sync('start', ['cmd'], { cwd: String(sp.path)})},
        ] }
    })

    const menu = Menu.buildFromTemplate([
        {label: 'Add Project', click: async () => {
            try {
                let d = await dialog.showOpenDialog({ properties: ['openDirectory'] })
                let name = await prompt({ title: 'Project Name', label: 'Name', value: '' })
                let type = await prompt({ title: 'Project Type', label: 'Type', type: 'select' , selectOptions: [
                    'YARN', 'NPM', 'WP', 'None'
                ]})
                let repo = await prompt({ title: 'Project Repository', label: 'Name', value: '' })
                
                if(name === null || name === '' || name === undefined) {
                    return null
                }
    
                if(type === null || type === '' || type === undefined) {
                    return null
                }

                if(repo === null || repo === '' || repo === undefined) {
                    return null
                }
    
                store.set('projects', JSON.stringify([ ...p, {
                    path: d.filePaths,
                    name: name,
                    type: type,
                    repo: repo
                }]))
                render()

            } catch(err) {
                console.log(err)
            }
        }},
        {role: "quit"},
        {type: "separator"},
        ...items,
    ]);


    top.tray.setToolTip("Open Project");
    top.tray.setContextMenu(menu);
}

app.once("ready", ev => {

    top.tray = new Tray(path.join(__dirname, 'assets', 'iconTemplate.png'));
    render(top.tray)
   
});

app.on("before-quit", ev => {
    top.win.removeAllListeners("close");
    top = null;
});
