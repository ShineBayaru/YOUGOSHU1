
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "TechGloss Admin Console",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Build хийгдсэн Vite файлыг ачааллах
  const indexPath = app.isPackaged 
    ? path.join(__dirname, 'dist-vite', 'index.html')
    : path.join(__dirname, 'index.html');
    
  if (app.isPackaged) {
    win.loadFile(indexPath);
  } else {
    // Development үед
    win.loadURL('http://localhost:5173');
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
