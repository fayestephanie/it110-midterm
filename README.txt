GROUP 8 - IT 110 MIDTERMS
Project: QR Code Scanner / Reader

GROUP MEMBERS AND ROLES
1. Faye Stephanie F. Bihag - JavaScript Logic & API Integration; Project Management & Documentation
2. Pauline S. Alvez - HTML Structure & Semantics
3. Mary Jane Quisto - CSS Styling & Layout

PROJECT OVERVIEW
This project includes a group portfolio homepage and a single-page QR Code Scanner application. Users can scan QR codes with a device camera or upload an image containing a QR code. The decoded text or link is displayed on the page. Web links can be opened after the user reviews them, and results can be copied or cleared.

FILES
- index.html: Group portfolio homepage with project introduction and member profiles
- style.css: Portfolio styling and responsive layout
- script.js: Portfolio carousel and interactions
- app.html: Main QR scanner application page
- app-style.css: QR scanner styling and responsive layout
- app.js: Camera scanning, QR Server API requests, result display, copy, and error handling
- assets/: Team photos and interface icons

API AND LIBRARY
1. QR Server Read API (used for uploaded-image decoding)
   Endpoint: https://api.qrserver.com/v1/read-qr-code/
   Documentation: https://goqr.me/api/doc/read-qr-code/
   Method: HTTP POST with multipart/form-data; the image is sent in the request field named "file". The response is JSON and the app displays the decoded data.

2. html5-qrcode (used for live camera scanning in the browser)
   Project/documentation: https://github.com/mebjas/html5-qrcode
   CDN: https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.4/html5-qrcode.min.js
   The library requests camera access after the user presses Start camera. Camera scanning is decoded in the browser; it does not send camera frames to QR Server.

PRIVACY NOTE
Live camera scanning is processed in the browser. When the user selects an image, the image file is uploaded to QR Server for decoding. Do not upload sensitive images. A decoded QR code may contain an unsafe link; review it before opening it.

HOW TO RUN
1. Keep all HTML, CSS, JavaScript, and assets files together in the same project folder structure.
2. Open the project folder in VS Code.
3. Start a local server, for example with the VS Code Live Server extension.
4. Open index.html through the local server.
5. Click OPEN SCANNER to open app.html.
6. For live scanning, press Start camera and allow camera permission. Camera access normally requires HTTPS or localhost.
7. To scan an image instead, select an image file containing a QR code. An internet connection is required for the QR Server API and the html5-qrcode CDN.
