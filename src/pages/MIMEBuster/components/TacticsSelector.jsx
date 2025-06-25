import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import styles from "../MIMEBuster.module.css";
import { TACTIC_DESCRIPTIONS } from "../utils/constants";
import { Controller } from "react-hook-form";

function TacticsSelector({ control }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <Label className={styles.label}>MIME-Busting Tactics</Label>
      </div>
      <div className={styles.checkboxGroup}>
        {Object.entries(TACTIC_DESCRIPTIONS).map(([key, description]) => (
          <div key={key} className={styles.checkboxItem}>
            <div className="flex items-center space-x-2">
              <Controller
                name={key}
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id={key}
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor={key} className={styles.checkboxLabel}>
                {key
                  .replace(/^use/, "")
                  .replace(/([A-Z])/g, " $1")
                  .trim()}
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TacticsSelector;
