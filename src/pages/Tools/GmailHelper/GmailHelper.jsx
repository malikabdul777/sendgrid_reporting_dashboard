import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import styles from "./GmailHelper.module.css";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const GmailHelper = () => {
  // File upload states
  const [csvFile, setCsvFile] = useState(null);
  const [jsonFiles, setJsonFiles] = useState([]);
  const [htmlFiles, setHtmlFiles] = useState([]);

  // Processing configuration states
  const [rowsToProcess, setRowsToProcess] = useState(1000);
  const [rowsPerFile, setRowsPerFile] = useState(250);

  // Data states
  const [csvData, setCsvData] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [columnMapping, setColumnMapping] = useState({
    email: "",
    customerName: "",
    customerAddress: "",
    senderName: "",
    companyName: "",
    helpLineNumber: "",
  });

  // Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedRows, setProcessedRows] = useState([]);
  const [usedRows, setUsedRows] = useState([]);
  const [startRowIndex, setStartRowIndex] = useState(0);

  // File input refs
  const csvInputRef = useRef(null);
  const jsonInputRef = useRef(null);
  const htmlInputRef = useRef(null);

  // Required columns for mapping
  const requiredColumns = [
    { key: "email", label: "Email (Required)" },
    { key: "customerName", label: "Customer Name (Optional)" },
    { key: "customerAddress", label: "Customer Address (Optional)" },
    { key: "senderName", label: "Sender Name (Optional)" },
    { key: "companyName", label: "Company Name (Optional)" },
    { key: "helpLineNumber", label: "Help Line Number (Optional)" },
  ];

  // Handle CSV/Excel file upload
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split(".").pop().toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(fileExtension)) {
      toast.error("Please upload a CSV or Excel file");
      return;
    }

    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        let workbook;
        if (fileExtension === "csv") {
          const csvText = event.target.result;
          workbook = XLSX.read(csvText, { type: "string" });
        } else {
          workbook = XLSX.read(event.target.result, { type: "array" });
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length > 0) {
          const headers = jsonData[0];
          const dataRows = jsonData.slice(1);

          // Check for rows with 'Used' value
          const usedRowIndices = [];
          let firstUnusedRowIndex = 0;

          // Find the 'Used' column index if it exists
          // Check all columns for 'Used' values instead of just specific columns
          // Identify rows with 'Used' value in any column
          dataRows.forEach((row, index) => {
            const hasUsedValue = row.some((cell) => cell === "Used");
            if (hasUsedValue) {
              usedRowIndices.push(index);
            }
          });

          // Find the first row without 'Used' value in any column
          firstUnusedRowIndex = dataRows.length; // Default to end if all are used
          for (let i = 0; i < dataRows.length; i++) {
            const hasUsedValue = dataRows[i].some((cell) => cell === "Used");
            if (!hasUsedValue) {
              firstUnusedRowIndex = i;
              break;
            }
          }

          setCsvHeaders(headers);
          setCsvData(dataRows);
          setUsedRows(usedRowIndices);
          setStartRowIndex(firstUnusedRowIndex);

          // Reset column mapping when new file is uploaded
          setColumnMapping({
            email: "",
            customerName: "",
            customerAddress: "",
            senderName: "",
            companyName: "",
            helpLineNumber: "",
          });

          const usedRowsCount = usedRowIndices.length;
          toast.success(
            `CSV file loaded successfully. ${dataRows.length} rows found, ${usedRowsCount} rows already marked as used.`
          );
        }
      } catch (error) {
        console.error("Error reading file:", error);
        toast.error("Error reading file. Please check the file format.");
      }
    };

    if (fileExtension === "csv") {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  // Handle JSON files upload
  const handleJsonUpload = (e) => {
    const files = Array.from(e.target.files);
    const validJsonFiles = files.filter((file) =>
      file.name.toLowerCase().endsWith(".json")
    );

    if (validJsonFiles.length !== files.length) {
      toast.error("Please upload only JSON files");
      return;
    }

    setJsonFiles(validJsonFiles);
    toast.success(
      `${validJsonFiles.length} JSON file(s) uploaded successfully`
    );
  };

  // Handle HTML files upload
  const handleHtmlUpload = (e) => {
    const files = Array.from(e.target.files);
    const validHtmlFiles = files.filter((file) => {
      const extension = file.name.toLowerCase().split(".").pop();
      return ["html", "htm"].includes(extension);
    });

    if (validHtmlFiles.length !== files.length) {
      toast.error("Please upload only HTML files");
      return;
    }

    setHtmlFiles(validHtmlFiles);
    toast.success(
      `${validHtmlFiles.length} HTML file(s) uploaded successfully`
    );
  };

  // Handle column mapping change
  const handleColumnMappingChange = (requiredColumn, selectedHeader) => {
    setColumnMapping((prev) => ({
      ...prev,
      [requiredColumn]: selectedHeader,
    }));
  };

  // Validate inputs before processing
  const validateInputs = () => {
    if (!csvFile) {
      toast.error("Please upload a CSV/Excel file");
      return false;
    }

    if (jsonFiles.length === 0) {
      toast.error("Please upload at least one JSON file");
      return false;
    }

    if (htmlFiles.length === 0) {
      toast.error("Please upload at least one HTML file");
      return false;
    }

    if (rowsToProcess <= 0) {
      toast.error("Rows to process must be greater than 0");
      return false;
    }

    if (rowsPerFile <= 0) {
      toast.error("Rows per file must be greater than 0");
      return false;
    }

    // Check if email column is mapped (only required column)
    if (!columnMapping.email) {
      toast.error("Please map the Email column (required)");
      return false;
    }

    return true;
  };

  // Create Excel file with 'Is used' column for processed rows
  const createExcelWithUsedColumn = (originalData, processedRowIndices) => {
    const workbook = XLSX.utils.book_new();

    // Check if first row contains email addresses (no proper headers)
    const firstRowHasEmail =
      originalData.length > 0 &&
      originalData[0].some(
        (cell) =>
          typeof cell === "string" && cell.includes("@") && cell.includes(".")
      );

    // Find if 'Is used' or 'Used' column already exists in the original data
    const usedColumnIndex = csvHeaders.findIndex(
      (header) => header === "Used" || header === "Is used"
    );

    let finalHeaders, finalData;

    if (firstRowHasEmail) {
      // First row contains data, so insert a header row
      finalHeaders = [...csvHeaders, "Is used"];
      // Process the data rows and add 'Is used' column
      finalData = originalData.map((row, index) => {
        // Mark as 'Used' if processed, else blank
        const isBeingProcessed = processedRowIndices.includes(index);
        return [...row, isBeingProcessed ? "Used" : ""];
      });
    } else {
      // First row is headers, update them if needed
      finalHeaders =
        usedColumnIndex !== -1 ? [...csvHeaders] : [...csvHeaders, "Is used"];

      // Process the data rows
      finalData = originalData.map((row, index) => {
        // Check if this row is being processed now or was previously marked as used
        const isBeingProcessed = processedRowIndices.includes(index);
        const wasAlreadyUsed = usedRows.includes(index);

        // If the row is being processed now or was already used, mark it as 'Used'
        if (isBeingProcessed || wasAlreadyUsed) {
          // If 'Is used' column already exists, update it
          if (usedColumnIndex !== -1) {
            const newRow = [...row];
            newRow[usedColumnIndex] = "Used";
            return newRow;
          } else {
            // Add new 'Is used' column
            return [...row, "Used"];
          }
        } else {
          // Keep existing values
          return usedColumnIndex !== -1 ? [...row] : [...row, ""];
        }
      });
    }

    const worksheet = XLSX.utils.aoa_to_sheet([finalHeaders, ...finalData]);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    return XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  };

  // Process and export data
  const handleExport = async () => {
    if (!validateInputs()) return;

    setIsProcessing(true);

    try {
      // Get the rows to process, starting from the first unused row
      const availableRows = csvData.slice(startRowIndex);
      const rowsToActuallyProcess = Math.min(
        rowsToProcess,
        availableRows.length
      );
      const dataToProcess = availableRows.slice(0, rowsToActuallyProcess);

      // Map the indices back to the original data array
      const processedIndices = dataToProcess.map(
        (_, index) => index + startRowIndex
      );
      setProcessedRows(processedIndices);

      // Split data into chunks based on rowsPerFile
      const chunks = [];
      for (let i = 0; i < dataToProcess.length; i += rowsPerFile) {
        chunks.push(dataToProcess.slice(i, i + rowsPerFile));
      }

      // Create zip file
      const zip = new JSZip();

      // Process each chunk
      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        const chunk = chunks[chunkIndex];
        const folderName = (chunkIndex + 1).toString();
        const folder = zip.folder(folderName);

        // Create Excel file for this chunk
        const mappedData = chunk.map((row) => {
          const mappedRow = {};
          requiredColumns.forEach((col) => {
            const headerIndex = columnMapping[col.key]
              ? csvHeaders.indexOf(columnMapping[col.key])
              : -1;
            // Use clean column name without (Required)/(Optional) labels
            const cleanLabel = col.label.replace(
              / \((Required|Optional)\)$/,
              ""
            );
            mappedRow[cleanLabel] =
              headerIndex !== -1 ? row[headerIndex] || "" : "";
          });
          return mappedRow;
        });

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(mappedData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
        const excelBuffer = XLSX.write(workbook, {
          type: "array",
          bookType: "xlsx",
        });

        folder.file(`data${chunkIndex + 1}.xlsx`, excelBuffer);

        // Add HTML file (cycle through available HTML files)
        const htmlFile = htmlFiles[chunkIndex % htmlFiles.length];
        const htmlContent = await htmlFile.text();
        folder.file(`email${chunkIndex + 1}.html`, htmlContent);

        // Add JSON file (cycle through available JSON files)
        const jsonFile = jsonFiles[chunkIndex % jsonFiles.length];
        const jsonContent = await jsonFile.text();
        folder.file(jsonFile.name, jsonContent);
      }

      // Create original file with 'Used' column
      const originalWithUsed = createExcelWithUsedColumn(
        csvData,
        processedIndices
      );
      const originalFileName = csvFile.name.replace(/\.[^/.]+$/, "") + ".xlsx";
      zip.file(originalFileName, originalWithUsed);

      // Create unused files folder if there are unused files
      const totalFilesNeeded = Math.ceil(rowsToProcess / rowsPerFile);
      const unusedJsonFiles = jsonFiles.slice(totalFilesNeeded);
      const unusedHtmlFiles = htmlFiles.slice(totalFilesNeeded);

      if (unusedJsonFiles.length > 0 || unusedHtmlFiles.length > 0) {
        const unusedFolder = zip.folder("unused_files");

        // Add unused JSON files
        for (const jsonFile of unusedJsonFiles) {
          const jsonContent = await jsonFile.text();
          unusedFolder.file(jsonFile.name, jsonContent);
        }

        // Add unused HTML files
        for (const htmlFile of unusedHtmlFiles) {
          const htmlContent = await htmlFile.text();
          unusedFolder.file(htmlFile.name, htmlContent);
        }
      }

      // Generate zip file with timestamp (local time)
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const timestamp = `${year}-${month}-${day}_${hours}-${minutes}`;
      const zipFilename = `Export_${timestamp}.zip`;

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, zipFilename);

      toast.success(
        `Export completed! ${chunks.length} folders created and downloaded as ${zipFilename}`
      );
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Error during export. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Clear all uploads
  const clearAllUploads = () => {
    setCsvFile(null);
    setJsonFiles([]);
    setHtmlFiles([]);
    setCsvData([]);
    setCsvHeaders([]);
    setColumnMapping({
      email: "",
      customerName: "",
      customerAddress: "",
      senderName: "",
      companyName: "",
      helpLineNumber: "",
    });
    setProcessedRows([]);

    // Reset file inputs
    if (csvInputRef.current) csvInputRef.current.value = "";
    if (jsonInputRef.current) jsonInputRef.current.value = "";
    if (htmlInputRef.current) htmlInputRef.current.value = "";

    toast.success("All uploads cleared");
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Gmail Helper - File Processor</h1>

      {/* File Upload Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>File Uploads</h2>

        {/* CSV/Excel Upload */}
        <div className={styles.uploadContainer}>
          <Label htmlFor="csv-upload">CSV/Excel File (Required)</Label>
          <Input
            id="csv-upload"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleCsvUpload}
            ref={csvInputRef}
          />
          {csvFile && (
            <div className={styles.fileInfo}>
              ✓ {csvFile.name} ({csvData.length} rows)
            </div>
          )}
        </div>

        {/* JSON Files Upload */}
        <div className={styles.uploadContainer}>
          <Label htmlFor="json-upload">JSON Files (Required - Multiple)</Label>
          <Input
            id="json-upload"
            type="file"
            accept=".json"
            multiple
            onChange={handleJsonUpload}
            ref={jsonInputRef}
          />
          {jsonFiles.length > 0 && (
            <div className={styles.fileInfo}>
              ✓ {jsonFiles.length} JSON file(s) uploaded
            </div>
          )}
        </div>

        {/* HTML Files Upload */}
        <div className={styles.uploadContainer}>
          <Label htmlFor="html-upload">HTML Files (Required - Multiple)</Label>
          <Input
            id="html-upload"
            type="file"
            accept=".html,.htm"
            multiple
            onChange={handleHtmlUpload}
            ref={htmlInputRef}
          />
          {htmlFiles.length > 0 && (
            <div className={styles.fileInfo}>
              ✓ {htmlFiles.length} HTML file(s) uploaded
            </div>
          )}
        </div>

        <div className={styles.buttonGroup}>
          <Button
            onClick={clearAllUploads}
            variant="outline"
            style={{
              marginLeft: "auto",
              backgroundColor: "tomato",
              borderColor: "tomato",
              color: "white",
            }}
          >
            Clear All Uploads
          </Button>
        </div>
      </div>

      {/* Processing Configuration */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Processing Configuration</h2>

        <div className={styles.configGrid}>
          <div className={styles.configItem}>
            <Label htmlFor="rows-to-process">Rows to Process from Top</Label>
            <Input
              id="rows-to-process"
              type="number"
              min="1"
              value={rowsToProcess}
              onChange={(e) => setRowsToProcess(parseInt(e.target.value) || 0)}
            />
            {csvFile && rowsToProcess > csvData.length - startRowIndex && (
              <div className={styles.warningMessage}>
                ⚠️ Cannot process more than {csvData.length - startRowIndex}{" "}
                unused rows.
              </div>
            )}
          </div>

          <div className={styles.configItem}>
            <Label htmlFor="rows-per-file">Rows per Output File</Label>
            <Input
              id="rows-per-file"
              type="number"
              min="1"
              value={rowsPerFile}
              onChange={(e) => setRowsPerFile(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* File Usage Preview */}
        {rowsToProcess > 0 &&
          rowsPerFile > 0 &&
          (jsonFiles.length > 0 || htmlFiles.length > 0) && (
            <div className={styles.fileUsagePreview}>
              <h3 className={styles.previewTitle}>File Usage Preview</h3>
              <div className={styles.usageStats}>
                <div className={styles.usageStat}>
                  <span className={styles.statLabel}>Total files needed:</span>
                  <span className={styles.statValue}>
                    {Math.ceil(rowsToProcess / rowsPerFile)}
                  </span>
                </div>

                {/* Row processing information */}
                {usedRows.length > 0 && (
                  <div className={styles.usageStat}>
                    <span className={styles.statLabel}>Already used rows:</span>
                    <span className={styles.statValue}>
                      {usedRows.length === 1
                        ? `${usedRows[0] + 1}`
                        : `${Math.min(...usedRows) + 1}-${
                            Math.max(...usedRows) + 1
                          }`}{" "}
                      ({usedRows.length} rows)
                    </span>
                  </div>
                )}

                <div className={styles.usageStat}>
                  <span className={styles.statLabel}>Processing rows:</span>
                  <span className={styles.statValue}>
                    {startRowIndex + 1}-
                    {Math.min(startRowIndex + rowsToProcess, csvData.length)}
                    {" ("}
                    {Math.min(startRowIndex + rowsToProcess, csvData.length) -
                      startRowIndex}
                    {" rows)"}
                  </span>
                </div>

                {startRowIndex + rowsToProcess < csvData.length && (
                  <div className={styles.usageStat}>
                    <span className={styles.statLabel}>Remaining rows:</span>
                    <span className={styles.statValue}>
                      {startRowIndex + rowsToProcess + 1}-{csvData.length}
                      {" ("}
                      {csvData.length - (startRowIndex + rowsToProcess)}
                      {" rows)"}
                    </span>
                  </div>
                )}

                {jsonFiles.length > 0 && (
                  <div className={styles.usageStat}>
                    <span className={styles.statLabel}>
                      JSON files to be used:
                    </span>
                    <span className={styles.statValue}>
                      {Math.min(
                        jsonFiles.length,
                        Math.ceil(rowsToProcess / rowsPerFile)
                      )}
                      {Math.ceil(rowsToProcess / rowsPerFile) >
                        jsonFiles.length && (
                        <span className={styles.warningText}>
                          ⚠️ Need{" "}
                          {Math.ceil(rowsToProcess / rowsPerFile) -
                            jsonFiles.length}{" "}
                          more files
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {htmlFiles.length > 0 && (
                  <div className={styles.usageStat}>
                    <span className={styles.statLabel}>
                      HTML files to be used:
                    </span>
                    <span className={styles.statValue}>
                      {Math.min(
                        htmlFiles.length,
                        Math.ceil(rowsToProcess / rowsPerFile)
                      )}
                      {Math.ceil(rowsToProcess / rowsPerFile) >
                        htmlFiles.length && (
                        <span className={styles.warningText}>
                          ⚠️ Need{" "}
                          {Math.ceil(rowsToProcess / rowsPerFile) -
                            htmlFiles.length}{" "}
                          more files
                        </span>
                      )}
                    </span>
                  </div>
                )}

                {jsonFiles.length > Math.ceil(rowsToProcess / rowsPerFile) && (
                  <div className={styles.unusedFiles}>
                    <span className={styles.unusedLabel}>
                      Unused JSON files:
                    </span>
                    <div className={styles.unusedList}>
                      {jsonFiles
                        .slice(Math.ceil(rowsToProcess / rowsPerFile))
                        .map((file, index) => (
                          <span key={index} className={styles.unusedFile}>
                            {file.name}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {htmlFiles.length > Math.ceil(rowsToProcess / rowsPerFile) && (
                  <div className={styles.unusedFiles}>
                    <span className={styles.unusedLabel}>
                      Unused HTML files:
                    </span>
                    <div className={styles.unusedList}>
                      {htmlFiles
                        .slice(Math.ceil(rowsToProcess / rowsPerFile))
                        .map((file, index) => (
                          <span key={index} className={styles.unusedFile}>
                            {file.name}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
      </div>

      {/* Column Mapping Section */}
      {csvHeaders.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Column Mapping</h2>
          <p className={styles.mappingDescription}>
            Map your CSV columns to the output columns. Only Email is required,
            all other columns are optional:
          </p>

          <div className={styles.mappingGrid}>
            {requiredColumns.map((column) => (
              <div key={column.key} className={styles.mappingItem}>
                <Label htmlFor={`mapping-${column.key}`}>{column.label}</Label>
                <select
                  id={`mapping-${column.key}`}
                  className={styles.mappingSelect}
                  value={columnMapping[column.key]}
                  onChange={(e) =>
                    handleColumnMappingChange(column.key, e.target.value)
                  }
                >
                  <option value="">Select column...</option>
                  {csvHeaders.map((header, index) => (
                    <option key={index} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Export</h2>

        {csvData.length > 0 && (
          <div className={styles.exportInfo}>
            <p>
              Ready to process {Math.min(rowsToProcess, csvData.length)} rows
            </p>
            <p>
              Will create{" "}
              {Math.ceil(Math.min(rowsToProcess, csvData.length) / rowsPerFile)}{" "}
              output folders
            </p>
          </div>
        )}

        <div className={styles.exportButtonGroup}>
          <Button
            onClick={handleExport}
            disabled={
              isProcessing ||
              !csvFile ||
              jsonFiles.length === 0 ||
              htmlFiles.length === 0 ||
              rowsToProcess > csvData.length - startRowIndex ||
              Math.ceil(rowsToProcess / rowsPerFile) > jsonFiles.length ||
              Math.ceil(rowsToProcess / rowsPerFile) > htmlFiles.length
            }
            className={styles.exportButton}
          >
            {isProcessing ? "Processing..." : "Export Files"}
          </Button>
        </div>

        {processedRows.length > 0 && (
          <div className={styles.processedInfo}>
            ✓ Last export processed {processedRows.length} rows
          </div>
        )}
      </div>
    </div>
  );
};

export default GmailHelper;
