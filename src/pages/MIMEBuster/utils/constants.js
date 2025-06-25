// Define attachment types with their MIME types and extensions
export const ATTACHMENT_TYPES = {
  pdf: { mimeType: "application/pdf", extension: "pdf", filename: "document" },
  doc: {
    mimeType: "application/msword",
    extension: "doc",
    filename: "document",
  },
  docx: {
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    extension: "docx",
    filename: "document",
  },
  xls: {
    mimeType: "application/vnd.ms-excel",
    extension: "xls",
    filename: "spreadsheet",
  },
  xlsx: {
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    extension: "xlsx",
    filename: "spreadsheet",
  },
  ppt: {
    mimeType: "application/vnd.ms-powerpoint",
    extension: "ppt",
    filename: "presentation",
  },
  pptx: {
    mimeType:
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    extension: "pptx",
    filename: "presentation",
  },
  zip: { mimeType: "application/zip", extension: "zip", filename: "archive" },
  rar: {
    mimeType: "application/x-rar-compressed",
    extension: "rar",
    filename: "archive",
  },
  txt: { mimeType: "text/plain", extension: "txt", filename: "notes" },
  csv: { mimeType: "text/csv", extension: "csv", filename: "data" },
  json: { mimeType: "application/json", extension: "json", filename: "data" },
  xml: { mimeType: "application/xml", extension: "xml", filename: "data" },
  html: { mimeType: "text/html", extension: "html", filename: "webpage" },
  mp3: { mimeType: "audio/mpeg", extension: "mp3", filename: "audio" },
  mp4: { mimeType: "video/mp4", extension: "mp4", filename: "video" },
  ics: { mimeType: "text/calendar", extension: "ics", filename: "calendar" },
  vcf: { mimeType: "text/vcard", extension: "vcf", filename: "contact" },
  png: { mimeType: "image/png", extension: "png", filename: "image" },
  jpg: { mimeType: "image/jpeg", extension: "jpg", filename: "image" },
};

// Tooltip descriptions for MIME-busting tactics
export const TACTIC_DESCRIPTIONS = {
  useNestedBoundaries:
    "Creates multiple nested MIME boundaries that can confuse email scanners",
  useCustomEncoding:
    "Uses non-standard encoding methods that may bypass content filters",
  usePolymorphic:
    "Generates different content each time to avoid signature-based detection",
  useUnicodeObfuscation:
    "Inserts zero-width characters and direction overrides to obfuscate text",
  useFakeHeaders:
    "Adds misleading email headers that can confuse analysis tools",
};

// Character encoding options
export const CHARACTER_ENCODINGS = [
  { value: "UTF-8", label: "UTF-8 (Unicode)" },
  { value: "ISO-8859-1", label: "ISO-8859-1 (Latin-1)" },
  { value: "ISO-8859-15", label: "ISO-8859-15 (Latin-9)" },
  { value: "Windows-1252", label: "Windows-1252 (CP1252)" },
  { value: "Shift_JIS", label: "Shift_JIS (Japanese)" },
  { value: "EUC-KR", label: "EUC-KR (Korean)" },
  { value: "GB2312", label: "GB2312 (Simplified Chinese)" },
  { value: "KOI8-R", label: "KOI8-R (Russian)" },
];
