// main.js
const { app, BrowserWindow, net } = require('electron');
const path = require('path');

let mainWindow;

// Your deployed frontend URL (update this after Vercel deployment)
const FRONTEND_URL = 'https://driving-school-manager.vercel.app';

// Check if there is an internet connection
async function checkInternetConnection() {
  return new Promise((resolve) => {
    const request = net.request({
      method: 'HEAD',
      url: 'https://www.google.com'
    });

    request.on('response', () => {
      resolve(true);
    });

    request.on('error', () => {
      resolve(false);
    });

    setTimeout(() => {
      resolve(false);
    }, 5000);

    request.end();
  });
}

// Load the offline/no-internet page
function loadOfflinePage() {
  const offlinePath = path.join(__dirname, 'public', 'no-internet.html');
  mainWindow.loadFile(offlinePath);
}

// Load the appropriate page based on connection status
async function loadAppropriateContent() {
  const isOnline = await checkInternetConnection();

  if (isOnline) {
    // Load the deployed frontend
    mainWindow.loadURL(FRONTEND_URL).catch(() => {
      loadOfflinePage();
    });
  } else {
    loadOfflinePage();
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Load content based on connection status
  loadAppropriateContent();

  // Handle navigation failures
  mainWindow.webContents.on('did-fail-load', (_event, errorCode) => {
    if (errorCode === -102 || errorCode === -106 || errorCode === -21) {
      loadOfflinePage();
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

