/**
 * Utility functions for safe base64 encoding and decoding
 * These functions properly handle Unicode characters that standard btoa/atob can't handle
 */

/**
 * UTF-8 safe version of btoa that works with any Unicode string
 */
export function utf8ToBase64(str: string): string {
  try {
    // First convert the string to UTF-8 bytes
    const bytes = new TextEncoder().encode(str);
    
    // Convert bytes to binary string
    let binaryStr = '';
    bytes.forEach(byte => {
      binaryStr += String.fromCharCode(byte);
    });
    
    // Use btoa on the binary string
    return btoa(binaryStr);
  } catch (error) {
    console.error('Error in utf8ToBase64:', error);
    
    // Fallback method if the above fails
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));
  }
}

/**
 * UTF-8 safe version of atob that works with any Unicode string
 */
export function base64ToUtf8(str: string): string {
  try {
    // First decode base64 to binary string
    const binaryStr = atob(str);
    
    // Create a Uint8Array from the binary string
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    
    // Decode the UTF-8 bytes to string
    return new TextDecoder().decode(bytes);
  } catch (error) {
    console.error('Error in base64ToUtf8:', error);
    
    // Fallback method if the above fails
    return decodeURIComponent(
      Array.prototype.map
        .call(atob(str), (c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
  }
}

/**
 * Safely parse a base64 encoded JSON metadata string
 */
export function parseBase64Metadata(base64DataUri: string): any {
  try {
    if (base64DataUri.startsWith('data:application/json;base64,')) {
      const base64Data = base64DataUri.replace('data:application/json;base64,', '');
      const jsonData = base64ToUtf8(base64Data);
      return JSON.parse(jsonData);
    }
    return null;
  } catch (error) {
    console.error('Error parsing base64 metadata:', error);
    return null;
  }
}
