import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GrPowerReset } from "react-icons/gr";

const ColorReplacements = ({
  extractedColors,
  replacementColors,
  handleColorChange,
  resetColor,
}) => {
  return (
    <AccordionItem
      value="color-replacements"
      className="border border-gray-200 rounded-md bg-white px-4 mb-5"
    >
      <AccordionTrigger className="text-left">
        Color Replacements
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 py-2">
          <p className="text-sm text-gray-500">
            Replace colors to create variations of the template
          </p>

          {extractedColors.map((colorInfo) => (
            <div
              key={colorInfo.color}
              className="flex items-center gap-2 border p-2 rounded"
            >
              <div className="flex-1">
                <Label className="block text-xs mb-1">
                  Original ({colorInfo.element}
                  {colorInfo.attribute && ` - ${colorInfo.attribute}`})
                </Label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 border rounded"
                    style={{ backgroundColor: colorInfo.color }}
                  />
                  <Input
                    type="text"
                    value={colorInfo.color}
                    readOnly
                    className="w-32"
                  />
                </div>
              </div>

              <div className="flex-1">
                <Label className="block text-xs mb-1">Replacement</Label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 border rounded"
                    style={{
                      backgroundColor: replacementColors[colorInfo.color],
                    }}
                  />
                  <Input
                    type="color"
                    value={replacementColors[colorInfo.color]}
                    onChange={(e) =>
                      handleColorChange(colorInfo.color, e.target.value)
                    }
                    className="w-32"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => resetColor(colorInfo.color)}
                  >
                    <GrPowerReset className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ColorReplacements;
