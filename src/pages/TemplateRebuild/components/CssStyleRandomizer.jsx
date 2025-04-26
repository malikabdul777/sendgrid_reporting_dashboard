import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

const CssStyleRandomizer = ({ cssOptions, setCssOptions }) => {
  return (
    <AccordionItem
      value="css-styles"
      className="border border-gray-200 rounded-md bg-white px-4 mb-5"
    >
      <AccordionTrigger className="text-left">
        CSS Style Randomizer
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 py-2">
          <p className="text-sm text-gray-500">
            Subtly vary CSS properties to create different code signatures
          </p>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="vary-padding"
              checked={cssOptions.varyPadding}
              onCheckedChange={(checked) =>
                setCssOptions((prev) => ({
                  ...prev,
                  varyPadding: checked,
                }))
              }
            />
            <Label htmlFor="vary-padding">Vary padding values</Label>
          </div>

          {cssOptions.varyPadding && (
            <div className="pl-6 space-y-2">
              <Label htmlFor="padding-variation" className="block">
                Max padding variation (px): {cssOptions.paddingVariation}
              </Label>
              <Slider
                id="padding-variation"
                min={1}
                max={5}
                step={1}
                value={[cssOptions.paddingVariation]}
                onValueChange={(value) =>
                  setCssOptions((prev) => ({
                    ...prev,
                    paddingVariation: value[0],
                  }))
                }
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="vary-margin"
              checked={cssOptions.varyMargin}
              onCheckedChange={(checked) =>
                setCssOptions((prev) => ({
                  ...prev,
                  varyMargin: checked,
                }))
              }
            />
            <Label htmlFor="vary-margin">Vary margin values</Label>
          </div>

          {cssOptions.varyMargin && (
            <div className="pl-6 space-y-2">
              <Label htmlFor="margin-variation" className="block">
                Max margin variation (px): {cssOptions.marginVariation}
              </Label>
              <Slider
                id="margin-variation"
                min={1}
                max={5}
                step={1}
                value={[cssOptions.marginVariation]}
                onValueChange={(value) =>
                  setCssOptions((prev) => ({
                    ...prev,
                    marginVariation: value[0],
                  }))
                }
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="vary-border-radius"
              checked={cssOptions.varyBorderRadius}
              onCheckedChange={(checked) =>
                setCssOptions((prev) => ({
                  ...prev,
                  varyBorderRadius: checked,
                }))
              }
            />
            <Label htmlFor="vary-border-radius">
              Vary border-radius values
            </Label>
          </div>

          {cssOptions.varyBorderRadius && (
            <div className="pl-6 space-y-2">
              <Label htmlFor="border-radius-variation" className="block">
                Max border-radius variation (px):{" "}
                {cssOptions.borderRadiusVariation}
              </Label>
              <Slider
                id="border-radius-variation"
                min={1}
                max={3}
                step={1}
                value={[cssOptions.borderRadiusVariation]}
                onValueChange={(value) =>
                  setCssOptions((prev) => ({
                    ...prev,
                    borderRadiusVariation: value[0],
                  }))
                }
              />
            </div>
          )}

          {/* Add checkbox for randomize class names */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="randomize-class-names"
              checked={cssOptions.randomizeClassNames}
              onCheckedChange={(checked) =>
                setCssOptions((prev) => ({
                  ...prev,
                  randomizeClassNames: checked,
                }))
              }
            />
            <Label htmlFor="randomize-class-names">
              Randomize class names in CSS and HTML
            </Label>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default CssStyleRandomizer;
