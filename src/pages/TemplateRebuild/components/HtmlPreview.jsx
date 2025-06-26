import { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { Label } from "@/components/ui/label";

const HtmlPreview = ({ htmlPreview, setEmailTemplate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const lastHtmlPreview = useRef("");
  const processingUpdate = useRef(false);
  const iframeRef = useRef(null);

  // Initialize editor with more robust configuration
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable history to prevent memory issues with large documents
        history: false,
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: "",
    editable: true,
    onUpdate: ({ editor }) => {
      if (processingUpdate.current) return;

      const html = editor.getHTML();
      setEditorContent(html);

      if (setEmailTemplate && html !== htmlPreview && isEditing) {
        processingUpdate.current = true;
        setEmailTemplate((prevTemplate) => {
          // Preserve headers if present
          const lines = prevTemplate.split("\n");
          let headerLines = [];
          let foundHtmlStart = false;

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim().toLowerCase();
            if (
              !foundHtmlStart &&
              (line.includes("<!doctype") ||
                line.includes("<html") ||
                line.includes("<body"))
            ) {
              foundHtmlStart = true;
              break;
            }
            headerLines.push(lines[i]);
          }

          let result;
          if (headerLines.length > 0 && foundHtmlStart) {
            result = headerLines.join("\n") + "\n" + html;
          } else {
            result = html;
          }

          setTimeout(() => {
            processingUpdate.current = false;
          }, 100);

          return result;
        });
      }
    },
  });

  // Update editor content when htmlPreview changes from parent
  useEffect(() => {
    if (!editor || processingUpdate.current) return;

    // Only update if content actually changed
    if (htmlPreview !== lastHtmlPreview.current) {
      console.log("Updating editor content from htmlPreview");
      processingUpdate.current = true;

      try {
        // Set content with a timeout to avoid React rendering issues
        setTimeout(() => {
          editor.commands.setContent(htmlPreview || "");
          setEditorContent(htmlPreview || "");
          lastHtmlPreview.current = htmlPreview;
          processingUpdate.current = false;
        }, 50);
      } catch (error) {
        console.error("Error updating editor content:", error);
        processingUpdate.current = false;
      }
    }
  }, [htmlPreview, editor]);

  // Reset editing state when htmlPreview changes
  useEffect(() => {
    setIsEditing(false);
  }, [htmlPreview]);

  // Update iframe content when htmlPreview changes
  useEffect(() => {
    if (!htmlPreview || !iframeRef.current) return;

    try {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

      // Clear the document
      iframeDoc.open();

      // Write the complete HTML including DOCTYPE and head
      iframeDoc.write(htmlPreview);

      // Close the document
      iframeDoc.close();
    } catch (error) {
      console.error("Error updating iframe content:", error);
    }
  }, [htmlPreview]);

  // Determine if we have valid content to display
  const hasValidContent = Boolean(htmlPreview && htmlPreview.trim());

  return (
    <div
      className="w-1/2 sticky top-4"
      style={{ alignSelf: "flex-start", maxHeight: "calc(100vh - 2rem)" }}
    >
      <div className="space-y-2">
        <div className="flex justify-between items-center pb-3">
          <Label className="block text-base">HTML Preview & Editor</Label>
        </div>

        <div className="border border-input rounded-md overflow-hidden">
          {hasValidContent ? (
            // Rendered HTML view
            <iframe
              ref={iframeRef}
              className="w-full h-[calc(100vh-8rem)] bg-white"
              title="HTML Preview"
              sandbox="allow-same-origin"
            />
          ) : (
            <div className="h-[calc(100vh-8rem)] flex items-center justify-center text-gray-500 bg-gray-50">
              <p>
                No HTML content to preview. Please enter an email template.
                {htmlPreview === undefined && " (htmlPreview is undefined)"}
                {htmlPreview === "" && " (htmlPreview is empty string)"}
                {htmlPreview &&
                  htmlPreview.trim() === "" &&
                  " (htmlPreview contains only whitespace)"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HtmlPreview;
