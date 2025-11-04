// Helper functions
function randomEAN13Number() {
    let value = '';
    for (let i = 0; i < 12; i++) {
        value += Math.floor(Math.random() * 10);
    }
    return value;
}

function randomCode39() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%';
    let value = '';
    const length = Math.floor(Math.random() * (10 - 4 + 1)) + 4;
    for (let i = 0; i < length; i++) {
        value += chars[Math.floor(Math.random() * chars.length)];
    }
    return value;
}

function randomITF() {
    let value = '';
    const length = Math.floor(Math.random() * (10 - 4 + 1)) + 4;
    // Ensure even number of digits
    const numDigits = length % 2 === 0 ? length : length + 1;
    for (let i = 0; i < numDigits; i++) {
        value += Math.floor(Math.random() * 10);
    }
    return value;
}

function randomMSI() {
    let value = '';
    const length = Math.floor(Math.random() * (10 - 4 + 1)) + 4;
    for (let i = 0; i < length; i++) {
        value += Math.floor(Math.random() * 10);
    }
    return value;
}

function randomPharmacodeNumber() {
    return Math.floor(Math.random() * (131070 - 3 + 1)) + 3;
}

function randomCodabar() {
    const chars = '0123456789-$:/.+';
    const startStopChars = 'ABCD';
    const startChar = startStopChars[Math.floor(Math.random() * startStopChars.length)];
    const stopChar = startStopChars[Math.floor(Math.random() * startStopChars.length)];
    const middleLength = Math.floor(Math.random() * (16 - 4 + 1)) + 4;

    let middlePart = '';
    for (let i = 0; i < middleLength; i++) {
        middlePart += chars[Math.floor(Math.random() * chars.length)];
    }

    return startChar + middlePart + stopChar;
}

// Validation and formatting functions
function validateAndFormatInput(text, barcodeType) {
    const trimmedText = text.trim();
    
    switch (barcodeType) {
        case 'ean13':
            // EAN13 requires 12 or 13 digits (12 will auto-calculate check digit)
            const eanDigits = trimmedText.replace(/\D/g, '');
            if (eanDigits.length === 0) {
                throw new Error('EAN13 requires numeric digits (12 or 13 digits)');
            }
            if (eanDigits.length > 13) {
                throw new Error('EAN13 supports maximum 13 digits');
            }
            if (eanDigits.length < 12) {
                throw new Error('EAN13 requires at least 12 digits');
            }
            return eanDigits.slice(0, 13); // Use first 12-13 digits
            
        case 'code39':
            // Code39 supports: A-Z, 0-9, and special characters: - . $ / + % SPACE
            // Some implementations require asterisks, but bwip-js handles it automatically
            if (trimmedText.length === 0) {
                throw new Error('Code39 requires at least one character');
            }
            // Validate allowed characters
            const code39Regex = /^[A-Z0-9\s\-\.\$\/\+\%]+$/i;
            if (!code39Regex.test(trimmedText)) {
                throw new Error('Code39 supports: A-Z, 0-9, and special characters: - . $ / + % SPACE');
            }
            return trimmedText.toUpperCase();
            
        case 'interleaved2of5':
            // ITF requires even number of digits
            const itfDigits = trimmedText.replace(/\D/g, '');
            if (itfDigits.length === 0) {
                throw new Error('ITF requires numeric digits');
            }
            if (itfDigits.length % 2 !== 0) {
                throw new Error('ITF requires an even number of digits. Add or remove one digit.');
            }
            if (itfDigits.length < 2) {
                throw new Error('ITF requires at least 2 digits');
            }
            return itfDigits;
            
        case 'msi':
            // MSI requires numeric digits only
            const msiDigits = trimmedText.replace(/\D/g, '');
            if (msiDigits.length === 0) {
                throw new Error('MSI requires numeric digits only');
            }
            if (msiDigits.length < 1) {
                throw new Error('MSI requires at least one digit');
            }
            return msiDigits;
            
        case 'pharmacode':
            // Pharmacode requires numeric value between 3 and 131070
            const pharmaNum = parseInt(trimmedText, 10);
            if (isNaN(pharmaNum)) {
                throw new Error('Pharmacode requires a numeric value');
            }
            if (pharmaNum < 3 || pharmaNum > 131070) {
                throw new Error('Pharmacode value must be between 3 and 131070');
            }
            return pharmaNum.toString();
            
        case 'rationalizedCodabar':
            // Codabar requires start/stop characters (A, B, C, or D) and valid middle characters
            if (trimmedText.length < 3) {
                throw new Error('Codabar requires at least 3 characters (start char + data + stop char)');
            }
            const startChar = trimmedText[0].toUpperCase();
            const stopChar = trimmedText[trimmedText.length - 1].toUpperCase();
            const middlePart = trimmedText.slice(1, -1);
            
            if (!/[ABCD]/.test(startChar)) {
                throw new Error('Codabar start character must be A, B, C, or D');
            }
            if (!/[ABCD]/.test(stopChar)) {
                throw new Error('Codabar stop character must be A, B, C, or D');
            }
            
            // Validate middle characters: 0-9, -, $, :, /, ., +
            const codabarRegex = /^[0-9\-\$\:\/\.\+]+$/;
            if (middlePart.length === 0) {
                throw new Error('Codabar requires data between start and stop characters');
            }
            if (!codabarRegex.test(middlePart)) {
                throw new Error('Codabar data supports: 0-9, -, $, :, /, ., +');
            }
            return startChar + middlePart + stopChar;
            
        case 'ean8':
            // EAN-8 requires 7 or 8 digits
            const ean8Digits = trimmedText.replace(/\D/g, '');
            if (ean8Digits.length === 0) {
                throw new Error('EAN-8 requires numeric digits (7 or 8 digits)');
            }
            if (ean8Digits.length > 8) {
                throw new Error('EAN-8 supports maximum 8 digits');
            }
            if (ean8Digits.length < 7) {
                throw new Error('EAN-8 requires at least 7 digits');
            }
            return ean8Digits.slice(0, 8);
            
        case 'upca':
            // UPC-A requires 11 or 12 digits
            const upcaDigits = trimmedText.replace(/\D/g, '');
            if (upcaDigits.length === 0) {
                throw new Error('UPC-A requires numeric digits (11 or 12 digits)');
            }
            if (upcaDigits.length > 12) {
                throw new Error('UPC-A supports maximum 12 digits');
            }
            if (upcaDigits.length < 11) {
                throw new Error('UPC-A requires at least 11 digits');
            }
            return upcaDigits.slice(0, 12);
            
        case 'upce':
            // UPC-E requires 6, 7, or 8 digits
            const upceDigits = trimmedText.replace(/\D/g, '');
            if (upceDigits.length === 0) {
                throw new Error('UPC-E requires numeric digits (6, 7, or 8 digits)');
            }
            if (upceDigits.length > 8) {
                throw new Error('UPC-E supports maximum 8 digits');
            }
            if (upceDigits.length < 6) {
                throw new Error('UPC-E requires at least 6 digits');
            }
            return upceDigits.slice(0, 8);
            
        case 'code93':
            // Code93 supports ASCII characters
            if (trimmedText.length === 0) {
                throw new Error('Code93 requires at least one character');
            }
            return trimmedText;
            
        case 'code11':
            // Code11 supports numeric digits and dash
            if (trimmedText.length === 0) {
                throw new Error('Code11 requires at least one character');
            }
            const code11Regex = /^[0-9\-]+$/;
            if (!code11Regex.test(trimmedText)) {
                throw new Error('Code11 supports numeric digits (0-9) and dash (-) only');
            }
            return trimmedText;
            
        default:
            // For other barcode types, return as-is
            return trimmedText;
    }
}

async function getDefaultValue(barcodeType) {
    switch (barcodeType) {
        case 'pharmacode':
            return '12345';
        case 'rationalizedCodabar':
            return 'A1234567890B';
        case 'code39':
            return 'CODE39';
        case 'code93':
            return 'CODE93';
        case 'code11':
            return '12345';
        case 'interleaved2of5':
            return '123456';
        case 'msi':
            return '123456';
        case 'ean13':
            return randomEAN13Number();
        case 'ean8':
            return '1234567';
        case 'upca':
            return '01234567890';
        case 'upce':
            return '012345';
        case 'qrcode':
            const url = await getCurrentTabUrl();
            return url;
        default:
            return '123456789012';
    }
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    const resultDiv = document.getElementById('result');
    let successMsg = resultDiv.querySelector('.success-message');
    if (!successMsg) {
        successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        resultDiv.appendChild(successMsg);
    }
    successMsg.textContent = message;
    successMsg.style.display = 'block';
    setTimeout(() => {
        successMsg.style.display = 'none';
    }, 2000);
}

// Get settings from UI
function getBarcodeSettings() {
    const scale = parseFloat(document.getElementById('scale').value) || 3;
    const showText = document.getElementById('showText').checked;
    const fgColor = document.getElementById('fgColor').value;
    const bgColor = document.getElementById('bgColor').value;
    
    return { scale, showText, fgColor, bgColor };
}

// Generate barcode
function generateBarcode() {
    const text = document.getElementById('text').value.trim();
    const barcodeType = document.getElementById('barcodeType').value;
    const canvas = document.getElementById('barcodeCanvas');
    const resultDiv = document.getElementById('result');

    if (!text) {
        showError('Please enter text or click "Use Current URL"');
        return;
    }

    try {
        // Validate and format input based on barcode type
        const formattedText = validateAndFormatInput(text, barcodeType);
        
        // Get customization settings
        const settings = getBarcodeSettings();
        
        // Generate barcode with bwip-js
        // Prepare options based on barcode type
        const options = {
            bcid: barcodeType,
            text: formattedText,
            scale: settings.scale,
            includetext: settings.showText,
            height: 10, // Standard height
            backgroundcolor: settings.bgColor.replace('#', ''),
            barcolor: settings.fgColor.replace('#', ''),
        };
        
        // Add type-specific options
        if (barcodeType === 'code39') {
            // Code39 might need includecheck or includechecktext in some cases
            options.includecheck = false; // bwip-js handles this automatically
        } else if (barcodeType === 'interleaved2of5') {
            // ITF might need includecheck option
            options.includecheck = false;
        } else if (barcodeType === 'msi') {
            // MSI default checksum (Mod 10)
            // Some versions might need msi10, but msi should work
            // If "msi" doesn't work, try "msi10" as fallback
        }
        
        try {
            bwipjs.toCanvas(canvas, options);
        } catch (bwipError) {
            // Fallback for MSI if base identifier doesn't work
            if (barcodeType === 'msi' && bwipError.message.includes('Unknown')) {
                try {
                    options.bcid = 'msi10'; // Try MSI with Mod 10 checksum
                    bwipjs.toCanvas(canvas, options);
                } catch (fallbackError) {
                    throw bwipError; // Throw original error if fallback fails
                }
            } else {
                throw bwipError;
            }
        }

        resultDiv.style.display = 'block';
        document.getElementById('error').style.display = 'none';
        
        // Save to history
        saveToHistory(barcodeType, formattedText, canvas);
    } catch (error) {
        let errorMessage = 'Error generating barcode: ' + error.message;
        
        // Provide more helpful error messages
        if (error.message.includes('Invalid')) {
            errorMessage = 'Invalid barcode data. ' + error.message;
        } else if (error.message.includes('requires')) {
            errorMessage = error.message;
        }
        
        showError(errorMessage);
        resultDiv.style.display = 'none';
    }
}

// Download barcode
function downloadBarcode() {
    const canvas = document.getElementById('barcodeCanvas');
    const link = document.createElement('a');
    const barcodeType = document.getElementById('barcodeType').value;
    link.download = `barcode_${barcodeType}_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showSuccess('Barcode downloaded!');
}

// Download as SVG
function downloadSVG() {
    const canvas = document.getElementById('barcodeCanvas');
    const barcodeType = document.getElementById('barcodeType').value;
    const text = document.getElementById('text').value;
    
    // Convert canvas to SVG
    const img = canvas.toDataURL('image/png');
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${canvas.width}" height="${canvas.height}">
            <image x="0" y="0" width="${canvas.width}" height="${canvas.height}" xlink:href="${img}"/>
        </svg>
    `;
    
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `barcode_${barcodeType}_${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    showSuccess('Barcode downloaded as SVG!');
}

// Print barcode
function printBarcode() {
    const canvas = document.getElementById('barcodeCanvas');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Print Barcode</title>
                <style>
                    body {
                        margin: 0;
                        padding: 20px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        background: white;
                    }
                    img {
                        max-width: 100%;
                        height: auto;
                    }
                    @media print {
                        body {
                            padding: 0;
                        }
                    }
                </style>
            </head>
            <body>
                <img src="${canvas.toDataURL('image/png')}" alt="Barcode">
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
    }, 250);
    showSuccess('Print dialog opened!');
}

// Generate random sample
function generateRandomSample() {
    const barcodeType = document.getElementById('barcodeType').value;
    let sampleValue = '';
    
    switch (barcodeType) {
        case 'ean13':
            sampleValue = randomEAN13Number();
            break;
        case 'ean8':
            sampleValue = '1234567';
            break;
        case 'upca':
            sampleValue = '01234567890';
            break;
        case 'upce':
            sampleValue = '012345';
            break;
        case 'code39':
            sampleValue = randomCode39();
            break;
        case 'code93':
            sampleValue = 'CODE93-' + Math.random().toString(36).substring(2, 6);
            break;
        case 'code11':
            sampleValue = '12345';
            break;
        case 'interleaved2of5':
            sampleValue = randomITF();
            break;
        case 'msi':
            sampleValue = randomMSI();
            break;
        case 'pharmacode':
            sampleValue = randomPharmacodeNumber().toString();
            break;
        case 'rationalizedCodabar':
            sampleValue = randomCodabar();
            break;
        case 'qrcode':
        case 'datamatrix':
        case 'pdf417':
        case 'azteccode':
        case 'maxicode':
        case 'dotcode':
            sampleValue = 'Sample ' + Math.random().toString(36).substring(2, 9);
            break;
        case 'code128':
            sampleValue = 'SAMPLE' + Math.floor(Math.random() * 1000);
            break;
        default:
            sampleValue = '123456789012';
    }
    
    document.getElementById('text').value = sampleValue;
    generateBarcode();
}

// History functions
function saveToHistory(barcodeType, text, canvas) {
    try {
        let history = JSON.parse(localStorage.getItem('barcodeHistory') || '[]');
        
        // Create thumbnail
        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.width = 100;
        thumbCanvas.height = (canvas.height / canvas.width) * 100;
        const ctx = thumbCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
        
        const historyItem = {
            id: Date.now(),
            type: barcodeType,
            text: text,
            thumbnail: thumbCanvas.toDataURL('image/png'),
            timestamp: new Date().toISOString(),
            settings: getBarcodeSettings()
        };
        
        // Add to beginning and limit to 50 items
        history.unshift(historyItem);
        if (history.length > 50) {
            history = history.slice(0, 50);
        }
        
        localStorage.setItem('barcodeHistory', JSON.stringify(history));
        
        // Update history display if panel is visible
        if (document.getElementById('historyPanel').style.display !== 'none') {
            displayHistory();
        }
    } catch (e) {
        console.error('Failed to save history:', e);
    }
}

function loadHistory() {
    try {
        return JSON.parse(localStorage.getItem('barcodeHistory') || '[]');
    } catch (e) {
        return [];
    }
}

function displayHistory() {
    const history = loadHistory();
    const historyList = document.getElementById('historyList');
    
    if (history.length === 0) {
        historyList.innerHTML = '<div style="text-align: center; padding: 20px; color: #6c757d;">No history yet. Generate some barcodes!</div>';
        return;
    }
    
    historyList.innerHTML = history.map(item => {
        const date = new Date(item.timestamp);
        const timeStr = date.toLocaleString();
        const typeName = item.type.charAt(0).toUpperCase() + item.type.slice(1).replace(/([A-Z])/g, ' $1');
        
        return `
            <div class="history-item" data-id="${item.id}">
                <img src="${item.thumbnail}" alt="Barcode thumbnail" style="width: 100px; height: auto; border: 1px solid #ddd; border-radius: 4px; background: white;">
                <div class="history-item-info">
                    <div class="history-item-type">${typeName}</div>
                    <div class="history-item-text">${item.text.length > 30 ? item.text.substring(0, 30) + '...' : item.text}</div>
                    <div class="history-item-time">${timeStr}</div>
                </div>
                <div class="history-item-actions">
                    <button class="history-item-btn" onclick="regenerateFromHistory(${item.id})">Use</button>
                    <button class="history-item-btn delete" onclick="deleteFromHistory(${item.id})">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function regenerateFromHistory(id) {
    const history = loadHistory();
    const item = history.find(h => h.id === id);
    if (!item) return;
    
    document.getElementById('barcodeType').value = item.type;
    document.getElementById('text').value = item.text;
    
    // Restore settings if available
    if (item.settings) {
        document.getElementById('scale').value = item.settings.scale || 3;
        document.getElementById('scaleValue').textContent = item.settings.scale || 3;
        document.getElementById('showText').checked = item.settings.showText !== false;
        document.getElementById('fgColor').value = item.settings.fgColor || '#000000';
        document.getElementById('bgColor').value = item.settings.bgColor || '#FFFFFF';
    }
    
    updateInputPlaceholder(item.type);
    generateBarcode();
    showSuccess('Barcode regenerated from history!');
}

function deleteFromHistory(id) {
    let history = loadHistory();
    history = history.filter(h => h.id !== id);
    localStorage.setItem('barcodeHistory', JSON.stringify(history));
    displayHistory();
    showSuccess('Item deleted from history!');
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all history?')) {
        localStorage.removeItem('barcodeHistory');
        displayHistory();
        showSuccess('History cleared!');
    }
}

// Dark mode functions
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    
    const toggleBtn = document.getElementById('toggleTheme');
    toggleBtn.textContent = isDark ? '☀️' : '🌙';
}

function loadDarkMode() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
        document.getElementById('toggleTheme').textContent = '☀️';
    }
}

// Copy to clipboard
async function copyToClipboard() {
    try {
        const canvas = document.getElementById('barcodeCanvas');
        const blob = await new Promise(resolve => canvas.toBlob(resolve));
        await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
        ]);
        showSuccess('Barcode copied to clipboard!');
    } catch (error) {
        showError('Failed to copy to clipboard: ' + error.message);
    }
}

// Get current tab URL
async function getCurrentTabUrl() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return tab.url;
    } catch (error) {
        showError('Failed to get current URL: ' + error.message);
        return '';
    }
}

// Event listeners
document.getElementById('useUrl').addEventListener('click', async () => {
    const url = await getCurrentTabUrl();
    if (url) {
        document.getElementById('text').value = url;
        // Auto-select QR code for URLs as it's most suitable
        document.getElementById('barcodeType').value = 'qrcode';
    }
});

document.getElementById('useManual').addEventListener('click', () => {
    document.getElementById('text').value = '';
    document.getElementById('text').focus();
});

document.getElementById('generate').addEventListener('click', generateBarcode);

document.getElementById('download').addEventListener('click', downloadBarcode);

document.getElementById('downloadSVG').addEventListener('click', downloadSVG);

document.getElementById('copy').addEventListener('click', copyToClipboard);

document.getElementById('print').addEventListener('click', printBarcode);

document.getElementById('randomSample').addEventListener('click', generateRandomSample);

// Dark mode toggle
document.getElementById('toggleTheme').addEventListener('click', toggleDarkMode);

// History toggle
document.getElementById('toggleHistory').addEventListener('click', () => {
    const panel = document.getElementById('historyPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    if (panel.style.display === 'block') {
        displayHistory();
    }
});

document.getElementById('closeHistory').addEventListener('click', () => {
    document.getElementById('historyPanel').style.display = 'none';
});

document.getElementById('clearHistory').addEventListener('click', clearHistory);

// Options toggle
document.getElementById('toggleOptions').addEventListener('click', () => {
    const content = document.getElementById('optionsContent');
    const toggle = document.getElementById('toggleOptions');
    content.classList.toggle('collapsed');
    toggle.textContent = content.classList.contains('collapsed') ? '▼' : '▲';
});

// Scale slider update
document.getElementById('scale').addEventListener('input', (e) => {
    document.getElementById('scaleValue').textContent = e.target.value;
});

// Handle barcode type change
document.getElementById('barcodeType').addEventListener('change', async (e) => {
    const optionsSection = document.getElementById('optionsSection');
    optionsSection.style.display = 'block';
    
    const currentValue = document.getElementById('text').value;
    const defaultValue = await getDefaultValue(e.target.value);
    // Always update to default value when changing barcode type to show proper format
    document.getElementById('text').value = defaultValue;
    // Show placeholder/hint for the selected barcode type
    updateInputPlaceholder(e.target.value);
});

// Update input placeholder and hint based on barcode type
function updateInputPlaceholder(barcodeType) {
    const input = document.getElementById('text');
    const hintDiv = document.getElementById('barcodeHint');
    
    const placeholders = {
        'ean13': 'Enter 12-13 digits (e.g., 123456789012)',
        'ean8': 'Enter 7-8 digits (e.g., 1234567)',
        'upca': 'Enter 11-12 digits (e.g., 01234567890)',
        'upce': 'Enter 6-8 digits (e.g., 012345)',
        'code39': 'Enter text (A-Z, 0-9, - . $ / + % SPACE)',
        'code93': 'Enter text (ASCII characters)',
        'code11': 'Enter digits and dash (e.g., 12345)',
        'interleaved2of5': 'Enter even number of digits (e.g., 123456)',
        'msi': 'Enter numeric digits (e.g., 123456)',
        'pharmacode': 'Enter number between 3-131070 (e.g., 12345)',
        'rationalizedCodabar': 'Enter: StartChar(A-D) + Data + StopChar(A-D) (e.g., A1234B)',
        'qrcode': 'Enter text or click "Use Current URL"',
    };
    
    const hints = {
        'ean13': 'ℹ️ EAN13 requires exactly 12 or 13 numeric digits. Check digit is auto-calculated if 12 digits provided.',
        'ean8': 'ℹ️ EAN-8 requires exactly 7 or 8 numeric digits. Check digit is auto-calculated if 7 digits provided.',
        'upca': 'ℹ️ UPC-A requires exactly 11 or 12 numeric digits. Check digit is auto-calculated if 11 digits provided.',
        'upce': 'ℹ️ UPC-E requires 6, 7, or 8 numeric digits. Check digit is auto-calculated if 6 or 7 digits provided.',
        'code39': 'ℹ️ Code39 supports uppercase letters (A-Z), digits (0-9), and special characters: - . $ / + % SPACE',
        'code93': 'ℹ️ Code93 supports ASCII characters and provides higher density than Code39.',
        'code11': 'ℹ️ Code11 supports numeric digits (0-9) and dash (-) character only.',
        'interleaved2of5': 'ℹ️ ITF requires an even number of numeric digits. Data is encoded in pairs.',
        'msi': 'ℹ️ MSI supports numeric digits only (0-9).',
        'pharmacode': 'ℹ️ Pharmacode accepts numeric values between 3 and 131070.',
        'rationalizedCodabar': 'ℹ️ Codabar requires start/stop characters (A, B, C, or D) and data with characters: 0-9, -, $, :, /, ., +',
        'qrcode': 'ℹ️ QR Code can encode any text, URLs, or data.',
    };
    
    input.placeholder = placeholders[barcodeType] || 'Enter text or click "Use Current URL"';
    
    if (hints[barcodeType]) {
        hintDiv.textContent = hints[barcodeType];
        hintDiv.style.display = 'block';
    } else {
        hintDiv.style.display = 'none';
    }
}

// Allow Enter key to generate
document.getElementById('text').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        generateBarcode();
    }
});

// Initialize with default value
window.addEventListener('load', async () => {
    const barcodeType = document.getElementById('barcodeType').value;
    document.getElementById('text').value = await getDefaultValue(barcodeType);
    updateInputPlaceholder(barcodeType);
    
    // Show options section
    document.getElementById('optionsSection').style.display = 'block';
    
    // Load saved preferences
    loadPreferences();
    
    // Load dark mode
    loadDarkMode();
    
    // Make history functions global for onclick handlers
    window.regenerateFromHistory = regenerateFromHistory;
    window.deleteFromHistory = deleteFromHistory;
});

// Save preferences to localStorage
function savePreferences() {
    const settings = getBarcodeSettings();
    localStorage.setItem('barcodePreferences', JSON.stringify(settings));
}

// Load preferences from localStorage
function loadPreferences() {
    try {
        const saved = localStorage.getItem('barcodePreferences');
        if (saved) {
            const settings = JSON.parse(saved);
            document.getElementById('scale').value = settings.scale || 3;
            document.getElementById('scaleValue').textContent = settings.scale || 3;
            document.getElementById('showText').checked = settings.showText !== false;
            document.getElementById('fgColor').value = settings.fgColor || '#000000';
            document.getElementById('bgColor').value = settings.bgColor || '#FFFFFF';
        }
    } catch (e) {
        console.log('No saved preferences');
    }
}

// Save preferences when settings change
document.getElementById('scale').addEventListener('change', savePreferences);
document.getElementById('showText').addEventListener('change', savePreferences);
document.getElementById('fgColor').addEventListener('change', savePreferences);
document.getElementById('bgColor').addEventListener('change', savePreferences);
