import { Loader2 } from "lucide-react";
import styles from "../MIMEBuster.module.css";
import { useSelector } from "react-redux";

function ProgressOverlay() {
  // Get state from Redux
  const { isGenerating, currentStep, steps, completedSteps } = useSelector(
    (state) => {
      console.log("🔍 ProgressOverlay Redux state:", state.mime);
      return state.mime;
    }
  );

  console.log("🎭 ProgressOverlay render:", {
    isGenerating,
    currentStep,
    steps,
    completedSteps,
  });

  if (!isGenerating) {
    console.log("❌ ProgressOverlay not showing - isGenerating is false");
    return null;
  }

  console.log("✅ ProgressOverlay showing!");

  return (
    <div className={styles.progressOverlay}>
      <div className={styles.progressCard}>
        <div className={styles.spinnerContainer}>
          <Loader2 className={styles.spinner} />
        </div>
        <h3 className={styles.progressTitle}>Generating MIME Structure</h3>
        <p className={styles.progressText}>
          {currentStep || "Starting worker operations..."}
        </p>
        <div className={styles.progressSteps}>
          {steps.map((step, index) => (
            <div
              key={index}
              className={`${styles.progressStep} ${
                currentStep === step ? styles.activeStep : ""
              } ${
                completedSteps.includes(step) && currentStep !== step
                  ? styles.completedStep
                  : ""
              }`}
            >
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProgressOverlay;
