import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FontTypographyVariation = ({ fontOptions, setFontOptions }) => {
  return (
    <AccordionItem
      value="font-typography"
      className="border border-gray-200 rounded-md bg-white px-4 mb-5"
    >
      <AccordionTrigger className="text-left">
        Font & Typography Variation
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 py-2">
          <p className="text-sm text-gray-500">
            Subtly vary fonts and typography while maintaining visual
            consistency
          </p>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="vary-font-family"
              checked={fontOptions.varyFontFamily}
              onCheckedChange={(checked) =>
                setFontOptions((prev) => ({
                  ...prev,
                  varyFontFamily: checked,
                }))
              }
            />
            <Label htmlFor="vary-font-family">
              Use alternative web-safe font
            </Label>
          </div>

          {fontOptions.varyFontFamily && (
            <div className="pl-6">
              <Label htmlFor="font-select" className="block mb-2">
                Select alternative font
              </Label>
              <Select
                value={fontOptions.selectedFont}
                onValueChange={(value) =>
                  setFontOptions((prev) => ({
                    ...prev,
                    selectedFont: value,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Verdana">Verdana</SelectItem>
                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                  <SelectItem value="Tahoma">Tahoma</SelectItem>
                  <SelectItem value="Trebuchet MS">Trebuchet MS</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                  <SelectItem value="Times New Roman">
                    Times New Roman
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="vary-font-size"
              checked={fontOptions.varyFontSize}
              onCheckedChange={(checked) =>
                setFontOptions((prev) => ({
                  ...prev,
                  varyFontSize: checked,
                }))
              }
            />
            <Label htmlFor="vary-font-size">Slightly vary font sizes</Label>
          </div>

          {fontOptions.varyFontSize && (
            <div className="pl-6 space-y-2">
              <Label htmlFor="font-size-variation" className="block">
                Font size variation (px): {fontOptions.fontSizeVariation}
              </Label>
              <Slider
                id="font-size-variation"
                min={1}
                max={3}
                step={1}
                value={[fontOptions.fontSizeVariation]}
                onValueChange={(value) =>
                  setFontOptions((prev) => ({
                    ...prev,
                    fontSizeVariation: value[0],
                  }))
                }
              />
            </div>
          )}

          {/* <Button
            variant="outline"
            className="mt-2"
            onClick={applyFontVariations}
          >
            Apply Font Variations
          </Button> */}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default FontTypographyVariation;
