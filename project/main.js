// main.js
const { app, BrowserWindow, net } = require('electron');
const path = require('path');

let mainWindow;

// Check if there is an internet connection
async function checkInternetConnection() {
  return new Promise((resolve) => {
    // Try to reach a reliable endpoint
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

    // Timeout after 5 seconds
    setTimeout(() => {
      resolve(false);
    }, 5000);

    request.end();
  });
}

// Load the appropriate page based on connection status
async function loadAppropriateContent() {
  const isOnline = await checkInternetConnection();

  if (isOnline) {
    // Try to load the Next.js frontend
    mainWindow.loadURL('http://localhost:3000').catch(() => {
      // If Next.js server is not running, show offline page
      loadOfflinePage();
    });
  } else {
    loadOfflinePage();
  }
}

// Load the offline/no-internet page
function loadOfflinePage() {
  const offlinePath = path.join(__dirname, 'public', 'no-internet.html');
  mainWindow.loadFile(offlinePath);
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

  // Handle navigation failures (e.g., when trying to load localhost and it fails)
  mainWindow.webContents.on('did-fail-load', (_event, errorCode) => {
    // ERR_CONNECTION_REFUSED, ERR_INTERNET_DISCONNECTED, etc.
    if (errorCode === -102 || errorCode === -106 || errorCode === -21) {
      loadOfflinePage();
    }
  });

  // Optional: open DevTools in development
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
