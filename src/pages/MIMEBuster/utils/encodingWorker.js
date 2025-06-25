// Web Worker for encoding operations
export function initializeWorker() {
  if (typeof Worker !== "undefined") {
    const workerCode = `
      self.onmessage = function(e) {
        const { operation, text, options } = e.data;
        
        if (operation === 'encodeQuotedPrintable') {
          const result = encodeQuotedPrintable(text, options.useUnicodeObfuscation);
          self.postMessage({ operation, result });
        } else if (operation === 'encodeCustom') {
          const result = encodeCustom(text);
          self.postMessage({ operation, result });
        } else if (operation === 'generateRepetitiveBlock') {
          const result = generateRepetitiveBlock(options.size, options.usePolymorphic);
          self.postMessage({ operation, result });
        }
      };
      
      function encodeQuotedPrintable(text, useUnicodeObfuscation) {
        return text
          .split("")
          .map((char) => {
            const code = char.charCodeAt(0);
            if (code > 127 || char === "=" || char === "\n" || char === "\r") {
              return "=" + code.toString(16).toUpperCase().padStart(2, "0");
            }
            return useUnicodeObfuscation && Math.random() < 0.1
              ? char + "\u200B"
              : char;
          })
          .join("");
      }
      
      function encodeCustom(text) {
        return text
          .split("")
          .map((char) => {
            const code = char.charCodeAt(0) ^ 0xff;
            return String.fromCharCode(code);
          })
          .join("");
      }
      
      function generateRandomString(length) {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        return Array.from({ length }, () => 
          chars.charAt(Math.floor(Math.random() * chars.length))
        ).join("");
      }
      
      function generateRepetitiveBlock(size, usePolymorphic) {
        const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        // Always generate random baseString
        const baseString = Array.from({ length: 64 }, () =>
          chars.charAt(Math.floor(Math.random() * chars.length))
        ).join("");
        
        return Array(Math.floor(size / 64) || 1000)
          .fill(baseString)
          .join(" ");
      }
    `;

    const blob = new Blob([workerCode], { type: "application/javascript" });
    return new Worker(URL.createObjectURL(blob));
  }
  return null;
}
