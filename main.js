const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const dialog = electron.dialog;
const Menu = electron.Menu;
const ipcMain = electron.ipcMain;
const storage = require('electron-json-storage');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
  let mainWindow

  function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 800, height: 600})
    // and load the index.html of the app.
    mainWindow.maximize()

    mainWindow.loadURL('file://' + __dirname + '/index.html')

    var menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);




    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.

      // dialog.showMessageBox({message: 'good bye', buttons: ['OK']});

      mainWindow = null
    })
  }

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
  app.on('ready', createWindow)

// Quit when all windows are closed.
  app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q

    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
      createWindow()
    }
  })

  function addVideo() {
    var win = new BrowserWindow({ width: 800, height: 600, show: false });
    win.on('closed', function() {
      win = null;
    });
    win.loadURL('file://' + __dirname + '/add.html');
    win.show();
  }
  ipcMain.on('add-video', function() {
    mainWindow.webContents.send('add-video');
  });

  ipcMain.on('open-add-video', function() {
    addVideo();
  });

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

  var template = [
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        },
        {
          label: 'Redo',
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectall'
        },
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: function(item, focusedWindow) {
            if (focusedWindow)
              focusedWindow.reload();
          }
        },
        {
          label: 'Toggle Full Screen',
          accelerator: (function() {
            if (process.platform == 'darwin')
              return 'Ctrl+Command+F';
            else
              return 'F11';
          })(),
          click: function(item, focusedWindow) {
            if (focusedWindow)
              focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: (function() {
            if (process.platform == 'darwin')
              return 'Alt+Command+I';
            else
              return 'Ctrl+Shift+I';
          })(),
          click: function(item, focusedWindow) {
            if (focusedWindow)
              focusedWindow.webContents.toggleDevTools();
          }
        },
      ]
    },
    {
      label: 'Navigate',
      submenu: [
        {
          label: 'Next',
          accelerator: 'Right',
          click: function() {
            mainWindow.webContents.send('next');
          }
        },
        {
          label: 'Pause/Play',
          accelerator: 'Space',
          click: function() {
            mainWindow.webContents.send('pause_play');
          }
        },
        {
          label: 'Fast forward',
          accelerator: 'CmdOrCtrl+Right',
          click: function() {
            mainWindow.webContents.send('fastForward');
          }
        },
        {
          label: 'Add video',
          accelerator: 'Plus',
          click: function () {
            addVideo();
          }
        },
        {
          label: 'clear db',
          click: function () {
            storage.clear(function(error) {
              if (error) throw error;
            });
          }
        },
      ]

    },
    {
      label: 'Window',
      role: 'window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        },
      ]
    },
    {
      label: 'Help',
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: function() { require('electron').shell.openExternal('http://electron.atom.io') }
        },
      ]
    },
  ];
