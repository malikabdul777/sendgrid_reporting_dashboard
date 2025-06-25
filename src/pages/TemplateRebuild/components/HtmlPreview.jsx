import { useEffect, useState, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Label } from "@/components/ui/label";

const HtmlPreview = ({ htmlPreview, setEmailTemplate }) => {
  const [editorContent, setEditorContent] = useState("");
  const isInitialRender = useRef(true);
  const quillRef = useRef(null);

  // Update editor content when htmlPreview changes (from parent)
  useEffect(() => {
    if (htmlPreview && (!editorContent || !isEditing)) {
      setEditorContent(htmlPreview);
    }
  }, [htmlPreview]);

  // Handle content changes in the editor
  const handleEditorChange = (content) => {
    setEditorContent(content);
    
    // Update parent component's state
    if (setEmailTemplate && content !== htmlPreview) {
      // If the email template contains more than just HTML (like headers),
      // we need to preserve those parts
      if (htmlPreview && htmlPreview !== content) {
        setEmailTemplate((prevTemplate) => {
          if (prevTemplate.includes(htmlPreview)) {
            const beforeHtml = prevTemplate.substring(
              0,
              prevTemplate.indexOf(htmlPreview)
            );
            const afterHtml = prevTemplate.substring(
              prevTemplate.indexOf(htmlPreview) + htmlPreview.length
            );
            return beforeHtml + content + afterHtml;
          }
          return content;
        });
      } else {
        setEmailTemplate(content);
      }
    }
  };

  // Configure Quill modules and formats
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'align',
    'link', 'image'
  ];

  return (
    <div className="sticky top-4 w-full">
      <Label className="block pb-3">Preview</Label>
      <div className="border rounded-md h-[calc(100vh-200px)] overflow-auto bg-white">
        {htmlPreview ? (
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={editorContent}
            onChange={handleEditorChange}
            modules={modules}
            formats={formats}
            className="h-[calc(100vh-250px)]"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Paste an email template to see the preview
          </div>
        )}
      </div>
    </div>
  );
};

export default HtmlPreview;
