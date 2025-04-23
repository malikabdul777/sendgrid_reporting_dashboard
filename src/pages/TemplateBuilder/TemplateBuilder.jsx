import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { IoCopyOutline } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";
import { IoAddOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import he from "he";

import styles from "./TemplateBuilder.module.css";

const EmailHeadersForm = () => {
  const [headers, setHeaders] = useState(() => {
    const savedHeaders = localStorage.getItem("emailHeaders");
    return savedHeaders
      ? JSON.parse(savedHeaders)
      : {
          Date: "{{dh}}",
          To: `"{{03}} {{04}}" <{{01}}>`,
          From: `"Support" <support@{{hd}}>`,
          "Message-ID": "<{{m0}}{{02}}.{{tm}}.{{qd}}@{{hd}}>",
          Subject:
            "{{03}} {{04}}, {[Simple and fast loans tailored to your needs.|Quick financial assistance when you need it most.|Get up to $1,000 with an easy online application.|Borrow confidently with fast approval times.|Apply now and secure the cash you need today.|Hassle-free loans available in just a few minutes.|Flexible loan options - designed for you.|Get a decision fast and cash even faster.|Reliable loans up to $1,000 with minimal effort.|Don't stress - fast loans are just a click away.]}",
          References: "<{{m0}}{{02}}.{{tm}}.{{qd}}@{{hd}}>",
          Precedence: "bulk",
          "List-Unsubscribe":
            "<https://e.{{hd}}/{{hu}}/mmm/{{N9}}/{{r0}}{{N1}}/{{y5}}{{N8}}/>,<mailto:unsubscribe+{{hu}}+{{02}}@{{hd}}>",
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          "MIME-Version": "1.0",
          "Content-Type": 'text/html; charset="UTF-8"',
        };
  });

  const [emailTemplate, setEmailTemplate] = useState("");
  const [combinedTemplate, setCombinedTemplate] = useState("");
  const [newHeaderKey, setNewHeaderKey] = useState("");
  const [newHeaderValue, setNewHeaderValue] = useState("");

  // State for non-ASCII character identification and replacement
  const [foundSpecialCharacters, setFoundSpecialCharacters] = useState([]); // Array of { char: string, name: string }
  const [showRemovedCharactersModal, setShowRemovedCharactersModal] =
    useState(false); // Toggle modal for removed characters
  const [replacementChars, setReplacementChars] = useState({});

  // New state variables
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectLines, setSubjectLines] = useState("");

  useEffect(() => {
    localStorage.setItem("emailHeaders", JSON.stringify(headers));
  }, [headers]);

  const handleHeaderChange = (header, value) => {
    setHeaders((prevHeaders) => ({
      ...prevHeaders,
      [header]: value,
    }));
  };

  const handleAddHeader = () => {
    if (newHeaderKey && newHeaderValue) {
      setHeaders((prevHeaders) => ({
        ...prevHeaders,
        [newHeaderKey]: newHeaderValue,
      }));
      setNewHeaderKey("");
      setNewHeaderValue("");
      toast.success("Header added successfully!", {
        position: "bottom-center",
      });
    } else {
      toast.error("Please provide both key and value for the new header.", {
        position: "bottom-center",
      });
    }
  };

  const handleDeleteHeader = (header) => {
    setHeaders((prevHeaders) => {
      const updatedHeaders = { ...prevHeaders };
      delete updatedHeaders[header];
      return updatedHeaders;
    });
    toast.info("Header deleted successfully!", {
      position: "bottom-center",
    });
  };

  const handleCreateTemplate = () => {
    const headersString = Object.entries(headers)
      .map(([header, value]) => `${header}: ${value}`)
      .join("\n");

    const combined = `${headersString}\n\n${emailTemplate}`;
    setCombinedTemplate(combined);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard
      .writeText(combinedTemplate)
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

  const handleClearTemplate = () => {
    setCombinedTemplate("");
    toast.info("Template cleared!", {
      position: "bottom-center",
    });
  };

  const getHtmlEntitySuggestion = (char) => {
    // Characters that should have empty suggestions
    const emptyReplacementChars = [
      "\u200A", // Hair Space (HSP)
      "\u200B", // Zero Width Space (ZWSP)
      "\u200C", // Zero Width Non-Joiner
      "\u200D", // Zero Width Joiner
      "\uFEFF", // Zero Width No-Break Space
    ];

    // Return empty string for specified characters
    if (emptyReplacementChars.includes(char)) {
      return "";
    }

    // Common named entities mapping
    const commonEntities = {
      "©": "&copy;",
      "®": "&reg;",
      "™": "&trade;",
      "€": "&euro;",
      "£": "&pound;",
      "¥": "&yen;",
      "°": "&deg;",
      "±": "&plusmn;",
      "¼": "&frac14;",
      "½": "&frac12;",
      "¾": "&frac34;",
      "×": "&times;",
      "÷": "&divide;",
      "•": "&bull;",
      "…": "&hellip;",
      "′": "&prime;",
      "″": "&Prime;",
      "«": "&laquo;",
      "»": "&raquo;",
      "¶": "&para;",
      "§": "&sect;",
      "†": "&dagger;",
      "‡": "&Dagger;",
      "‰": "&permil;",
    };

    // Return named entity if available
    if (commonEntities[char]) {
      return commonEntities[char];
    }

    // For other characters, return numeric entity
    return `&#${char.codePointAt(0)};`;
  };

  const handleIdentifySpecialCharacters = () => {
    const specialCharacters = [
      { char: "\u200A", name: "Hair Space (HSP)" },
      { char: "\u200B", name: "Zero Width Space (ZWSP)" },
      { char: "\u200C", name: "Zero Width Non-Joiner" },
      { char: "\u200D", name: "Zero Width Joiner" },
      { char: "\uFEFF", name: "Zero Width No-Break Space" },
      { char: "\u00A9", name: "Copyright Symbol" },
      { char: "\u00AE", name: "Registered Trademark" },
      { char: "\u2122", name: "Trademark Symbol" },
      { char: "\u00A0", name: "Non-breaking Space" },
      { char: "\u2013", name: "En Dash" },
      { char: "\u2014", name: "Em Dash" },
      { char: "\u2018", name: "Left Single Quote" },
      { char: "\u2019", name: "Right Single Quote" },
      { char: "\u201C", name: "Left Double Quote" },
      { char: "\u201D", name: "Right Double Quote" },
      { char: "\u2026", name: "Ellipsis" },
    ];

    const foundCharacters = [];
    let updatedTemplate = combinedTemplate;

    // Check for predefined special characters
    specialCharacters.forEach(({ char, name }) => {
      if (updatedTemplate.includes(char)) {
        foundCharacters.push({ char, name });
      }
    });

    // Improved check for emojis and other special characters
    for (let i = 0; i < updatedTemplate.length; i++) {
      const code = updatedTemplate.codePointAt(i);

      // Skip if not a special character
      if (code <= 127) continue;

      // Get the actual character (handles surrogate pairs for emojis)
      const char = String.fromCodePoint(code);

      // Skip if already found
      if (foundCharacters.some((found) => found.char === char)) continue;

      // Check for emojis
      if (
        (code >= 0x1f300 && code <= 0x1f9ff) || // Miscellaneous Symbols and Pictographs
        (code >= 0x2600 && code <= 0x26ff) || // Miscellaneous Symbols
        (code >= 0x2700 && code <= 0x27bf) || // Dingbats
        (code >= 0xfe00 && code <= 0xfe0f) || // Variation Selectors
        (code >= 0x1f000 && code <= 0x1f9ff) // Supplemental Symbols and Pictographs
      ) {
        foundCharacters.push({
          char,
          name: `Emoji/Symbol (U+${code.toString(16).toUpperCase()})`,
        });
      } else if (code > 127) {
        foundCharacters.push({
          char,
          name: `8-bit Character (U+${code.toString(16).toUpperCase()})`,
        });
      }

      // Skip the low surrogate if this was a surrogate pair
      if (code > 0xffff) {
        i++;
      }
    }

    if (foundCharacters.length > 0) {
      foundCharacters.sort(
        (a, b) => a.char.codePointAt(0) - b.char.codePointAt(0)
      );

      // Initialize replacement suggestions
      const initialReplacements = {};
      foundCharacters.forEach(({ char }) => {
        initialReplacements[char] = getHtmlEntitySuggestion(char);
      });

      setReplacementChars(initialReplacements);
      setFoundSpecialCharacters(foundCharacters);
      setShowRemovedCharactersModal(true);
    } else {
      toast.info("No special characters found.", {
        position: "bottom-center",
      });
    }
  };

  const handleReplaceCharacters = () => {
    let updatedTemplate = combinedTemplate;
    Object.entries(replacementChars).forEach(([originalChar, replacement]) => {
      if (replacement !== "") {
        const regex = new RegExp(originalChar, "g");
        updatedTemplate = updatedTemplate.replace(regex, replacement);
      }
    });
    setCombinedTemplate(updatedTemplate);
    setShowRemovedCharactersModal(false);
    setReplacementChars({});
    toast.success("Characters replaced successfully!", {
      position: "bottom-center",
    });
  };

  // New function to handle the subject lines
  const handleSubjectLines = () => {
    const lines = subjectLines
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");

    if (lines.length > 0) {
      const formattedSubject = `{{03}} {{04}}, {[${lines.join("|")}]}`;
      setHeaders((prevHeaders) => ({
        ...prevHeaders,
        Subject: formattedSubject,
      }));
      setShowSubjectModal(false);
      setSubjectLines("");
      toast.success("Subject lines updated successfully!", {
        position: "bottom-center",
      });
    } else {
      toast.error("Please add at least one subject line", {
        position: "bottom-center",
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className="space-y-4">
          <div className={styles.header}>
            <h3 className={styles.subHeading}>Robomailer Template Builder</h3>
          </div>
          {Object.entries(headers).map(([header, value]) => (
            <div key={header} className="flex items-center space-x-4">
              <Label htmlFor={header} className="w-1/3">
                {header}
              </Label>
              <div className="flex w-2/3 space-x-2">
                <Input
                  id={header}
                  value={value}
                  onChange={(e) => handleHeaderChange(header, e.target.value)}
                  className="w-full"
                />
                {header === "Subject" && (
                  <Button
                    onClick={() => setShowSubjectModal(true)}
                    className="p-2"
                    variant="outline"
                    title="Add Multiple Subject Lines"
                  >
                    <IoAddOutline className="w-5 h-5" />
                  </Button>
                )}
              </div>
              <div className={styles.deleteButtonContainer}>
                <MdDeleteForever
                  onClick={() => handleDeleteHeader(header)}
                  className="text-red-500"
                  size={20}
                />
              </div>
            </div>
          ))}
          <div className="flex items-center space-x-4">
            <Input
              placeholder="New Header Key"
              value={newHeaderKey}
              onChange={(e) => setNewHeaderKey(e.target.value)}
              className="w-1/3"
            />
            <Input
              placeholder="New Header Value"
              value={newHeaderValue}
              onChange={(e) => setNewHeaderValue(e.target.value)}
              className="w-1/3"
            />
            <Button onClick={handleAddHeader}>Add Header</Button>
          </div>
          <div className="space-y-2 pt-10">
            <Label htmlFor="email-template" className="block pb-3">
              HTML Email Template
            </Label>
            <Textarea
              id="email-template"
              placeholder="Paste your HTML email template here..."
              className="w-full h-60"
              value={emailTemplate}
              onChange={(e) => setEmailTemplate(e.target.value)}
            />
          </div>
          <Button className="w-600" onClick={handleCreateTemplate}>
            Create Template
          </Button>
          {combinedTemplate && (
            <div className="space-y-2 pt-10 relative">
              <Label htmlFor="combined-template" className="block pb-3">
                Combined Template
              </Label>
              <div className="relative">
                <Textarea
                  id="combined-template"
                  value={combinedTemplate}
                  onChange={(e) => setCombinedTemplate(e.target.value)}
                  className={`w-full ${styles.tallTextarea}`}
                />
                <button
                  onClick={handleCopyToClipboard}
                  className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow-md hover:bg-gray-100 transition-colors"
                  aria-label="Copy to clipboard"
                >
                  <IoCopyOutline className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={handleClearTemplate}
                  className="absolute top-12 right-2 p-2 bg-white rounded-lg shadow-md hover:bg-gray-100 transition-colors"
                  aria-label="Clear template"
                >
                  <MdDeleteForever className="w-5 h-5 text-red-600" />
                </button>
              </div>
              {/* Button to identify special characters */}
              <Button onClick={handleIdentifySpecialCharacters}>
                Identify 8-bit Characters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modal to show removed special characters */}
      {showRemovedCharactersModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Special Characters Found</h3>
            <div className={styles.modalHeader}>
              <span>Character</span>
              <span>Description</span>
              <span>Unicode</span>
              <span>Replace With</span>
            </div>
            <ul className={styles.modalList}>
              {foundSpecialCharacters.map(({ char, name }, index) => (
                <li key={index} className={styles.modalListItem}>
                  <span className={styles.modalChar}>
                    <span
                      style={{
                        fontFamily:
                          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      }}
                    >
                      {char}
                    </span>
                  </span>
                  <span className={styles.modalName}>{name}</span>
                  <span className={styles.modalCode}>
                    U+
                    {char
                      .codePointAt(0)
                      .toString(16)
                      .toUpperCase()
                      .padStart(4, "0")}
                  </span>
                  <div className="flex flex-col gap-1">
                    <Input
                      className={styles.modalInput}
                      value={replacementChars[char] || ""}
                      onChange={(e) =>
                        setReplacementChars((prev) => ({
                          ...prev,
                          [char]: e.target.value,
                        }))
                      }
                      placeholder="Replace with..."
                    />
                    {replacementChars[char] && (
                      <div className="text-xs text-gray-500">
                        Preview:{" "}
                        {replacementChars[char].startsWith("&") ? (
                          <span
                            dangerouslySetInnerHTML={{
                              __html: replacementChars[char],
                            }}
                          />
                        ) : (
                          replacementChars[char]
                        )}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className={styles.modalButtons}>
              <Button onClick={handleReplaceCharacters} variant="default">
                Apply Replacements
              </Button>
              <Button
                onClick={() => {
                  setShowRemovedCharactersModal(false);
                  setReplacementChars({});
                }}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* New modal */}
      {showSubjectModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Add Multiple Subject Lines</h3>
            <p className="text-sm text-gray-600 mb-4">
              Add one subject line per line. These will be formatted
              automatically.
            </p>
            <Textarea
              value={subjectLines}
              onChange={(e) => setSubjectLines(e.target.value)}
              placeholder="Enter subject lines here...&#10;One per line...&#10;Like this..."
              className="min-h-[200px] mb-4"
            />
            <div className={styles.modalButtons}>
              <Button onClick={handleSubjectLines} variant="default">
                Apply Subject Lines
              </Button>
              <Button
                onClick={() => {
                  setShowSubjectModal(false);
                  setSubjectLines("");
                }}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailHeadersForm;
