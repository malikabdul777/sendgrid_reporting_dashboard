import { ATTACHMENT_TYPES } from "./constants";

import { htmlToText } from "html-to-text";

// Helper functions
export function generateRandomString(length) {
  // Use more diverse character set including special characters that can confuse parsers
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-=+.~!@#$%^&*()[]{}|\\:;\"'<>,?/";
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

export function encodeQuotedPrintable(text, useUnicodeObfuscation) {
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

export function encodeCustom(text) {
  return text
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0) ^ 0xff;
      return String.fromCharCode(code);
    })
    .join("");
}

export function generateRepetitiveBlock(size, usePolymorphic) {
  // Use more diverse character set to avoid pattern recognition
  const chars =
    "abcdefghijklmnopqrstuvwxyz0123456789_-=+.~!@#$%^&*()[]{}|\\:;\"'<>,?/";

  // Generate multiple different base strings to avoid repetition detection
  const baseStrings = [];
  for (let i = 0; i < 5; i++) {
    baseStrings.push(
      Array.from({ length: 64 }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join("")
    );
  }

  // Mix the base strings randomly
  const result = [];
  const iterations = Math.floor(size / 64) || 1000;

  for (let i = 0; i < iterations; i++) {
    const selectedBase =
      baseStrings[Math.floor(Math.random() * baseStrings.length)];
    const obfuscatedBase = generateObfuscatedContent(selectedBase, "low");
    result.push(obfuscatedBase);
  }

  return result.join(" ");
}

export function generateIcsContent() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const startDate = formatDate(tomorrow);
  const endDate = formatDate(new Date(tomorrow.getTime() + 3600000)); // 1 hour later

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//hacksw/handcal//NONSGML v1.0//EN
BEGIN:VEVENT
UID:${generateRandomString(20)}@example.com
DTSTAMP:${formatDate(now)}
ORGANIZER;CN=Organizer:mailto:organizer@example.com
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:Important Meeting
DESCRIPTION:This is a meeting invitation sent as part of an email.
LOCATION:Conference Room
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
END:VEVENT
END:VCALENDAR`;
}

export function generateVcfContent() {
  return `BEGIN:VCARD
VERSION:3.0
N:Doe;John;;;
FN:John Doe
ORG:Example Corp.
TITLE:Software Engineer
TEL;TYPE=WORK,VOICE:(555) 555-1234
TEL;TYPE=HOME,VOICE:(555) 555-5678
ADR;TYPE=WORK:;;123 Example St;City;State;12345;Country
EMAIL;TYPE=PREF,INTERNET:john.doe@example.com
URL:https://www.example.com/johndoe
REV:${new Date().toISOString()}
END:VCARD`;
}

export function calculateComplexityScore(formData, selectedAttachments) {
  let score = 0;

  // Only calculate score if there's actual HTML input
  if (formData.htmlInput && formData.htmlInput.trim().length > 0) {
    // Base complexity from HTML content
    score += 5;
    if (formData.htmlInput.length > 1000) score += 5;
    if (formData.htmlInput.includes("<script")) score += 10;

    // Tactics
    if (formData.useNestedBoundaries) score += 15;
    if (formData.useCustomEncoding) score += 20;
    if (formData.usePolymorphic) score += 15;
    if (formData.useUnicodeObfuscation) score += 25;
    if (formData.useFakeHeaders) score += 10;

    // Block size
    score += Math.min(20, Math.floor(formData.blockSize / 50000));

    // Attachments
    if (selectedAttachments.length > 0) {
      score += 5 * selectedAttachments.length;

      // Special attachment types
      if (selectedAttachments.includes("ics")) score += 10;
      if (selectedAttachments.includes("vcf")) score += 5;
      if (
        selectedAttachments.includes("zip") ||
        selectedAttachments.includes("rar")
      )
        score += 15;
    }

    // Character encoding
    if (formData.characterEncoding !== "UTF-8") score += 10;
  }

  // Cap at 100
  return Math.min(100, score);
}

// Fixed the issue with fake attachments getting stuck
export async function generateMimeStructure(
  formData,
  selectedAttachments,
  worker,
  progressCallback = () => {}
) {
  try {
    const {
      htmlInput,
      blockSize,
      useNestedBoundaries,
      useCustomEncoding,
      usePolymorphic,
      useUnicodeObfuscation,
      useFakeHeaders,
      characterEncoding,
      headerFields,
    } = formData;

    // Update progress to show initialization
    progressCallback("Initializing generation...");
    console.log("Starting MIME generation with options:", formData);

    // Generate obfuscated boundary strings that are harder for ESPs to parse
    const outerBoundary = `--${generateObfuscatedBoundary("_Outer_")}`;
    const innerBoundary = `--${generateObfuscatedBoundary("_Inner_")}`;
    const nestedBoundary = `--${generateObfuscatedBoundary("_Nested_")}`;
    const additionalBoundary = `--${generateObfuscatedBoundary("_Add_")}`;

    // Use Web Worker for heavy operations if available
    let repetitiveBlock, quotedPrintableBlock, customEncodedBlock;

    if (worker) {
      return new Promise((resolve, reject) => {
        let results = {};
        let pendingOperations = 0;
        let completedOperations = 0;
        let totalOperations = 0;

        // Only queue operations for selected tactics
        if (usePolymorphic) totalOperations++;
        if (useUnicodeObfuscation) totalOperations++;
        if (useCustomEncoding) totalOperations++;

        // If no tactics are selected, set at least one operation
        pendingOperations = totalOperations > 0 ? totalOperations : 1;

        // Add timeout to prevent hanging
        const workerTimeout = setTimeout(() => {
          console.log(
            "Worker operations timed out, falling back to synchronous processing"
          );
          // Fallback to synchronous processing
          progressCallback("Worker timed out, using fallback processing...");

          if (usePolymorphic) {
            repetitiveBlock = generateRepetitiveBlock(
              blockSize,
              usePolymorphic
            );
          } else {
            repetitiveBlock = "";
          }

          if (useUnicodeObfuscation) {
            quotedPrintableBlock = encodeQuotedPrintable(
              repetitiveBlock || generateRandomString(100),
              useUnicodeObfuscation
            );
          } else {
            quotedPrintableBlock = "";
          }

          if (useCustomEncoding) {
            customEncodedBlock = encodeCustom(
              repetitiveBlock || generateRandomString(100)
            );
          } else {
            customEncodedBlock = "";
          }

          const mimeStructure = buildMimeStructure();
          resolve(mimeStructure);
        }, 15000); // 15 second timeout

        worker.onmessage = function (e) {
          const { operation, result } = e.data;
          console.log(`Worker completed operation: ${operation}`);
          results[operation] = result;
          pendingOperations--;
          completedOperations++;

          // Update progress based on completed operations - ONLY for selected tactics
          if (operation === "generateRepetitiveBlock" && usePolymorphic) {
            progressCallback("Generating polymorphic content");
          } else if (
            operation === "encodeQuotedPrintable" &&
            useUnicodeObfuscation
          ) {
            progressCallback("Applying Unicode obfuscation");
          } else if (operation === "encodeCustom" && useCustomEncoding) {
            progressCallback("Applying custom encoding");
          }

          // Show progress percentage based on completed worker operations
          if (totalOperations > 0) {
            const progressPercent = Math.round(
              (completedOperations / totalOperations) * 100
            );
            console.log(`Worker progress: ${progressPercent}%`);
          }

          if (pendingOperations === 0) {
            clearTimeout(workerTimeout);
            console.log("All worker operations completed successfully");
            finalizeMimeStructure();
          }
        };

        // Add error handler
        worker.onerror = function (error) {
          console.error("Worker error:", error);
          clearTimeout(workerTimeout);
          progressCallback("Error in worker, using fallback processing...");
          // Fallback to synchronous processing
          if (usePolymorphic) {
            repetitiveBlock = generateRepetitiveBlock(
              blockSize,
              usePolymorphic
            );
          } else {
            repetitiveBlock = "";
          }

          if (useUnicodeObfuscation) {
            quotedPrintableBlock = encodeQuotedPrintable(
              repetitiveBlock || generateRandomString(100),
              useUnicodeObfuscation
            );
          } else {
            quotedPrintableBlock = "";
          }

          if (useCustomEncoding) {
            customEncodedBlock = encodeCustom(
              repetitiveBlock || generateRandomString(100)
            );
          } else {
            customEncodedBlock = "";
          }

          const mimeStructure = buildMimeStructure();
          resolve(mimeStructure);
        };

        // Request operations from worker only for selected tactics
        progressCallback("Starting worker operations...");

        if (usePolymorphic) {
          worker.postMessage({
            operation: "generateRepetitiveBlock",
            text: "",
            options: { size: blockSize, usePolymorphic },
          });
        }

        if (useUnicodeObfuscation) {
          worker.postMessage({
            operation: "encodeQuotedPrintable",
            text: generateRepetitiveBlock(blockSize, usePolymorphic),
            options: { useUnicodeObfuscation },
          });
        }

        if (useCustomEncoding) {
          worker.postMessage({
            operation: "encodeCustom",
            text: generateRepetitiveBlock(blockSize, usePolymorphic),
            options: {},
          });
        }

        // If no tactics are selected, proceed directly to finalization
        if (totalOperations === 0) {
          console.log(
            "No worker operations needed, proceeding to finalization"
          );
          repetitiveBlock = "";
          quotedPrintableBlock = "";
          customEncodedBlock = "";
          const mimeStructure = buildMimeStructure();
          resolve(mimeStructure);
        }

        function finalizeMimeStructure() {
          if (usePolymorphic) {
            repetitiveBlock =
              results.generateRepetitiveBlock ||
              generateRepetitiveBlock(blockSize, usePolymorphic);
          } else {
            repetitiveBlock = "";
          }

          if (useUnicodeObfuscation) {
            quotedPrintableBlock =
              results.encodeQuotedPrintable ||
              encodeQuotedPrintable(
                repetitiveBlock || generateRandomString(100),
                useUnicodeObfuscation
              );
          } else {
            quotedPrintableBlock = "";
          }

          if (useCustomEncoding) {
            customEncodedBlock =
              results.encodeCustom ||
              encodeCustom(repetitiveBlock || generateRandomString(100));
          } else {
            customEncodedBlock = "";
          }

          const mimeStructure = buildMimeStructure();
          resolve(mimeStructure);
        }
      });
    } else {
      // Fallback to synchronous processing
      progressCallback("Using synchronous processing...");
      await new Promise((resolve) => setTimeout(resolve, 250));

      if (usePolymorphic) {
        progressCallback("Generating polymorphic content");
        await new Promise((resolve) => setTimeout(resolve, 250));
        repetitiveBlock = generateRepetitiveBlock(blockSize, usePolymorphic);
      } else {
        repetitiveBlock = "";
      }

      if (useUnicodeObfuscation) {
        progressCallback("Applying Unicode obfuscation");
        await new Promise((resolve) => setTimeout(resolve, 250));
        quotedPrintableBlock = encodeQuotedPrintable(
          repetitiveBlock || generateRandomString(100),
          useUnicodeObfuscation
        );
      } else {
        quotedPrintableBlock = "";
      }

      if (useCustomEncoding) {
        progressCallback("Applying custom encoding");
        await new Promise((resolve) => setTimeout(resolve, 250));
        customEncodedBlock = encodeCustom(
          repetitiveBlock || generateRandomString(100)
        );
      } else {
        customEncodedBlock = "";
      }

      return await buildMimeStructure();
    }

    // Add this helper function at the top of the file after the existing helper functions
    function htmlToPlainText(html) {
      if (!html || typeof html !== "string") {
        return "Plain text version of the email content.";
      }

      // Create a temporary DOM element to parse HTML
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;

      // Remove script and style elements
      const scripts = tempDiv.querySelectorAll("script, style");
      scripts.forEach((el) => el.remove());

      // Get text content and clean it up
      let plainText = tempDiv.textContent || tempDiv.innerText || "";

      // Clean up whitespace and formatting
      plainText = plainText
        .replace(/\s+/g, " ") // Replace multiple whitespace with single space
        .replace(/\n\s*\n/g, "\n\n") // Preserve paragraph breaks
        .trim();

      // If the result is empty or too short, provide a fallback
      if (!plainText || plainText.length < 10) {
        return "Plain text version of the email content.";
      }

      return plainText;
    }

    async function buildMimeStructure() {
      let mimeStructure = `${outerBoundary}\n`;

      // Add custom headers ONLY if specified
      if (useFakeHeaders) {
        progressCallback("Adding fake headers");
        await new Promise((resolve) => setTimeout(resolve, 250));
        const randomHeaders = [
          `X-Fake-Header: ${generateRandomString(16)}`,
          `X-Custom-Route: ${generateRandomString(12)}`,
          `X-Tracking-ID: ${generateRandomString(24)}`,
        ];

        // Add any custom header fields
        if (headerFields && headerFields.length > 0) {
          headerFields.forEach((field) => {
            if (field.name && field.value) {
              randomHeaders.push(`${field.name}: ${field.value}`);
            }
          });
        }

        mimeStructure += randomHeaders.join("\n") + "\n";
      }

      mimeStructure += `Content-Type: ${
        useNestedBoundaries ? "multipart/related" : "multipart/mixed"
      }; boundary="${innerBoundary}"\n`;
      mimeStructure += `Content-Transfer-Encoding: 7bit\n`;
      mimeStructure += `MIME-Version: 1.0\n\n`;

      if (useNestedBoundaries) {
        progressCallback("Creating nested boundaries");
        await new Promise((resolve) => setTimeout(resolve, 250));
        mimeStructure += `${innerBoundary}\nContent-Type: multipart/alternative; boundary="${nestedBoundary}"\n`;
        if (useFakeHeaders) {
          mimeStructure += `Content-Type: text/html; charset=${characterEncoding}; fake-param=hidden\n`;
        }
        mimeStructure += `Content-Transfer-Encoding: 7bit\n\n`;

        mimeStructure += `${nestedBoundary}\nContent-Type: text/plain; charset=${characterEncoding}\nContent-Transfer-Encoding: 7bit\n\n`;
        // Convert HTML input to plain text instead of using hardcoded message
        const plainTextVersion = htmlToPlainText(htmlInput);
        mimeStructure += `${plainTextVersion}\n\n`;

        mimeStructure += `${nestedBoundary}\nContent-Type: text/html; charset=${characterEncoding}\nContent-Transfer-Encoding: 7bit\n\n${htmlInput}\n\n`;

        // ONLY add Unicode obfuscation if selected
        if (useUnicodeObfuscation && quotedPrintableBlock) {
          mimeStructure += `${nestedBoundary}\nContent-Type: text/html; charset=${characterEncoding}\nContent-Transfer-Encoding: quoted-printable\n\n${quotedPrintableBlock}\n\n`;
        }

        // ONLY add custom encoding if selected
        if (useCustomEncoding && customEncodedBlock) {
          mimeStructure += `${nestedBoundary}\nContent-Type: text/plain; charset=${characterEncoding}\nContent-Transfer-Encoding: x-customEncoding\n\n${customEncodedBlock}\n\n`;
        }

        mimeStructure += `${nestedBoundary}--\n\n`;
      } else {
        mimeStructure += `${innerBoundary}\nContent-Type: text/html; charset=${characterEncoding}\nContent-Transfer-Encoding: 7bit\n\n${htmlInput}\n\n`;

        // ONLY add Unicode obfuscation if selected
        if (useUnicodeObfuscation && quotedPrintableBlock) {
          mimeStructure += `${innerBoundary}\nContent-Type: text/html; charset=${characterEncoding}\nContent-Transfer-Encoding: quoted-printable\n\n${quotedPrintableBlock}\n\n`;
        }
      }

      // ONLY add polymorphic content if selected
      if (usePolymorphic && repetitiveBlock) {
        mimeStructure += `${innerBoundary}\nContent-Type: text/plain; charset="${characterEncoding}"\nContent-Transfer-Encoding: 8bit\n\n`;
        // Use HTML-to-text conversion with randomized identifier
        const plainTextVersion = htmlToPlainText(htmlInput);
        const randomId = Math.random().toString(36).substring(2);
        mimeStructure += `${plainTextVersion}\n\nRandomized content ID: ${randomId}\n\n`;
      }

      // Add selected fake attachments ONLY if any are selected
      if (selectedAttachments && selectedAttachments.length > 0) {
        progressCallback("Creating fake attachments");
        await new Promise((resolve) => setTimeout(resolve, 250));
        for (const attachment of selectedAttachments) {
          const { mimeType, extension, filename } =
            ATTACHMENT_TYPES[attachment];
          let attachmentContent = "";

          // Generate specific content for special attachment types
          if (attachment === "ics") {
            attachmentContent = btoa(generateIcsContent());
          } else if (attachment === "vcf") {
            attachmentContent = btoa(generateVcfContent());
          } else {
            // Generate smaller random content for other attachment types to prevent hanging
            attachmentContent = btoa(generateRandomString(512));
          }

          mimeStructure += `\n${innerBoundary}\nContent-Type: ${mimeType}\nContent-Transfer-Encoding: base64\nContent-Disposition: attachment; filename="${filename}.${extension}"\n\n${attachmentContent}\n`;
        }
      }

      progressCallback("Finalizing MIME structure");
      await new Promise((resolve) => setTimeout(resolve, 250));
      mimeStructure += `${innerBoundary}--\n\n${outerBoundary}--`;
      return mimeStructure;
    }
  } catch (error) {
    console.error("Error in generateMimeStructure:", error);
    throw new Error(`Error generating MIME structure: ${error.message}`);
  }
}

// Add new function for generating obfuscated boundaries
function generateObfuscatedBoundary(prefix = "") {
  const timestamp = Date.now().toString(36); // Base36 encoding
  const randomPart1 = generateRandomString(12);
  const randomPart2 = generateRandomString(8);
  const randomPart3 = generateRandomString(6);

  // Mix different encoding techniques to confuse parsers
  const encodedPart = btoa(randomPart2).replace(/[=+/]/g, (match) => {
    switch (match) {
      case "=":
        return "_";
      case "+":
        return "-";
      case "/":
        return ".";
      default:
        return match;
    }
  });

  // Create boundary with mixed separators and encoded sections
  return `${prefix}${randomPart1}_${timestamp}.${encodedPart}-${randomPart3}`;
}

// Add function for generating non-standard content
function generateObfuscatedContent(baseContent, obfuscationLevel = "medium") {
  let content = baseContent;

  switch (obfuscationLevel) {
    case "high":
      // Add invisible Unicode characters
      content = content
        .split("")
        .map((char) => {
          if (Math.random() < 0.15) {
            const invisibleChars = [
              "\u200B",
              "\u200C",
              "\u200D",
              "\u2060",
              "\uFEFF",
            ];
            return (
              char +
              invisibleChars[Math.floor(Math.random() * invisibleChars.length)]
            );
          }
          return char;
        })
        .join("");

      // Add random whitespace variations
      content = content.replace(/ /g, () => {
        const spaces = [" ", "\u00A0", "\u2000", "\u2001", "\u2002", "\u2003"];
        return spaces[Math.floor(Math.random() * spaces.length)];
      });
      break;

    case "medium":
      // Add zero-width characters occasionally
      content = content
        .split("")
        .map((char) => {
          return Math.random() < 0.08 ? char + "\u200B" : char;
        })
        .join("");
      break;

    case "low":
    default:
      // Minimal obfuscation - just add occasional zero-width spaces
      content = content
        .split("")
        .map((char) => {
          return Math.random() < 0.03 ? char + "\u200B" : char;
        })
        .join("");
      break;
  }

  return content;
}
