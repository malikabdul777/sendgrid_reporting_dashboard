import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { IoCopyOutline } from "react-icons/io5";
import Editor from "@monaco-editor/react";
import { useCallback, useRef } from "react";
import { debounce } from "lodash";

const TemplateInput = ({
  emailTemplate,
  setEmailTemplate,
  extractColors,
  resetColors,
  extractedColors,
  handleCopyToClipboard,
}) => {
  const editorRef = useRef(null);

  // Store editor reference when it's mounted
  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  // Debounced update with improved handling for large HTML
  const debouncedSetEmailTemplate = useCallback(
    debounce((value) => {
      // Ensure we're not truncating or modifying the HTML structure
      if (value) {
        setEmailTemplate(value);
      } else {
        setEmailTemplate("");
      }
    }, 500),
    [setEmailTemplate]
  );

  return (
    <div className="space-y-2 mb-4">
      <Label htmlFor="email-template" className="block pb-3 text-base">
        Email Template
      </Label>
      <div className="relative">
        <div className="w-full h-[600px] border border-input rounded-md overflow-hidden">
          <Editor
            height="600px"
            defaultLanguage="html"
            value={emailTemplate}
            onChange={debouncedSetEmailTemplate}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              wordWrap: "on",
              formatOnPaste: false,
              formatOnType: false,
              autoIndent: "none",
              tabSize: 2,
              lineNumbers: "on",
              folding: true,
              renderWhitespace: "all",
              detectIndentation: false,
              // Prevent Monaco from auto-formatting or stripping content
              trimAutoWhitespace: false,
              autoClosingBrackets: "never",
              autoClosingQuotes: "never",
              matchBrackets: "never",
              matchOverviewRuler: false,
              // Allow large files
              largeFileOptimizations: false,
              scrollbar: { vertical: "visible", horizontal: "visible" },
              // Increase performance for large files
              wordBasedSuggestions: false,
              // Disable auto-formatting which can cause truncation
              formatOnSave: false,
              // Increase editor performance
              renderLineHighlight: "none",
              // Disable validation which can be slow for large HTML
              html: {
                format: {
                  enable: false,
                },
                validate: {
                  scripts: false,
                  styles: false,
                },
              },
              // Increase max tokenization line count
              "editor.maxTokenizationLineLength": 100000,
            }}
          />
        </div>
        <div className="absolute bottom-8 right-6 flex gap-2">
          {emailTemplate && (
            <button
              onClick={handleCopyToClipboard}
              className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-100 transition-colors border-2 border-solid"
              aria-label="Copy to clipboard"
              title="Copy to clipboard"
            >
              <IoCopyOutline className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <Button onClick={extractColors} className="self-start mt-5">
          Process Template
        </Button>
      </div>
    </div>
  );
};

export default TemplateInput;
