// main.js
const { app, BrowserWindow, net } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let nextServer;
const isDev = !app.isPackaged;
const PORT = 3000;

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

// Wait for the Next.js server to be ready
function waitForServer(url, maxAttempts = 30) {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const check = () => {
      attempts++;
      const request = net.request(url);

      request.on('response', () => {
        resolve(true);
      });

      request.on('error', () => {
        if (attempts >= maxAttempts) {
          reject(new Error('Server did not start in time'));
        } else {
          setTimeout(check, 1000);
        }
      });

      request.end();
    };

    check();
  });
}

// Start the Next.js server
function startNextServer() {
  return new Promise((resolve, reject) => {
    let serverPath;
    let serverScript;

    if (isDev) {
      // In development, use npm run start
      serverPath = process.cwd();
      const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
      nextServer = spawn(npmCmd, ['run', 'start'], {
        cwd: serverPath,
        env: {
          ...process.env,
          PORT: PORT.toString(),
          NODE_ENV: 'production'
        },
        shell: true
      });
    } else {
      // In production, use the standalone server
      serverPath = path.join(process.resourcesPath, 'app', '.next', 'standalone');
      serverScript = path.join(serverPath, 'server.js');

      nextServer = spawn('node', [serverScript], {
        cwd: serverPath,
        env: {
          ...process.env,
          PORT: PORT.toString(),
          NODE_ENV: 'production'
        }
      });
    }

    nextServer.stdout.on('data', (data) => {
      console.log(`Next.js: ${data}`);
      if (data.toString().includes('Ready') || data.toString().includes('started') || data.toString().includes('Listening')) {
        resolve();
      }
    });

    nextServer.stderr.on('data', (data) => {
      console.error(`Next.js Error: ${data}`);
    });

    nextServer.on('error', (error) => {
      console.error('Failed to start Next.js server:', error);
      reject(error);
    });

    // Resolve after a timeout as fallback
    setTimeout(resolve, 8000);
  });
}

// Load the offline/no-internet page
function loadOfflinePage() {
  const offlinePath = isDev
    ? path.join(__dirname, 'public', 'no-internet.html')
    : path.join(process.resourcesPath, 'app', 'public', 'no-internet.html');
  mainWindow.loadFile(offlinePath);
}

// Load the appropriate page based on connection status
async function loadAppropriateContent() {
  const isOnline = await checkInternetConnection();

  if (isOnline) {
    try {
      // In development, assume Next.js dev server is running
      if (isDev) {
        await mainWindow.loadURL(`http://localhost:${PORT}`);
      } else {
        // In production, start the Next.js server first
        await startNextServer();
        await waitForServer(`http://localhost:${PORT}`);
        await mainWindow.loadURL(`http://localhost:${PORT}`);
      }
    } catch (error) {
      console.error('Failed to load app:', error);
      loadOfflinePage();
    }
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

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // Kill the Next.js server when app closes
  if (nextServer) {
    nextServer.kill();
  }
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Cleanup on quit
app.on('quit', () => {
  if (nextServer) {
    nextServer.kill();
  }
});

