/*
 * QR Scanner application logic.
 * Live camera decoding uses html5-qrcode in the browser.
 * Uploaded images use the free QR Server Read API.
 */
const QR_SERVER_READ_API = 'https://api.qrserver.com/v1/read-qr-code/';
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const imageInput = document.getElementById('imageInput');
const cameraStatus = document.getElementById('cameraStatus');
const emptyState = document.getElementById('emptyState');
const resultContent = document.getElementById('resultContent');
const resultText = document.getElementById('resultText');
const resultType = document.getElementById('resultType');
const message = document.getElementById('message');
const copyButton = document.getElementById('copyButton');
const openLinkButton = document.getElementById('openLinkButton');
const clearButton = document.getElementById('clearButton');

let scanner = null;
let scannerRunning = false;
let lastDecodedText = '';

function setMessage(text, state = '') {
  message.textContent = text;
  message.className = `message ${state}`.trim();
}

function isWebUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function showResult(decodedText) {
  const value = String(decodedText || '').trim();
  if (!value) {
    setMessage('The QR code did not contain readable text. Try another image.', 'error');
    return;
  }
  lastDecodedText = value;
  emptyState.hidden = true;
  resultContent.hidden = false;
  resultText.value = value;
  const link = isWebUrl(value);
  resultType.textContent = link ? 'WEB LINK' : 'DECODED TEXT';
  openLinkButton.hidden = !link;
  if (link) openLinkButton.href = value;
  setMessage('QR code read successfully.', 'success');
}

function ensureLibrary() {
  if (typeof Html5Qrcode === 'undefined') {
    setMessage('The QR scanner library could not load. Check your internet connection and try again.', 'error');
    cameraStatus.textContent = 'Unavailable';
    return false;
  }
  return true;
}

async function startCamera() {
  if (!ensureLibrary()) return;
  if (scannerRunning) return;
  startButton.disabled = true;
  cameraStatus.textContent = 'Starting…';
  setMessage('Requesting camera permission…');
  try {
    if (!scanner) scanner = new Html5Qrcode('reader');
    await scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 230, height: 230 }, aspectRatio: 1.0 },
      (decodedText) => {
        showResult(decodedText);
        stopCamera();
      },
      () => { /* No QR code in this video frame; keep scanning quietly. */ }
    );
    scannerRunning = true;
    stopButton.disabled = false;
    cameraStatus.textContent = 'Scanning';
    setMessage('Camera is active. Hold a QR code inside the scan frame.');
  } catch (error) {
    console.error('Camera start error:', error);
    cameraStatus.textContent = 'Not active';
    startButton.disabled = false;
    stopButton.disabled = true;
    const detail = error && error.name === 'NotAllowedError'
      ? 'Camera permission was denied. Allow camera access in your browser settings, then try again.'
      : 'Could not start the camera. Check camera permissions and make sure this page is opened on HTTPS or localhost.';
    setMessage(detail, 'error');
  }
}

async function stopCamera() {
  if (scanner && scannerRunning) {
    try {
      await scanner.stop();
      await scanner.clear();
    } catch (error) {
      console.warn('Camera stop notice:', error);
    }
  }
  scannerRunning = false;
  startButton.disabled = false;
  stopButton.disabled = true;
  cameraStatus.textContent = 'Ready';
}

startButton.addEventListener('click', startCamera);
stopButton.addEventListener('click', async () => {
  await stopCamera();
  setMessage('Camera stopped. You can start another scan whenever you are ready.');
});

imageInput.addEventListener('change', async (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    setMessage('Please choose a valid image file.', 'error');
    imageInput.value = '';
    return;
  }
  setMessage('Uploading image to the QR decoding service…');
  try {
    const formData = new FormData();
    formData.append('file', file, file.name);

    const response = await fetch(QR_SERVER_READ_API, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`QR Server returned HTTP ${response.status}`);
    }

    const data = await response.json();
    const decodedText = data?.[0]?.symbol?.[0]?.data;
    const decodeError = data?.[0]?.symbol?.[0]?.error;

    if (decodedText) {
      showResult(decodedText);
    } else {
      throw new Error(decodeError || 'No QR code was found in the image.');
    }
  } catch (error) {
    console.warn('Image scan error:', error);
    const messageText = error instanceof TypeError
      ? 'Could not contact the QR decoding service. Check your internet connection and try again.'
      : 'Could not read a QR code from that image. Try a sharper image with the full code visible.';
    setMessage(messageText, 'error');
  } finally {
    imageInput.value = '';
  }
});

copyButton.addEventListener('click', async () => {
  if (!lastDecodedText) return;
  try {
    await navigator.clipboard.writeText(lastDecodedText);
    setMessage('Result copied to clipboard.', 'success');
  } catch {
    // Fallback for browsers that do not grant clipboard access.
    resultText.focus();
    resultText.select();
    const copied = document.execCommand('copy');
    setMessage(copied ? 'Result copied to clipboard.' : 'Select the result text and copy it manually.', copied ? 'success' : 'error');
  }
});

clearButton.addEventListener('click', () => {
  lastDecodedText = '';
  resultText.value = '';
  resultContent.hidden = true;
  emptyState.hidden = false;
  openLinkButton.hidden = true;
  setMessage('Result cleared. Ready for another scan.');
});

window.addEventListener('beforeunload', () => {
  if (scanner && scannerRunning) scanner.stop().catch(() => {});
});
