// Helper function to add random comments to HTML string
export const addRandomCommentsToString = (htmlString) => {
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

  // Find suitable places to insert comments (before opening tags)
  const tagRegex = /<(div|table|tr|td|section|header|footer)([^>]*)>/gi;

  // Collect all matches
  const matches = [];
  let match;
  while ((match = tagRegex.exec(htmlString)) !== null) {
    matches.push({
      index: match.index,
      tag: match[1],
      fullMatch: match[0],
    });
  }

  // Select up to 5 random positions to add comments
  const positions = [];
  if (matches.length > 0) {
    const maxComments = Math.min(5, matches.length);
    while (positions.length < maxComments) {
      const randomIndex = Math.floor(Math.random() * matches.length);
      if (!positions.includes(randomIndex)) {
        positions.push(randomIndex);
      }
    }

    // Sort positions in descending order to avoid index shifting
    positions.sort((a, b) => b - a);

    // Insert comments at the selected positions
    let result = htmlString;
    for (const posIndex of positions) {
      const matchInfo = matches[posIndex];
      const randomComment =
        commentTexts[Math.floor(Math.random() * commentTexts.length)];
      const commentText = `<!-- ${randomComment} -->`;

      result =
        result.slice(0, matchInfo.index) +
        commentText +
        result.slice(matchInfo.index);
    }

    return result;
  }

  return htmlString;
};

// Helper function to vary whitespace in HTML string
export const varyWhitespaceInString = (htmlString) => {
  // Add random indentation to some lines
  const lines = htmlString.split("\n");
  const result = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (Math.random() < 0.2 && line.trim().startsWith("<")) {
      const extraSpaces = " ".repeat(Math.floor(Math.random() * 4) + 1);
      result.push(extraSpaces + line);
    } else {
      result.push(line);
    }
  }

  return result.join("\n");
};

// Helper function to add random attributes to HTML string
export const addRandomAttributesToString = (htmlString) => {
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

  const tagRegex = /<(div|table|tr|td|a|img|p|h[1-6])([^>]*)>/gi;
  const matches = [];
  let match;
  while ((match = tagRegex.exec(htmlString)) !== null) {
    matches.push({
      index: match.index,
      tag: match[1],
      attributes: match[2],
      fullMatch: match[0],
      endIndex: match.index + match[0].length,
    });
  }

  const elementsToModify = Math.min(8, matches.length);
  const selectedIndices = new Set();
  while (selectedIndices.size < elementsToModify) {
    selectedIndices.add(Math.floor(Math.random() * matches.length));
  }

  let result = htmlString;
  Array.from(selectedIndices)
    .sort((a, b) => b - a)
    .forEach((index) => {
      const matchInfo = matches[index];
      const randomAttrName =
        attributeNames[Math.floor(Math.random() * attributeNames.length)];
      const randomAttrValue =
        attributeValues[Math.floor(Math.random() * attributeValues.length)];
      const newAttribute = ` ${randomAttrName}="${randomAttrValue}"`;
      result =
        result.slice(0, matchInfo.endIndex - 1) +
        newAttribute +
        result.slice(matchInfo.endIndex - 1);
    });

  return result;
};

// Helper function to split HTML into chunks (style/conditional and normal)
const splitHtmlChunks = (html) => {
  const chunks = [];
  let lastIndex = 0;
  // Regex to match both <style>...</style> and <!--[if ...]>...<![endif]-->
  const combinedRegex =
    /(<style[^>]*>[\s\S]*?<\/style>)|(<!--\[if[\s\S]*?<!\[endif\]-->)/gi;
  let match;

  while ((match = combinedRegex.exec(html)) !== null) {
    // Add normal HTML chunk before the match
    if (match.index > lastIndex) {
      chunks.push({
        type: "html",
        content: html.slice(lastIndex, match.index),
      });
    }
    // Add the matched style/conditional block
    chunks.push({ type: "style", content: match[0] });
    lastIndex = match.index + match[0].length;
  }
  // Add any remaining HTML after the last match
  if (lastIndex < html.length) {
    chunks.push({ type: "html", content: html.slice(lastIndex) });
  }
  return chunks;
};

// Helper function to process only the HTML chunks
const processHtmlChunks = (chunks, processor) => {
  return chunks
    .map((chunk) =>
      chunk.type === "html"
        ? { ...chunk, content: processor(chunk.content) }
        : chunk
    )
    .map((chunk) => chunk.content)
    .join("");
};

// Update the font and CSS variation functions to use these helpers
export const varyFontProperties = (htmlString, fontOptions) => {
  if (!fontOptions.varyFontFamily && !fontOptions.varyFontSize) {
    return htmlString;
  }

  const chunks = splitHtmlChunks(htmlString);

  const processor = (html) => {
    let result = html;
    if (fontOptions.varyFontFamily && fontOptions.selectedFont) {
      const fontFamilyRegex =
        /style=["'][^"']*?font-family\s*:\s*([^;]+);[^"']*?["']/gi;
      result = result.replace(fontFamilyRegex, (match, fontValue) => {
        if (fontValue.includes(fontOptions.selectedFont)) {
          return match;
        }
        return match.replace(
          fontValue,
          `${fontOptions.selectedFont}, ${fontValue}`
        );
      });
    }

    if (fontOptions.varyFontSize && fontOptions.fontSizeVariation > 0) {
      const fontSizeRegex =
        /style=["'][^"']*?font-size\s*:\s*(\d+)(px|pt|rem|em);[^"']*?["']/gi;
      result = result.replace(fontSizeRegex, (match, size, unit) => {
        const direction = Math.random() > 0.5 ? 1 : -1;
        const variation = Math.ceil(
          Math.random() * fontOptions.fontSizeVariation
        );
        const newSize = Math.max(1, parseInt(size) + direction * variation);
        return match.replace(`${size}${unit}`, `${newSize}${unit}`);
      });
    }
    return result;
  };

  return processHtmlChunks(chunks, processor);
};

export const varyCssProperties = (htmlString, cssOptions) => {
  if (
    !cssOptions.varyPadding &&
    !cssOptions.varyMargin &&
    !cssOptions.varyBorderRadius
  ) {
    return htmlString;
  }

  const chunks = splitHtmlChunks(htmlString);

  const processor = (html) => {
    let result = html;
    if (cssOptions.varyPadding && cssOptions.paddingVariation > 0) {
      const paddingRegex =
        /style=["'][^"']*?padding(-(?:top|right|bottom|left))?\s*:\s*(\d+)(px|pt|rem|em);[^"']*?["']/gi;
      result = result.replace(paddingRegex, (match, direction, size, unit) => {
        const variation = Math.ceil(
          Math.random() * cssOptions.paddingVariation
        );
        const changeDirection = Math.random() > 0.5 ? 1 : -1;
        const newSize = Math.max(
          0,
          parseInt(size) + changeDirection * variation
        );
        return match.replace(`${size}${unit}`, `${newSize}${unit}`);
      });
    }

    if (cssOptions.varyMargin && cssOptions.marginVariation > 0) {
      const marginRegex =
        /style=["'][^"']*?margin(-(?:top|right|bottom|left))?\s*:\s*(\d+)(px|pt|rem|em);[^"']*?["']/gi;
      result = result.replace(marginRegex, (match, direction, size, unit) => {
        const variation = Math.ceil(Math.random() * cssOptions.marginVariation);
        const changeDirection = Math.random() > 0.5 ? 1 : -1;
        const newSize = Math.max(
          0,
          parseInt(size) + changeDirection * variation
        );
        return match.replace(`${size}${unit}`, `${newSize}${unit}`);
      });
    }

    if (cssOptions.varyBorderRadius && cssOptions.borderRadiusVariation > 0) {
      const borderRadiusRegex =
        /style=["'][^"']*?border-radius\s*:\s*(\d+)(px|pt|rem|em);[^"']*?["']/gi;
      result = result.replace(borderRadiusRegex, (match, size, unit) => {
        const variation = Math.ceil(
          Math.random() * cssOptions.borderRadiusVariation
        );
        const changeDirection = Math.random() > 0.5 ? 1 : -1;
        const newSize = Math.max(
          0,
          parseInt(size) + changeDirection * variation
        );
        return match.replace(`${size}${unit}`, `${newSize}${unit}`);
      });
    }
    return result;
  };

  return processHtmlChunks(chunks, processor);
};

// Randomize the order of CSS properties in inline style attributes
export const randomizeInlineStyleOrder = (htmlString) => {
  return htmlString.replace(
    /style=(["'])(.*?)\1/gi,
    (match, quote, styleContent) => {
      // Split style properties, shuffle, and rejoin
      const props = styleContent
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean);
      for (let i = props.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [props[i], props[j]] = [props[j], props[i]];
      }
      return `style=${quote}${props.join("; ")}${
        props.length ? ";" : ""
      }${quote}`;
    }
  );
};

// Randomize the order of HTML attributes in tags
export const randomizeAttributeOrder = (htmlString) => {
  return htmlString.replace(
    /<([a-zA-Z0-9]+)\s+([^>]+)>/g,
    (match, tag, attrs) => {
      // Split attributes, shuffle, and rejoin
      const attrArray = attrs.match(
        /([^\s=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?)/g
      );
      if (!attrArray) return match;
      for (let i = attrArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [attrArray[i], attrArray[j]] = [attrArray[j], attrArray[i]];
      }
      return `<${tag} ${attrArray.join(" ")}>`;
    }
  );
};

// Helper to randomize class names in both <style> tags and HTML content
export const randomizeClassNames = (htmlString) => {
  // 1. Extract <style>...</style> blocks
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let styleBlocks = [];
  let match;
  while ((match = styleRegex.exec(htmlString)) !== null) {
    styleBlocks.push({
      start: match.index,
      end: styleRegex.lastIndex,
      css: match[1],
    });
  }

  // 2. Extract all class names from CSS and HTML
  const classSet = new Set();

  // From CSS
  styleBlocks.forEach(({ css }) => {
    // Match .className, .className:hover, etc.
    const cssClassRegex = /\.([a-zA-Z0-9_-]+)[\s\.\:\,\{\[]/g;
    let cssMatch;
    while ((cssMatch = cssClassRegex.exec(css)) !== null) {
      classSet.add(cssMatch[1]);
    }
  });

  // From HTML
  const htmlClassRegex = /class=["']([^"']+)["']/gi;
  let htmlMatch;
  while ((htmlMatch = htmlClassRegex.exec(htmlString)) !== null) {
    htmlMatch[1].split(/\s+/).forEach((cls) => {
      if (cls) classSet.add(cls);
    });
  }

  // 3. Generate a mapping from original class names to randomized names
  const classMap = {};
  let counter = 0;
  classSet.forEach((cls) => {
    classMap[cls] = `cls_${Math.random()
      .toString(36)
      .substr(2, 5)}_${counter++}`;
  });

  // 4. Replace class names in CSS
  let newHtml = htmlString.replace(styleRegex, (full, cssContent) => {
    let newCss = cssContent;
    Object.entries(classMap).forEach(([orig, rand]) => {
      // Replace .className, .className:hover, etc.
      newCss = newCss.replace(
        new RegExp(`\\.${orig}(?![a-zA-Z0-9_-])`, "g"),
        `.${rand}`
      );
    });
    return full.replace(cssContent, newCss);
  });

  // 5. Replace class names in HTML
  newHtml = newHtml.replace(htmlClassRegex, (full, classList) => {
    const newClassList = classList
      .split(/\s+/)
      .map((cls) => classMap[cls] || cls)
      .join(" ");
    return `class="${newClassList}"`;
  });

  return newHtml;
};
