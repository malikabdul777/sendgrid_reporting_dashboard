import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import styles from "../MIMEBuster.module.css";
import { ATTACHMENT_TYPES } from "../utils/constants";

function AttachmentSelector({ selectedAttachments, onAttachmentChange }) {
  const handleAttachmentChange = (value) => {
    if (selectedAttachments.includes(value)) {
      onAttachmentChange(selectedAttachments.filter((item) => item !== value));
    } else {
      onAttachmentChange([...selectedAttachments, value]);
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <Label className={styles.label}>Fake Attachments</Label>
      </div>
      <div className={styles.attachmentGrid}>
        {Object.entries(ATTACHMENT_TYPES).map(([type, info]) => (
          <div key={type} className={styles.attachmentItem}>
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id={`attachment-${type}`}
                checked={selectedAttachments.includes(type)}
                onCheckedChange={() => handleAttachmentChange(type)}
              />
              <Label
                htmlFor={`attachment-${type}`}
                className={styles.checkboxLabel}
              >
                {type.toUpperCase()} ({info.filename}.{info.extension})
              </Label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AttachmentSelector;
