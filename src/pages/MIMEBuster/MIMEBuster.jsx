import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, Save, RefreshCw, Eye } from "lucide-react";
import styles from "./MIMEBuster.module.css";

// Import components
import AttachmentSelector from "./components/AttachmentSelector";
import TacticsSelector from "./components/TacticsSelector";
import ProgressOverlay from "./components/ProgressOverlay";

// Import utilities
import { CHARACTER_ENCODINGS } from "./utils/constants";
import { initializeWorker } from "./utils/encodingWorker";
import {
  calculateComplexityScore,
  generateMimeStructure,
} from "./utils/mimeGenerator";

// At the top of the file, add this import
import { toast as reactToast } from "react-toastify";

// Add these imports at the top
// Remove these lines
// import { Provider } from "react-redux";
// import { store } from "./store/store";

// Keep these imports
import { useDispatch, useSelector } from "react-redux";
import {
  startGeneration,
  updateProgress,
  completeGeneration,
  setError,
} from "@/app/store/mimeSlice"; // Update the import path

function MIMEBuster() {
  // Add this line to initialize dispatch
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      htmlInput: "",
      blockSize: 64000,
      useNestedBoundaries: false, // ✅ Set to false by default
      useCustomEncoding: false, // ✅ Set to false by default
      usePolymorphic: false, // ✅ Set to false by default
      useUnicodeObfuscation: false, // ✅ Set to false by default
      useFakeHeaders: false, // ✅ Set to false by default
      characterEncoding: "UTF-8",
      headerFields: [{ name: "X-Custom-Header", value: "Custom-Value" }],
    },
  });

  const { toast } = useToast();
  const [selectedAttachments, setSelectedAttachments] = useState([]);
  const [outputMime, setOutputMime] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState("");
  const [generationSteps, setGenerationSteps] = useState([]);
  const [previewHtml, setPreviewHtml] = useState("");
  const [showPreviewPopup, setShowPreviewPopup] = useState(false);
  const [complexityScore, setComplexityScore] = useState(0);
  const [savedConfigs, setSavedConfigs] = useState([]);
  const [cachedOutputs, setCachedOutputs] = useState({});
  const [worker, setWorker] = useState(null);

  const formValues = watch();

  // Initialize Web Worker
  useEffect(() => {
    const newWorker = initializeWorker();
    setWorker(newWorker);

    return () => {
      if (newWorker) {
        newWorker.terminate();
      }
    };
  }, []);

  // Load saved configurations from localStorage
  useEffect(() => {
    const savedConfigsJson = localStorage.getItem("mimeBusterConfigs");
    if (savedConfigsJson) {
      try {
        setSavedConfigs(JSON.parse(savedConfigsJson));
      } catch (e) {
        console.error("Error loading saved configurations:", e);
      }
    }
  }, []);

  // Update complexity score when form values change
  useEffect(() => {
    const score = calculateComplexityScore(formValues, selectedAttachments);
    setComplexityScore(score);
  }, [formValues, selectedAttachments]);

  // In the onSubmit function
  const onSubmit = async (data) => {
    try {
      // 🔍 DEBUG: Log the form data to see what's actually selected
      console.log("=== FORM SUBMISSION DEBUG ===");
      console.log("Form data received:", data);
      console.log("Selected tactics:", {
        useNestedBoundaries: data.useNestedBoundaries,
        useCustomEncoding: data.useCustomEncoding,
        usePolymorphic: data.usePolymorphic,
        useUnicodeObfuscation: data.useUnicodeObfuscation,
        useFakeHeaders: data.useFakeHeaders,
      });
      console.log("Selected attachments:", selectedAttachments);
      console.log("==============================");

      setIsGenerating(true);
      setOutputMime("");

      // Check if we have a cached result
      const cacheKey = JSON.stringify({
        data,
        selectedAttachments,
      });

      if (cachedOutputs[cacheKey]) {
        setOutputMime(cachedOutputs[cacheKey]);
        setPreviewHtml(data.htmlInput);
        toast({
          title: "Success",
          description: "MIME structure retrieved from cache!",
        });
        reactToast.success("MIME structure retrieved from cache!");
        setIsGenerating(false);
        return;
      }

      // Track generation steps based on selected tactics - ONLY include selected tactics
      const steps = [];
      steps.push("Initializing generation...");

      // 🔍 DEBUG: Log each tactic check
      console.log("=== STEP GENERATION DEBUG ===");
      if (data.useNestedBoundaries) {
        console.log("✅ Adding: Creating nested boundaries");
        steps.push("Creating nested boundaries");
      } else {
        console.log("❌ Skipping: Creating nested boundaries");
      }

      if (data.useCustomEncoding) {
        console.log("✅ Adding: Applying custom encoding");
        steps.push("Applying custom encoding");
      } else {
        console.log("❌ Skipping: Applying custom encoding");
      }

      if (data.usePolymorphic) {
        console.log("✅ Adding: Generating polymorphic content");
        steps.push("Generating polymorphic content");
      } else {
        console.log("❌ Skipping: Generating polymorphic content");
      }

      if (data.useUnicodeObfuscation) {
        console.log("✅ Adding: Applying Unicode obfuscation");
        steps.push("Applying Unicode obfuscation");
      } else {
        console.log("❌ Skipping: Applying Unicode obfuscation");
      }

      if (data.useFakeHeaders) {
        console.log("✅ Adding: Adding fake headers");
        steps.push("Adding fake headers");
      } else {
        console.log("❌ Skipping: Adding fake headers");
      }

      if (selectedAttachments.length > 0) {
        console.log("✅ Adding: Creating fake attachments");
        steps.push("Creating fake attachments");
      } else {
        console.log("❌ Skipping: Creating fake attachments");
      }

      // Add finalization step
      steps.push("Finalizing MIME structure");

      console.log("Final steps array:", steps);
      console.log("==============================");

      // Set steps in local state and Redux - FIXED: Dispatch first, then set local state
      setGenerationSteps(steps);
      dispatch(startGeneration(steps)); // This should trigger the popup

      console.log("🚀 Dispatched startGeneration with steps:", steps);

      const mimeOutput = await generateMimeStructure(
        data,
        selectedAttachments,
        worker,
        (step) => {
          console.log("📊 Progress callback called with step:", step);
          dispatch(updateProgress(step));
        }
      );

      setOutputMime(mimeOutput);
      setPreviewHtml(data.htmlInput);

      // Cache the result
      setCachedOutputs((prev) => ({
        ...prev,
        [cacheKey]: mimeOutput,
      }));

      toast({
        title: "Success",
        description: "MIME structure generated successfully!",
      });
      reactToast.success("MIME structure generated successfully!");
      dispatch(completeGeneration());
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      reactToast.error(`Error: ${error.message}`);
      dispatch(setError(error.message));
    } finally {
      setIsGenerating(false);
      setGenerationProgress("");
    }
  };

  // Update the other handler functions to add react-toastify notifications
  const handleCopyToClipboard = () => {
    navigator.clipboard
      .writeText(outputMime)
      .then(() => {
        toast({
          title: "Copied!",
          description: "MIME structure copied to clipboard",
        });
        reactToast.success("MIME structure copied to clipboard");
      })
      .catch((err) => {
        toast({
          title: "Copy failed",
          description: err.message,
          variant: "destructive",
        });
        reactToast.error(`Copy failed: ${err.message}`);
      });
  };

  const handleResetForm = () => {
    reset();
    setSelectedAttachments([]);
    setOutputMime("");
    setPreviewHtml("");
    setShowPreview(false);
    reactToast.info("Form has been reset");
  };

  const handleSaveConfig = () => {
    const configName = prompt("Enter configuration name:");
    if (!configName) return;

    const configToSave = {
      id: Date.now(), // Add unique ID
      name: configName,
      data: watch(),
      attachments: selectedAttachments,
      timestamp: new Date().toISOString(),
    };

    const updatedConfigs = [...savedConfigs, configToSave];
    setSavedConfigs(updatedConfigs);
    localStorage.setItem("mimeBusterConfigs", JSON.stringify(updatedConfigs));
    reactToast.success(`Configuration "${configName}" saved successfully`);
  };

  const handleLoadConfig = (config) => {
    if (!config) return;

    reset(config.data);
    setSelectedAttachments(config.attachments || []);
    reactToast.info(`Configuration "${config.name}" loaded`);
  };

  const addHeaderField = () => {
    const currentFields = formValues.headerFields || [];
    setValue("headerFields", [...currentFields, { name: "", value: "" }]);
  };

  const removeHeaderField = (index) => {
    const currentFields = formValues.headerFields || [];
    setValue(
      "headerFields",
      currentFields.filter((_, i) => i !== index)
    );
  };

  const getScoreColor = () => {
    if (complexityScore < 30) return styles.scoreGreen;
    if (complexityScore < 60) return styles.scoreYellow;
    return styles.scoreRed;
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Advanced MIME Buster</h1>

      <div className={styles.complexityMeter}>
        <div className={styles.complexityLabel}>Complexity Score:</div>
        <div>
          <div className={`${styles.complexityScore} ${getScoreColor()}`}>
            {complexityScore}
          </div>
          <div className={styles.complexityBar}>
            <div
              className={styles.complexityFill}
              style={{
                width: `${complexityScore}%`,
                backgroundColor:
                  complexityScore < 30
                    ? "#4ade80"
                    : complexityScore < 60
                    ? "#facc15"
                    : "#f87171",
              }}
            ></div>
          </div>
        </div>
      </div>

      <div className={styles.actionsBar}>
        <Button
          variant="outline"
          className={styles.actionButton}
          onClick={handleResetForm}
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Reset Form
        </Button>

        {savedConfigs.length > 0 && (
          <Select
            onValueChange={(value) =>
              handleLoadConfig(
                savedConfigs.find((c) => c.id.toString() === value)
              )
            }
          >
            <SelectTrigger className={styles.configSelect}>
              <SelectValue placeholder="Load configuration..." />
            </SelectTrigger>
            <SelectContent>
              {savedConfigs.map((config) => (
                <SelectItem key={config.id} value={config.id.toString()}>
                  {config.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button
          variant="outline"
          className={styles.actionButton}
          onClick={handleSaveConfig} // This is now correct - no event parameter
        >
          <Save className="mr-2 h-4 w-4" /> Save Config
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formColumn}>
            <div className={styles.section}>
              <Label className={styles.label}>
                Enter Plain HTML Email Template
              </Label>
              <Textarea
                className={`${styles.textarea} ${
                  errors.htmlInput ? styles.inputError : ""
                }`}
                {...register("htmlInput", {
                  required: "HTML content is required",
                })}
                placeholder="<html><body><h1>Your Email Content</h1><p>This is a sample email.</p></body></html>"
              />
              {errors.htmlInput && (
                <div className={styles.errorMessage}>
                  {errors.htmlInput.message}
                </div>
              )}
            </div>
            <div className={styles.flexContainer}>
              <div className={`${styles.section} ${styles.flexItem}`}>
                <Label className={styles.label}>
                  Repetitive Block Size (1000–1,000,000)
                </Label>
                <Input
                  type="number"
                  className={styles.input}
                  {...register("blockSize", {
                    valueAsNumber: true,
                    min: { value: 1000, message: "Minimum size is 1000" },
                    max: {
                      value: 1000000,
                      message: "Maximum size is 1,000,000",
                    },
                  })}
                  placeholder="64000"
                />
                {errors.blockSize && (
                  <div className={styles.errorMessage}>
                    {errors.blockSize.message}
                  </div>
                )}
              </div>

              <div className={`${styles.section} ${styles.flexItem}`}>
                <Label className={styles.label}>Character Encoding</Label>
                <Select
                  defaultValue="UTF-8"
                  onValueChange={(value) =>
                    setValue("characterEncoding", value)
                  }
                >
                  <SelectTrigger className={styles.select}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTF-8">UTF-8 (Unicode)</SelectItem>
                    <SelectItem value="ISO-8859-1">
                      ISO-8859-1 (Latin-1)
                    </SelectItem>
                    <SelectItem value="US-ASCII">US-ASCII</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Use the TacticsSelector component */}
            <TacticsSelector control={control} />
          </div>

          <div className={styles.formColumn}>
            {/* Use the AttachmentSelector component */}
            <AttachmentSelector
              selectedAttachments={selectedAttachments}
              onAttachmentChange={setSelectedAttachments}
            />

            {watch("useFakeHeaders") && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <Label className={styles.label}>Custom Header Fields</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addHeaderField}
                    className={styles.addButton}
                  >
                    Add Field
                  </Button>
                </div>

                {formValues.headerFields?.map((field, index) => (
                  <div key={index} className={styles.headerField}>
                    <Input
                      placeholder="Header name"
                      className={styles.headerName}
                      value={field.name}
                      onChange={(e) => {
                        const updatedFields = [...formValues.headerFields];
                        updatedFields[index].name = e.target.value;
                        setValue("headerFields", updatedFields);
                      }}
                    />
                    <Input
                      placeholder="Header value"
                      className={styles.headerValue}
                      value={field.value}
                      onChange={(e) => {
                        const updatedFields = [...formValues.headerFields];
                        updatedFields[index].value = e.target.value;
                        setValue("headerFields", updatedFields);
                      }}
                    />
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeHeaderField(index)}
                        className={styles.removeButton}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className={styles.buttonGroup}>
          <Button
            type="submit"
            className={styles.button}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {generationProgress || "Generating..."}
              </>
            ) : (
              "Generate MIME Structure"
            )}
          </Button>

          {outputMime && (
            <>
              <Button
                type="button"
                variant="outline"
                className={styles.button}
                onClick={() => setShowPreviewPopup(true)}
              >
                <Eye className="mr-2 h-4 w-4" />
                Show Preview
              </Button>
            </>
          )}
        </div>
        {showPreviewPopup && previewHtml && (
          <div className={styles.section}>
            <Label className={styles.label}>Email Preview</Label>
            <div className={styles.previewContainer}>
              <iframe
                srcDoc={previewHtml}
                title="Email Preview"
                className={styles.previewFrame}
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        )}
        {outputMime && (
          <div className={styles.section}>
            <Label className={styles.label}>MIME Output</Label>
            <Textarea
              className={`${styles.textarea} ${styles.outputTextarea}`}
              value={outputMime}
              readOnly
            />
          </div>
        )}
        {/* Preview Popup Modal */}
        {showPreviewPopup && previewHtml && (
          <div className={styles.previewModal}>
            <div className={styles.previewModalContent}>
              <div className={styles.previewModalHeader}>
                <Label className={styles.label}>Email Preview</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreviewPopup(false)}
                  className={styles.closeButton}
                >
                  ×
                </Button>
              </div>
              <div className={styles.previewContainer}>
                <iframe
                  srcDoc={previewHtml}
                  title="Email Preview"
                  className={styles.previewFrame}
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          </div>
        )}

        {/* Use the ProgressOverlay component */}
        <ProgressOverlay
          isGenerating={isGenerating}
          generationProgress={generationProgress}
          generationSteps={generationSteps}
        />
      </form>
    </div>
  );
}

// Export the component directly, not the wrapper
export default MIMEBuster;
