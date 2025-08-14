# ESC/POS Print Server

## Description

This tool runs a simple Node.js server that receives ESC/POS commands encoded in Base64 via an HTTP POST request and sends them to a designated receipt printer.

It is cross-platform and supports both Windows and Linux environments.

## How it Works

The server exposes a single API endpoint (`/print`). When it receives a request, it decodes the Base64 `escposData` into a binary file and then uses the operating system's native commands to send this file directly to the printer.

### Windows

On Windows, the server uses the `copy /b` command to send the binary data to a shared printer. For this to work, the target printer **must be shared** on the network, and the server will access it via its UNC path (e.g., `\\COMPUTER_NAME\PrinterShareName`).

The default printer share name is `escpos_printer`.

### Linux

On Linux, the server uses the `lp` command to send the print job to a CUPS (Common UNIX Printing System) printer. The printer must be configured in CUPS.

The default printer name is `escpos_printer`.

## Requirements

- [Node.js](https://nodejs.org/) (v20 or later recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

## Installation

1. Clone or download the repository.
2. Navigate to the project directory.
3. Install the dependencies:
    ```bash
    npm install
    ```

## Running the Server

To start the print server, run the following command:

```bash
node server.js
```

By default, the server will run on port `50440`. You can change this by setting the `PORT` environment variable.

```bash
# Example for Linux/macOS
PORT=8080 node server.js

# Example for Windows Command Prompt
set PORT=8080 && node server.js
```

## API Usage

### Endpoint: `POST /print`

Accepts a JSON body to send a print job.

### Request Body

-   `escposData` (string, **required**): The ESC/POS binary data encoded in Base64.
-   `printerName` (string, *optional*): The name of the target printer.
    -   On **Windows**, this is the **share name** of the printer. If not provided, it defaults to `escpos_printer`.
    -   On **Linux**, this is the **CUPS name** of the printer. If not provided, it defaults to `escpos_printer`.

### Example

Here is an example using `curl` to send a print job:

```bash
curl -X POST http://localhost:50440/print \
-H "Content-Type: application/json" \
-d {
  "escposData": "SGVsbG8gV29ybGQhCg==", # "Hello World!" in Base64
  "printerName": "My_Receipt_Printer"
}
```

## Generating a Standalone Executable

You can create a standalone binary for Windows or Linux that includes the Node.js runtime, so you don\'t need to have Node.js installed on the target machine.

### 1. Install `pkg`

First, install the `pkg` tool globally:

```bash
npm install -g pkg
```

### 2. Building for Windows

To generate an `.exe` file for 64-bit Windows, run the following command:

```bash
pkg server.js --targets node20-win-x64 --output escpos-server.exe
```

This will create the `escpos-server.exe` file in the project directory.

### 3. Building for Linux

To generate a binary for 64-bit Linux, run this command:

```bash
pkg server.js --targets node20-linux-x64 --output escpos-server
```

This will create the `escpos-server` executable file. You may need to give it execute permissions:

```bash
chmod +x escpos-server
```
