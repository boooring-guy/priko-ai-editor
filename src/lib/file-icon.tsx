/**
 * Thin wrappers around @react-symbols/icons so they conform to the
 * TreeDataItem icon interface ({ className?: string }).
 *
 * Each wrapper renders the SVG inside a <span className={className}> so
 * Tailwind utilities like `mr-2` (added by TreeIcon) are applied correctly.
 */

import {
  getIconForFile,
  getIconForFolder,
  DefaultFolderOpenedIcon,
} from "@react-symbols/icons/utils";
import React from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse className for w-N / h-N Tailwind sizes and return px values. */
function sizeFromClassName(className?: string): {
  width: number;
  height: number;
} {
  const match = className?.match(/[wh]-(\d+)/);
  const px = match ? parseInt(match[1], 10) * 4 : 16;
  return { width: px, height: px };
}

// ─── File icon ────────────────────────────────────────────────────────────────

/** Dynamic file icon matched by file name / extension. */
export function makeFileIcon(
  fileName: string,
): React.ComponentType<{ className?: string }> {
  return function FileIconWrapper({ className }: { className?: string }) {
    const { width, height } = sizeFromClassName(className);
    return (
      <span
        className={className}
        style={{ display: "inline-flex", flexShrink: 0 }}
      >
        {getIconForFile({ fileName, autoAssign: true, width, height })}
      </span>
    );
  };
}

// ─── Folder icons ─────────────────────────────────────────────────────────────

/** Dynamic folder icon (closed) matched by folder name. */
export function makeFolderIcon(
  folderName: string,
): React.ComponentType<{ className?: string }> {
  return function FolderIconWrapper({ className }: { className?: string }) {
    const { width, height } = sizeFromClassName(className);
    return (
      <span
        className={className}
        style={{ display: "inline-flex", flexShrink: 0 }}
      >
        {getIconForFolder({ folderName, width, height })}
      </span>
    );
  };
}

/** Folder-open icon. */
export function makeFolderOpenIcon(
  _folderName: string,
): React.ComponentType<{ className?: string }> {
  return function FolderOpenIconWrapper({ className }: { className?: string }) {
    const { width, height } = sizeFromClassName(className);
    return (
      <span
        className={className}
        style={{ display: "inline-flex", flexShrink: 0 }}
      >
        <DefaultFolderOpenedIcon width={width} height={height} />
      </span>
    );
  };
}
