import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { toast } from "sonner";
import { closeAllTabsAtom } from "@/modules/files/store/file-atoms";

/**
 * Global keyboard shortcuts for managing editor tabs.
 *
 * - `Cmd/Ctrl + K` followed by `W`: Closes all open tabs.
 */
export function useGlobalTabShortcuts() {
  const closeAllTabs = useSetAtom(closeAllTabsAtom);

  useEffect(() => {
    let kPressed = false;
    let timer: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Mac uses metaKey (Cmd), Windows/Linux uses ctrlKey
      const isMod = e.metaKey || e.ctrlKey;
      if (!isMod) return;

      if (e.key.toLowerCase() === "k") {
        kPressed = true;
        clearTimeout(timer);
        // Reset the chord sequence after 1.5 seconds if W isn't pressed
        timer = setTimeout(() => {
          kPressed = false;
        }, 1500);
        return; // don't preventDefault on Cmd+K yet to allow native browser behaviors if W isn't pressed
      }

      if (e.key.toLowerCase() === "w" && kPressed) {
        e.preventDefault();
        closeAllTabs();
        kPressed = false;
        toast.info("All tabs closed");
      } else {
        // If any other key is pressed with modifier, reset
        kPressed = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [closeAllTabs]);
}
