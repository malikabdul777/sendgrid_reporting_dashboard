import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { IoCopyOutline } from "react-icons/io5";

const TemplateInput = ({
  emailTemplate,
  setEmailTemplate,
  extractColors,
  resetColors,
  extractedColors,
  handleCopyToClipboard,
}) => {
  return (
    <div className="space-y-2 mb-4">
      <Label htmlFor="email-template" className="block pb-3 text-base">
        Email Template
      </Label>
      <div className="relative">
        <Textarea
          id="email-template"
          placeholder="Paste your HTML email template here..."
          className="w-full h-[400px]"
          value={emailTemplate}
          onChange={(e) => setEmailTemplate(e.target.value)}
        />
        {emailTemplate && (
          <button
            onClick={handleCopyToClipboard}
            className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Copy to clipboard"
          >
            <IoCopyOutline className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>
      <div className="flex gap-2 mb-4">
        <Button onClick={extractColors} className="self-start mt-5">
          Process Template
        </Button>
        {/* {extractedColors.length > 0 && (
          <Button
            onClick={resetColors}
            variant="outline"
            className="self-start"
          >
            Reset All Colors
          </Button>
        )} */}
      </div>
    </div>
  );
};

export default TemplateInput;
