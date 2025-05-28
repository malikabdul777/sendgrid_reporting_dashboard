import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { IoCopyOutline } from "react-icons/io5";
import Editor from "@monaco-editor/react";

const TemplateInput = ({
  emailTemplate,
  setEmailTemplate,
  extractColors,
  resetColors,
  extractedColors,
  handleCopyToClipboard,
}) => {
  // Function to format HTML code with special handling for email headers
  const formatCode = () => {
    if (!emailTemplate) return;

    // Split the template into headers and HTML content
    const lines = emailTemplate.split("\n");
    let headerLines = [];
    let htmlLines = [];
    let foundDoctype = false;

    // Separate headers from HTML content
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (
        !foundDoctype &&
        (line.toLowerCase().includes("<!doctype") ||
          line.toLowerCase().includes("<html"))
      ) {
        foundDoctype = true;
      }

      if (foundDoctype) {
        htmlLines.push(line);
      } else {
        headerLines.push(line);
      }
    }

    // Format only the HTML part
    let formattedHtml = "";
    if (htmlLines.length > 0) {
      // Create a temporary DOM element
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = htmlLines.join("\n").trim();

      // Format the HTML with proper indentation
      formattedHtml = formatHTML(tempDiv);
    }

    // Combine headers (unindented) with formatted HTML
    const formattedTemplate =
      headerLines.join("\n") +
      (headerLines.length > 0 && formattedHtml ? "\n\n" : "") +
      formattedHtml;

    setEmailTemplate(formattedTemplate);
  };

  // Helper function to format HTML with proper indentation
  const formatHTML = (node, level = 0) => {
    const indentBefore = new Array(level++ + 1).join("  ");
    const indentAfter = new Array(level - 1).join("  ");
    let textNode;

    let html = "";

    // Special handling for DOCTYPE and HTML tags at the root level
    if (node.nodeType === 9) {
      // DOCUMENT_NODE
      const doctype = node.doctype;
      if (doctype) {
        html += "<!DOCTYPE " + doctype.name + ">\n";
      }

      if (node.documentElement) {
        html += formatHTML(node.documentElement, 0);
      }

      return html;
    }

    // Format regular HTML elements
    if (node.nodeType === 1) {
      // ELEMENT_NODE
      html += indentBefore + "<" + node.nodeName.toLowerCase();

      // Add attributes
      for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes[i];
        html += " " + attr.name + '="' + attr.value + '"';
      }

      html += ">";

      // Add content or recursively format child elements
      if (node.children.length > 0) {
        html += "\n";
        for (let i = 0; i < node.children.length; i++) {
          html += formatHTML(node.children[i], level);
        }
        html += indentBefore;
      } else {
        const content = node.textContent.trim();
        if (content) {
          html += content;
        }
      }

      // Closing tag
      html += "</" + node.nodeName.toLowerCase() + ">\n";
    }

    return html;
  };

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
            onChange={setEmailTemplate}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
              wordWrap: "on",
              formatOnPaste: false, // Disabled automatic formatting
              formatOnType: false, // Disabled automatic formatting
              autoIndent: "none", // Disabled automatic indentation
              tabSize: 2,
            }}
          />
        </div>
        <div className="absolute bottom-8 right-6 flex gap-2">
          {/* <button
            onClick={formatCode}
            className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Format code"
            title="Format code"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-600"
            >
              <path d="M21 10H3" />
              <path d="M21 6H3" />
              <path d="M21 14H3" />
              <path d="M21 18H3" />
            </svg>
          </button> */}
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
