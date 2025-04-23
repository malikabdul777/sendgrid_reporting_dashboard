import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import HtmlStructureVariation from "./HtmlStructureVariation";
import FontTypographyVariation from "./FontTypographyVariation";
import CssStyleRandomizer from "./CssStyleRandomizer";
import ColorReplacements from "./ColorReplacements";

const TemplateVariations = ({
  htmlStructureOptions,
  setHtmlStructureOptions,
  fontOptions,
  setFontOptions,
  cssOptions,
  setCssOptions,
  applyHtmlStructureVariations,
  applyFontVariations,
  applyCssVariations,
  applyAllVariations,
  // Add color replacement props
  extractedColors,
  replacementColors,
  handleColorChange,
  resetColor,
  applyColorsToTemplate,
}) => {
  return (
    <div className="mt-8">
      <Accordion type="single" collapsible className="w-full">
        <HtmlStructureVariation
          htmlStructureOptions={htmlStructureOptions}
          setHtmlStructureOptions={setHtmlStructureOptions}
          applyHtmlStructureVariations={applyHtmlStructureVariations}
        />
        <FontTypographyVariation
          fontOptions={fontOptions}
          setFontOptions={setFontOptions}
          applyFontVariations={applyFontVariations}
        />
        <CssStyleRandomizer
          cssOptions={cssOptions}
          setCssOptions={setCssOptions}
          applyCssVariations={applyCssVariations}
        />
        <ColorReplacements
          extractedColors={extractedColors}
          replacementColors={replacementColors}
          handleColorChange={handleColorChange}
          resetColor={resetColor}
          applyColorsToTemplate={applyColorsToTemplate}
        />
      </Accordion>

      <Button className="mt-2 self-start" onClick={applyAllVariations}>
        Apply All Variations
      </Button>
    </div>
  );
};

export default TemplateVariations;
