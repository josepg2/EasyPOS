/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let backgroundWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map((name) => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    webPreferences:
      (process.env.NODE_ENV === 'development' ||
        process.env.E2E_BUILD === 'true') &&
      process.env.ERB_SECURE !== 'true'
        ? {
            nodeIntegration: true,
          }
        : {
            preload: path.join(__dirname, 'dist/renderer.prod.js'),
          },
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  backgroundWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  backgroundWindow.loadURL(`file://${__dirname}/background.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  backgroundWindow.webContents.on('did-finish-load', () => {
    if (!backgroundWindow) {
      throw new Error('"backgroundWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      backgroundWindow.minimize();
    } else {
      backgroundWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    backgroundWindow?.close();
  });

  backgroundWindow.on('closed', () => {
    backgroundWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', createWindow);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

app.allowRendererProcessReuse = false;

autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
autoUpdater.on('update-available', (_info) => {
  console.log('Update available.');
});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
autoUpdater.on('update-not-available', (_info) => {
  console.log('Update not available.');
});
autoUpdater.on('error', (err) => {
  console.log(`Error in auto-updater. ${err}`);
});
autoUpdater.on('download-progress', (progressObj) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  let log_message = `Download speed: ${progressObj.bytesPerSecond}`;
  log_message = `${log_message} - Downloaded ${progressObj.percent}%`;
  // eslint-disable-next-line prettier/prettier
  log_message = `${log_message} (${progressObj.transferred}/${progressObj.total})`;
  console.log(log_message);
});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
autoUpdater.on('update-downloaded', (_ev, _info) => {
  // Wait 5 seconds, then quit and install
  // In your application, you don't need to wait 5 seconds.
  // You could call autoUpdater.quitAndInstall(); immediately
  console.log('Update downloaded');

  setTimeout(() => {
    autoUpdater.quitAndInstall();
  }, 5000);
});
