# RustHTTPS

A lightweight HTTP client desktop application built with **Tauri + React**, featuring a modern dark-themed UI for sending GET/POST requests and viewing responses.

![RustHTTPS](https://img.shields.io/badge/Tauri-2.0-6366f1?style=flat-square)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square)
![Rust](https://img.shields.io/badge/Rust-1.77-dea584?style=flat-square)

## Features

- 🌙 **Modern Dark UI** - Sleek, professional interface inspired by browser devtools
- 📡 **Full HTTP Support** - GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS
- 📝 **Custom Headers** - Add, edit, enable/disable custom headers
- 📄 **Request Body** - JSON body editor with formatting
- 📊 **Response Viewer** - Status, timing, headers, and formatted body
- 📜 **Request History** - Quick access to recent requests
- ⚡ **Fast & Lightweight** - Built with Rust, under 2MB binary

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Rust + Tauri 2.0
- **HTTP Client**: reqwest (Rust)
- **Build**: ~1.5MB standalone Windows executable

## Getting Started

### Prerequisites

- Node.js 18+
- Rust 1.77+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Pokem0n2/rust-https.git
cd rust-https

# Install dependencies
npm install

# Run in development mode
npm run tauri:dev
```

### Build for Production

```bash
npm run tauri:build
```

The executable will be located at `src-tauri/target/release/rust-https.exe`.

## Usage

1. Select HTTP method (GET, POST, etc.)
2. Enter the target URL
3. Add custom headers if needed
4. For POST/PUT/PATCH, add request body in JSON format
5. Click **Send** to execute the request
6. View the response in the Response tab

## Screenshots

```
┌─────────────────────────────────────────────────────────┐
│  RustHTTPS                                    [History] │
├─────────────────────────────────────────────────────────┤
│  [GET ▼]  https://httpbin.org/get           [Send]     │
├─────────────────────────────────────────────────────────┤
│  [Headers]  [Body]  [Response]                          │
├─────────────────────────────────────────────────────────┤
│  Status: 200 OK        Time: 234ms       Size: 0.45 KB  │
├─────────────────────────────────────────────────────────┤
│  {                                                     │
│    "args": {},                                         │
│    "headers": {                                        │
│      "Accept": "*/*",                                  │
│      "Host": "httpbin.org",                            │
│      "User-Agent": "reqwest"                           │
│    },                                                  │
│    "origin": "xx.xx.xx.xx",                            │
│    "url": "https://httpbin.org/get"                    │
│  }                                                     │
└─────────────────────────────────────────────────────────┘
```

<img width="1200" height="828" alt="image" src="https://github.com/user-attachments/assets/fa52eb04-dd0c-4e71-a8bb-b720ee08c970" />


## License

MIT
