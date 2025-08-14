const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

function printWindowsRaw(tmpFile, printerShare, callback) {
  const command = `cmd /c copy /b "${tmpFile}" "${printerShare}"`;

  exec(command, (err, stdout, stderr) => {
    fs.unlinkSync(tmpFile);
    if (err) {
      console.error('Error printing (Windows RAW):', err);
      return callback(err);
    }
    console.log('Print job sent successfully (Windows RAW)!');
    callback(null);
  });
}

function printLinux(tmpFile, printerName, callback) {
  const command = `lp -d ${printerName} ${tmpFile}`;

  exec(command, (err, stdout, stderr) => {
    fs.unlinkSync(tmpFile);
    if (err) {
      console.error('Error printing (Linux):', err);
      return callback(err);
    }
    console.log('Print job sent successfully (Linux)!');
    callback(null);
  });
}

app.post('/print', async (req, res) => {
  const { escposData, printerName } = req.body;

  if (!escposData) {
    return res.status(400).send({ message: 'ESC/POS data not provided.' });
  }

  let buffer;
  try {
    buffer = Buffer.from(escposData, 'base64');
  } catch (err) {
    return res.status(400).send({ message: 'Error decoding Base64.', error: err.message });
  }

  const tmpFile = path.join(os.tmpdir(), 'escpos_print.bin');
  fs.writeFileSync(tmpFile, buffer);

  const isWindows = process.platform === 'win32';

  if (isWindows) {
    const computerName = os.hostname();
    const printerShareName = printerName || "escpos_printer";
    const targetPrinter = `\\${computerName}\${printerShareName}`;

    printWindowsRaw(tmpFile, targetPrinter, (err) => {
      if (err) return res.status(500).send({ message: 'Error printing', error: err.message });
      res.send({ message: 'Print job sent successfully!' });
    });
  } else {
    const targetPrinter = printerName || "escpos_printer";
    printLinux(tmpFile, targetPrinter, (err) => {
      if (err) return res.status(500).send({ message: 'Error printing', error: err.message });
      res.send({ message: 'Print job sent successfully!' });
    });
  }
});

const PORT = process.env.PORT || 50440;
app.listen(PORT, () => console.log(`Print server running on port ${PORT}`));
