import { existsSync, mkdirSync, readdirSync, copyFileSync, lstatSync } from 'fs';
import { join } from 'path';

// Create dist directory if it doesn't exist
if (!existsSync('dist')) {
  mkdirSync('dist');
}

// Files and directories to copy (excluding node_modules and other unnecessary files)
const itemsToCopy = [
  'index.html',
  'css',
  'js',
  'data',
  'images',
  'css',
  'favicon.ico',
  'apple-touch-icon.png',
  'favicon-32x32.png',
  'favicon-16x16.png',
  'site.webmanifest',
  'robots.txt',
  'sitemap.xml',
  'LICENSE',
  'README.md',
  '.htaccess',
  'security.txt',
  'sw.js',
  'js/components/PerformanceMonitor.js',
  'js/components/ErrorHandler.js'
];

let copiedCount = 0;

itemsToCopy.forEach(item => {
  const sourcePath = join(process.cwd(), item);
  const destPath = join(process.cwd(), 'dist', item);
  
  if (existsSync(sourcePath)) {
    if (lstatSync(sourcePath).isDirectory()) {
      // Copy directory recursively
      copyDirectory(sourcePath, destPath);
    } else {
      // Copy file
      copyFileSync(sourcePath, destPath);
      copiedCount++;
    }
  }
});

console.log(`Successfully copied ${copiedCount} files and directories to dist/`);

// Helper function to copy directory recursively
function copyDirectory(src, dest) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }
  
  const items = readdirSync(src);
  
  items.forEach(item => {
    const srcPath = join(src, item);
    const destPath = join(dest, item);
    
    if (lstatSync(srcPath).isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
      copiedCount++;
    }
  });
}