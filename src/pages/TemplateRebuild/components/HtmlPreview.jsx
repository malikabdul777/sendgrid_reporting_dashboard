import { Label } from "@/components/ui/label";

const HtmlPreview = ({ htmlPreview }) => {
  return (
    <div className="sticky top-4 w-full">
      <Label className="block pb-3">Preview</Label>
      <div className="border rounded-md h-[calc(100vh-200px)] overflow-auto bg-white">
        {htmlPreview ? (
          <iframe
            srcDoc={htmlPreview}
            title="Email Preview"
            className="w-full h-full"
            sandbox="allow-same-origin allow-scripts"
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
