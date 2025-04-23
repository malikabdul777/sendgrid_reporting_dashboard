import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const HtmlStructureVariation = ({
  htmlStructureOptions,
  setHtmlStructureOptions,
}) => {
  return (
    <AccordionItem
      value="html-structure"
      className="border border-gray-200 rounded-md bg-white px-4 mb-5"
    >
      <AccordionTrigger className="text-left">
        HTML Structure Variation
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 py-2">
          <p className="text-sm text-gray-500">
            Make subtle changes to HTML structure to avoid pattern detection
          </p>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="add-comments"
              checked={htmlStructureOptions.addRandomComments}
              onCheckedChange={(checked) =>
                setHtmlStructureOptions((prev) => ({
                  ...prev,
                  addRandomComments: checked,
                }))
              }
            />
            <Label htmlFor="add-comments">Add random HTML comments</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="vary-whitespace"
              checked={htmlStructureOptions.varyWhitespace}
              onCheckedChange={(checked) =>
                setHtmlStructureOptions((prev) => ({
                  ...prev,
                  varyWhitespace: checked,
                }))
              }
            />
            <Label htmlFor="vary-whitespace">
              Vary whitespace and indentation
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="add-attributes"
              checked={htmlStructureOptions.addRandomAttributes}
              onCheckedChange={(checked) =>
                setHtmlStructureOptions((prev) => ({
                  ...prev,
                  addRandomAttributes: checked,
                }))
              }
            />
            <Label htmlFor="add-attributes">Add random data attributes</Label>
          </div>

          {/* <Button
            variant="outline"
            className="mt-2"
            onClick={applyHtmlStructureVariations}
          >
            Apply HTML Variations
          </Button> */}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default HtmlStructureVariation;
