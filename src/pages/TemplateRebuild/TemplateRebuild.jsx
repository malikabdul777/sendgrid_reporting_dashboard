import { useState, useEffect } from "react";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import styles from "./TemplateRebuild.module.css";

import TemplateInput from "./components/TemplateInput";
import HtmlPreview from "./components/HtmlPreview";
import TemplateVariations from "./components/TemplateVariations";
import { Label } from "@/components/ui/label";

// Import utility functions
import {
  addRandomCommentsToString,
  varyWhitespaceInString,
  addRandomAttributesToString,
  varyFontProperties,
  varyCssProperties,
  randomizeInlineStyleOrder,
  randomizeAttributeOrder,
  randomizeClassNames,
} from "./components/htmlUtils.js";

const TemplateRebuild = () => {
  const [emailTemplate, setEmailTemplate] = useState("");
  const [extractedColors, setExtractedColors] = useState([]);
  const [replacementColors, setReplacementColors] = useState({});
  const [htmlPreview, setHtmlPreview] = useState("");
  const [originalHtml, setOriginalHtml] = useState("");

  const [htmlStructureOptions, setHtmlStructureOptions] = useState({
    addRandomComments: true,
    varyWhitespace: true,
    addRandomAttributes: true,
    randomizeInlineStyleOrder: true,
    randomizeAttributeOrder: true,
  });

  const [fontOptions, setFontOptions] = useState({
    varyFontFamily: true,
    selectedFont: "Helvetica",
    varyFontSize: true,
    fontSizeVariation: 1,
  });

  const [cssOptions, setCssOptions] = useState({
    varyPadding: true,
    paddingVariation: 2,
    varyMargin: true,
    marginVariation: 2,
    varyBorderRadius: false,
    borderRadiusVariation: 1,
    randomizeClassNames: true,
  });

  // Extract HTML content whenever the email template changes
  useEffect(() => {
    if (!emailTemplate) {
      setHtmlPreview("");
      setOriginalHtml("");
      return;
    }

    // Extract content from DOCTYPE to end of HTML
    const docTypeRegex = /<!DOCTYPE[^>]*>[\s\S]*?<\/html>/i;
    const match = emailTemplate.match(docTypeRegex);

    let extractedHtml = "";
    if (match) {
      extractedHtml = match[0];
    } else {
      // If no DOCTYPE, try to extract just the HTML part
      const htmlRegex = /<html[\s\S]*?<\/html>/i;
      const htmlMatch = emailTemplate.match(htmlRegex);
      extractedHtml = htmlMatch ? htmlMatch[0] : "";
    }

    setOriginalHtml(extractedHtml);
    setHtmlPreview(extractedHtml);
  }, [emailTemplate]);

  // Update preview when replacement colors change
  useEffect(() => {
    if (!originalHtml || Object.keys(replacementColors).length === 0) return;

    let updatedHtml = originalHtml;

    // Replace colors in a way that preserves the HTML structure
    Object.entries(replacementColors).forEach(([originalColor, newColor]) => {
      if (newColor && originalColor !== newColor) {
        // Create a regex that targets colors in style attributes and CSS rules
        const safeColorRegex = new RegExp(
          `(color:|background(-color)?:|border(-color)?:|fill:|stroke:|\\s+)${originalColor.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          )}(\\s|;|,|\\)|$)`,
          "g"
        );

        updatedHtml = updatedHtml.replace(
          safeColorRegex,
          (match, prefix, _, __, suffix) => {
            return `${prefix}${newColor}${suffix}`;
          }
        );
      }
    });

    setHtmlPreview(updatedHtml);
  }, [replacementColors, originalHtml]);

  const extractColors = () => {
    if (!emailTemplate) return;

    // Regular expressions to match different color formats
    const hexColorRegex = /#([0-9a-fA-F]{3,6})\b/g;
    const rgbColorRegex = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g;
    const rgbaColorRegex =
      /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([0-9.]+)\s*\)/g;

    // Extract all color matches with their context
    const colorMatches = [];

    // Function to extract element context for a color match
    const extractElementContext = (match, startIndex) => {
      // Look for the nearest opening tag before the color
      const textBefore = emailTemplate.substring(0, startIndex);
      const lastOpeningTagMatch = textBefore.match(
        /<([a-zA-Z][a-zA-Z0-9]*)[^>]*$/
      );

      if (lastOpeningTagMatch) {
        const tagName = lastOpeningTagMatch[1];

        // Try to find attribute name if it's in an attribute
        const attrMatch = textBefore.match(/\s([a-zA-Z-]+)=['"]?[^'"]*$/);
        const attribute = attrMatch ? attrMatch[1] : null;

        return {
          element: tagName,
          attribute: attribute,
        };
      }

      return { element: "Unknown", attribute: null };
    };

    // Process hex colors
    let match;
    while ((match = hexColorRegex.exec(emailTemplate)) !== null) {
      const context = extractElementContext(match[0], match.index);
      colorMatches.push({
        color: match[0],
        element: context.element,
        attribute: context.attribute,
      });
    }

    // Process rgb colors
    while ((match = rgbColorRegex.exec(emailTemplate)) !== null) {
      const context = extractElementContext(match[0], match.index);
      colorMatches.push({
        color: match[0],
        element: context.element,
        attribute: context.attribute,
      });
    }

    // Process rgba colors
    while ((match = rgbaColorRegex.exec(emailTemplate)) !== null) {
      const context = extractElementContext(match[0], match.index);
      colorMatches.push({
        color: match[0],
        element: context.element,
        attribute: context.attribute,
      });
    }

    // Deduplicate colors while preserving context
    const uniqueColors = [];
    const seen = new Set();

    colorMatches.forEach((match) => {
      if (!seen.has(match.color)) {
        seen.add(match.color);
        uniqueColors.push(match);
      }
    });

    setExtractedColors(uniqueColors);

    // Initialize replacement colors object with the original colors
    const initialReplacements = {};
    uniqueColors.forEach(({ color }) => {
      if (color.startsWith("#")) {
        initialReplacements[color] = color;
      } else {
        initialReplacements[color] = color;
      }
    });
    setReplacementColors(initialReplacements);

    toast.success("Colors extracted successfully!", {
      position: "bottom-center",
    });
  };

  const handleColorChange = (originalColor, newColor) => {
    setReplacementColors((prev) => ({
      ...prev,
      [originalColor]: newColor,
    }));
  };

  const resetColor = (originalColor) => {
    setReplacementColors((prev) => ({
      ...prev,
      [originalColor]: originalColor,
    }));

    toast.info(`Color ${originalColor} reset to original`, {
      position: "bottom-center",
    });
  };

  const resetColors = () => {
    // Reset all replacement colors to the original colors
    const resetReplacements = {};
    extractedColors.forEach((colorInfo) => {
      resetReplacements[colorInfo.color] = colorInfo.color;
    });
    setReplacementColors(resetReplacements);
    setHtmlPreview(originalHtml);

    toast.info("All colors reset to original", {
      position: "bottom-center",
    });
  };

  const applyColorsToTemplate = () => {
    if (!emailTemplate || Object.keys(replacementColors).length === 0) return;

    let updatedTemplate = emailTemplate;

    // Apply color replacements to the full template
    Object.entries(replacementColors).forEach(([originalColor, newColor]) => {
      if (newColor && originalColor !== newColor) {
        // Create a regex that targets colors in style attributes and CSS rules
        // but avoids URLs and other non-color contexts
        const safeColorRegex = new RegExp(
          `(color:|background(-color)?:|border(-color)?:|fill:|stroke:|\\s+)${originalColor.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          )}(\\s|;|,|\\)|$)`,
          "g"
        );

        updatedTemplate = updatedTemplate.replace(
          safeColorRegex,
          (match, prefix, _, __, suffix) => {
            return `${prefix}${newColor}${suffix}`;
          }
        );
      }
    });

    setEmailTemplate(updatedTemplate);

    toast.success("Colors applied to template successfully!", {
      position: "bottom-center",
    });
  };

  // Add a function to handle copying the template to clipboard
  const handleCopyToClipboard = () => {
    navigator.clipboard
      .writeText(emailTemplate)
      .then(() => {
        toast.success("Copied to clipboard!", {
          position: "bottom-center",
        });
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        toast.error("Failed to copy template to clipboard.", {
          position: "bottom-center",
        });
      });
  };

  // Add this function after the handleCopyToClipboard function
  const applyHtmlStructureVariations = () => {
    if (!originalHtml) {
      toast.error("No HTML template to modify", {
        position: "bottom-center",
      });
      return;
    }

    // Create a DOM parser to work with the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(originalHtml, "text/html");

    // Apply selected variations
    if (htmlStructureOptions.addRandomComments) {
      addRandomComments(doc);
    }

    if (htmlStructureOptions.varyWhitespace) {
      varyWhitespace(doc);
    }

    if (htmlStructureOptions.addRandomAttributes) {
      addRandomAttributes(doc);
    }

    // Convert back to HTML string
    const updatedHtml = doc.documentElement.outerHTML;
    setHtmlPreview(updatedHtml);

    toast.success("HTML structure variations applied", {
      position: "bottom-center",
    });
  };

  // Helper function to add random comments
  const addRandomComments = (doc) => {
    const commentTexts = [
      "Layout section",
      "Content area",
      "User information",
      "Main content",
      "Header region",
      "Footer section",
      "Navigation",
      "Banner",
      "Call to action",
      "Product details",
    ];

    // Target elements that are good candidates for comments
    const elements = doc.querySelectorAll(
      "div, table, tr, td, section, header, footer"
    );

    // Add comments to random elements (max 5)
    const elementsToModify = Math.min(5, elements.length);
    const selectedIndices = new Set();

    while (selectedIndices.size < elementsToModify) {
      const randomIndex = Math.floor(Math.random() * elements.length);
      selectedIndices.add(randomIndex);
    }

    selectedIndices.forEach((index) => {
      if (elements[index]) {
        const randomComment =
          commentTexts[Math.floor(Math.random() * commentTexts.length)];
        const comment = doc.createComment(` ${randomComment} `);
        elements[index].parentNode.insertBefore(comment, elements[index]);
      }
    });
  };

  // Helper function to vary whitespace
  const varyWhitespace = (doc) => {
    // Add a few non-breaking spaces in random places
    const textNodes = [];
    const walker = document.createTreeWalker(
      doc.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while ((node = walker.nextNode())) {
      if (node.textContent.trim().length > 0) {
        textNodes.push(node);
      }
    }

    // Modify up to 3 text nodes
    const nodesToModify = Math.min(3, textNodes.length);
    const selectedIndices = new Set();

    while (selectedIndices.size < nodesToModify) {
      const randomIndex = Math.floor(Math.random() * textNodes.length);
      selectedIndices.add(randomIndex);
    }

    selectedIndices.forEach((index) => {
      if (textNodes[index]) {
        const text = textNodes[index].textContent;
        const position = Math.floor(Math.random() * text.length);
        textNodes[index].textContent =
          text.slice(0, position) + "\u00A0" + text.slice(position);
      }
    });
  };

  // Helper function to add random data attributes
  const addRandomAttributes = (doc) => {
    const attributeNames = [
      "data-section",
      "data-element",
      "data-component",
      "data-region",
      "data-content",
      "data-type",
    ];

    const attributeValues = [
      "primary",
      "secondary",
      "tertiary",
      "main",
      "sub",
      "header",
      "footer",
      "content",
      "sidebar",
      "navigation",
    ];

    // Target elements that are good candidates for attributes
    const elements = doc.querySelectorAll(
      "div, table, tr, td, a, img, p, h1, h2, h3, h4, h5, h6"
    );

    // Add attributes to random elements (max 8)
    const elementsToModify = Math.min(8, elements.length);
    const selectedIndices = new Set();

    while (selectedIndices.size < elementsToModify) {
      const randomIndex = Math.floor(Math.random() * elements.length);
      selectedIndices.add(randomIndex);
    }

    selectedIndices.forEach((index) => {
      if (elements[index]) {
        const randomAttrName =
          attributeNames[Math.floor(Math.random() * attributeNames.length)];
        const randomAttrValue =
          attributeValues[Math.floor(Math.random() * attributeValues.length)];
        elements[index].setAttribute(randomAttrName, randomAttrValue);
      }
    });
  };

  // Add these new functions
  const applyFontVariations = () => {
    if (!originalHtml) {
      toast.error("No HTML template to modify", {
        position: "bottom-center",
      });
      return;
    }

    let updatedHtml = varyFontProperties(originalHtml, fontOptions);
    setHtmlPreview(updatedHtml);

    toast.success("Font variations applied", {
      position: "bottom-center",
    });
  };

  const applyCssVariations = () => {
    if (!originalHtml) {
      toast.error("No HTML template to modify", {
        position: "bottom-center",
      });
      return;
    }

    let updatedHtml = varyCssProperties(originalHtml, cssOptions);
    setHtmlPreview(updatedHtml);

    toast.success("CSS variations applied", {
      position: "bottom-center",
    });
  };

  const applyAllVariations = () => {
    if (!originalHtml) {
      toast.error("No HTML template to modify", {
        position: "bottom-center",
      });
      return;
    }

    let updatedHtml = originalHtml;

    // Apply variations in sequence, but preserve style tags
    if (htmlStructureOptions.addRandomComments) {
      updatedHtml = addRandomCommentsToString(updatedHtml);
    }
    if (htmlStructureOptions.varyWhitespace) {
      updatedHtml = varyWhitespaceInString(updatedHtml);
    }
    if (htmlStructureOptions.addRandomAttributes) {
      updatedHtml = addRandomAttributesToString(updatedHtml);
    }
    if (fontOptions.varyFontFamily || fontOptions.varyFontSize) {
      updatedHtml = varyFontProperties(updatedHtml, fontOptions);
    }
    if (htmlStructureOptions.randomizeInlineStyleOrder) {
      updatedHtml = randomizeInlineStyleOrder(updatedHtml);
    }
    if (htmlStructureOptions.randomizeAttributeOrder) {
      updatedHtml = randomizeAttributeOrder(updatedHtml);
    }
    if (
      cssOptions.varyPadding ||
      cssOptions.varyMargin ||
      cssOptions.varyBorderRadius
    ) {
      updatedHtml = varyCssProperties(updatedHtml, cssOptions);
    }

    if (cssOptions.randomizeClassNames) {
      updatedHtml = randomizeClassNames(updatedHtml);
    }

    // Apply color replacements last
    Object.entries(replacementColors).forEach(([originalColor, newColor]) => {
      if (newColor && originalColor !== newColor) {
        const safeColorRegex = new RegExp(
          `(color:|background(-color)?:|border(-color)?:|fill:|stroke:|\\s+)${originalColor.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          )}(\\s|;|,|\\)|$)`,
          "g"
        );

        updatedHtml = updatedHtml.replace(
          safeColorRegex,
          (match, prefix, _, __, suffix) => {
            return `${prefix}${newColor}${suffix}`;
          }
        );
      }
    });

    // Update both preview and template
    setHtmlPreview(updatedHtml);

    // Only update the full template if we have content before/after HTML
    if (emailTemplate.includes(originalHtml)) {
      const beforeHtml = emailTemplate.substring(
        0,
        emailTemplate.indexOf(originalHtml)
      );
      const afterHtml = emailTemplate.substring(
        emailTemplate.indexOf(originalHtml) + originalHtml.length
      );
      setEmailTemplate(beforeHtml + updatedHtml + afterHtml);
    } else {
      setEmailTemplate(updatedHtml);
    }

    toast.success("All variations applied successfully!", {
      position: "bottom-center",
    });
  };

  return (
    <div className={styles.container}>
      <div className="flex gap-6">
        <div className="w-1/2">
          <div className={styles.wrapper}>
            <div className="space-y-4">
              <div className={styles.header}>
                <h3 className={styles.subHeading}>Email Template Rebuilder</h3>
              </div>
              <TemplateInput
                emailTemplate={emailTemplate}
                setEmailTemplate={setEmailTemplate}
                extractColors={extractColors}
                resetColors={resetColors}
                extractedColors={extractedColors}
                handleCopyToClipboard={handleCopyToClipboard}
              />

              {extractedColors.length > 0 && (
                <div className="space-y-4">
                  <Label className="block pb-1 mt-12 text-base">
                    Template Variations
                  </Label>
                  <TemplateVariations
                    htmlStructureOptions={htmlStructureOptions}
                    setHtmlStructureOptions={setHtmlStructureOptions}
                    fontOptions={fontOptions}
                    setFontOptions={setFontOptions}
                    cssOptions={cssOptions}
                    setCssOptions={setCssOptions}
                    applyHtmlStructureVariations={applyHtmlStructureVariations}
                    applyFontVariations={applyFontVariations}
                    applyCssVariations={applyCssVariations}
                    applyAllVariations={applyAllVariations}
                    // Add these new props
                    extractedColors={extractedColors}
                    replacementColors={replacementColors}
                    handleColorChange={handleColorChange}
                    resetColor={resetColor}
                    applyColorsToTemplate={applyColorsToTemplate}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Right side - Preview */}
        <HtmlPreview
          htmlPreview={htmlPreview}
          setEmailTemplate={setEmailTemplate}
        />
      </div>
    </div>
  );
};

export default TemplateRebuild;
