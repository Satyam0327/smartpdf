# SmartPDF Compressor

A privacy-first, 100% browser-based PDF compression tool.

## Features

- **100% Offline Processing**: Uses `pdf.js` and `jsPDF` to parse, downsample, and reconstruct PDFs entirely within the browser's memory. Your sensitive documents never leave your device.
- **Privacy-Safe AI Analysis**: Analyzes file metadata (like size and page count) to recommend the best compression settings, without ever reading the text or images inside your PDF.
- **Batch Processing**: Designed to handle multiple files sequentially to prevent browser out-of-memory (OOM) crashes, making it safe for processing 100+ PDFs.
- **Firebase Authentication**: Seamless Google Sign-In to track usage quotas securely across devices.
- **Corrupt/Encrypted File Handling**: Built-in edge-case management gracefully skips and reports encrypted or unreadable files without crashing the batch process.

## Architecture & Edge Case Handling

### 1. Large Files & 100+ PDF Batches
The application uses a strict sequential `for` loop (rather than `Promise.all`) during the compression phase. This intentional design choice ensures that the browser's garbage collector can free up memory between each document. This prevents the browser tab from crashing when a user drops 100+ large PDFs at once.

### 2. Corrupted & Encrypted Files
The compression engine includes a robust `try/catch` block for every individual file. If a file is encrypted (password protected) or corrupted, the app catches the specific error, marks that single file as "Failed", and continues compressing the rest of the batch seamlessly. 

### 3. Cross-Browser Compatibility
The core compression relies on standard HTML5 `<canvas>` and WebGL APIs provided by modern browsers. It is tested to work on:
- Google Chrome (Desktop/Mobile)
- Mozilla Firefox
- Safari (macOS/iOS)
- Microsoft Edge

## Development

This project was bootstrapped with React, Vite, and Tailwind CSS.

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Privacy Policy & FAQ
The application includes a built-in Privacy Policy and FAQ section accessible via the footer links. All data tracking is strictly limited to usage metrics (e.g., "5 compressions today") tied to Firebase Auth.
