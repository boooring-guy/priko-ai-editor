"use client";

import {
  Code2,
  Columns3,
  Loader2,
  Monitor,
  Palette,
  RotateCcw,
  Save,
  SplitSquareVertical,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useSetAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import defaultConfig from "@/config.json";
import { updateUserConfig } from "@/modules/config/server/config-actions";
import { userConfigAtom } from "@/modules/config/store/config-atoms";
import type { PartialAppConfig } from "@/modules/config/types";

// ─── Types ──────────────────────────────────────────────────────

type Config = typeof defaultConfig;

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Current resolved config from the Jotai atom */
  currentConfig: Config;
}

// ─── Deep clone ─────────────────────────────────────────────────

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// ─── Setting Row ────────────────────────────────────────────────

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-3">
      <div className="space-y-0.5 min-w-0">
        <Label className="text-sm font-medium">{label}</Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SettingSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground pb-1">
        <Icon className="size-3.5" />
        {title}
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────

/** Compute partial diff between current and defaults (only changed paths). */
function computeOverrides(
  current: Record<string, unknown>,
  defaults: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const key of Object.keys(current)) {
    const curVal = current[key];
    const defVal = defaults[key];

    if (
      curVal &&
      typeof curVal === "object" &&
      !Array.isArray(curVal) &&
      defVal &&
      typeof defVal === "object" &&
      !Array.isArray(defVal)
    ) {
      const nested = computeOverrides(
        curVal as Record<string, unknown>,
        defVal as Record<string, unknown>,
      );
      if (Object.keys(nested).length > 0) {
        result[key] = nested;
      }
    } else if (curVal !== defVal) {
      result[key] = curVal;
    }
  }

  return result;
}

// ─── Main Component ─────────────────────────────────────────────

export function SettingsSheet({
  open,
  onOpenChange,
  currentConfig,
}: SettingsSheetProps) {
  // Local draft of the config — edits are staged here until Save
  const [draft, setDraft] = useState<Config>(() => deepClone(currentConfig));
  const [isSaving, setIsSaving] = useState(false);
  const setGlobalConfig = useSetAtom(userConfigAtom);

  // Sync draft when sheet opens with fresh config
  useEffect(() => {
    if (open) {
      setDraft(deepClone(currentConfig));
    }
  }, [open, currentConfig]);

  // ─── Local updater helpers ─────
  const updateDraft = useCallback((updater: (prev: Config) => Config) => {
    setDraft((prev) => updater(prev));
  }, []);

  const ed = draft.app.editor;
  const theme = draft.app.theme;
  const layout = ed.layout;

  // ─── Save ───────────────────────
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const overrides = computeOverrides(
        draft as unknown as Record<string, unknown>,
        defaultConfig as unknown as Record<string, unknown>,
      );
      await updateUserConfig(overrides as PartialAppConfig);
      // Push to Jotai so all consumers re-render immediately
      setGlobalConfig(deepClone(draft));
      toast.success("Settings saved");
      onOpenChange(false);
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  }, [draft, setGlobalConfig, onOpenChange]);

  // ─── Reset ──────────────────────
  const handleReset = useCallback(() => {
    setDraft(deepClone(defaultConfig as Config));
  }, []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="sm:max-w-lg w-full flex flex-col p-0 gap-0"
        showCloseButton
      >
        <SheetHeader className="p-6 pb-2">
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Customize your editor, theme, and workspace.
          </SheetDescription>
        </SheetHeader>

        <Tabs
          defaultValue="editor"
          orientation="horizontal"
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-6">
            <TabsList className="w-full">
              <TabsTrigger value="editor" className="flex-1 gap-1.5">
                <Code2 className="size-3.5" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="theme" className="flex-1 gap-1.5">
                <Palette className="size-3.5" />
                Theme
              </TabsTrigger>
              <TabsTrigger value="layout" className="flex-1 gap-1.5">
                <Columns3 className="size-3.5" />
                Layout
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-6 pt-4">
            {/* ─── Editor Tab ──────────────────────── */}
            <TabsContent value="editor" className="space-y-6 mt-0">
              <SettingSection title="Autosave" icon={Save}>
                <SettingRow
                  label="Enable Autosave"
                  description="Automatically save files at regular intervals"
                >
                  <Switch
                    checked={ed.autosave.enabled}
                    onCheckedChange={(v) =>
                      updateDraft((d) => {
                        d.app.editor.autosave.enabled = v;
                        return { ...d };
                      })
                    }
                  />
                </SettingRow>

                <SettingRow
                  label="Autosave Interval"
                  description={`Save every ${(ed.autosave.intervalMs / 1000).toFixed(0)}s`}
                >
                  <div className="w-32">
                    <Slider
                      min={1000}
                      max={30000}
                      step={1000}
                      value={[ed.autosave.intervalMs]}
                      onValueChange={([v]) =>
                        updateDraft((d) => {
                          d.app.editor.autosave.intervalMs = v;
                          return { ...d };
                        })
                      }
                      disabled={!ed.autosave.enabled}
                    />
                  </div>
                </SettingRow>

                <SettingRow
                  label="Save on Focus Loss"
                  description="Save when you switch away from the editor"
                >
                  <Switch
                    checked={ed.autosave.onFocusLoss}
                    onCheckedChange={(v) =>
                      updateDraft((d) => {
                        d.app.editor.autosave.onFocusLoss = v;
                        return { ...d };
                      })
                    }
                    disabled={!ed.autosave.enabled}
                  />
                </SettingRow>
              </SettingSection>

              <Separator />

              <SettingSection title="Code" icon={Code2}>
                <SettingRow
                  label="Format on Save"
                  description="Automatically format files when saving"
                >
                  <Switch
                    checked={ed.formatOnSave.enabled}
                    onCheckedChange={(v) =>
                      updateDraft((d) => {
                        d.app.editor.formatOnSave.enabled = v;
                        return { ...d };
                      })
                    }
                  />
                </SettingRow>

                <SettingRow
                  label="Minimap"
                  description="Show a minimap of the code on the side"
                >
                  <Switch
                    checked={ed.minimap.enabled}
                    onCheckedChange={(v) =>
                      updateDraft((d) => {
                        d.app.editor.minimap.enabled = v;
                        return { ...d };
                      })
                    }
                  />
                </SettingRow>

                <SettingRow
                  label="File Breadcrumb"
                  description="Show file path breadcrumb above the editor"
                >
                  <Switch
                    checked={ed.fileBreadcrumb.enabled}
                    onCheckedChange={(v) =>
                      updateDraft((d) => {
                        d.app.editor.fileBreadcrumb.enabled = v;
                        return { ...d };
                      })
                    }
                  />
                </SettingRow>
              </SettingSection>

              <Separator />

              <SettingSection
                title="Indentation Markers"
                icon={SplitSquareVertical}
              >
                <SettingRow
                  label="Show Markers"
                  description="Render indentation guide lines"
                >
                  <Switch
                    checked={ed.indentationMarkers.enabled}
                    onCheckedChange={(v) =>
                      updateDraft((d) => {
                        d.app.editor.indentationMarkers.enabled = v;
                        return { ...d };
                      })
                    }
                  />
                </SettingRow>

                <SettingRow
                  label="Highlight Active Block"
                  description="Emphasise the current indentation scope"
                >
                  <Switch
                    checked={ed.indentationMarkers.highlightActiveBlock}
                    onCheckedChange={(v) =>
                      updateDraft((d) => {
                        d.app.editor.indentationMarkers.highlightActiveBlock =
                          v;
                        return { ...d };
                      })
                    }
                    disabled={!ed.indentationMarkers.enabled}
                  />
                </SettingRow>

                <SettingRow
                  label="Hide First Indent"
                  description="Hide the marker on the first level of indentation"
                >
                  <Switch
                    checked={ed.indentationMarkers.hideFirstIndent}
                    onCheckedChange={(v) =>
                      updateDraft((d) => {
                        d.app.editor.indentationMarkers.hideFirstIndent = v;
                        return { ...d };
                      })
                    }
                    disabled={!ed.indentationMarkers.enabled}
                  />
                </SettingRow>

                <SettingRow
                  label="Marker Type"
                  description="Style of the indent guide"
                >
                  <Select
                    value={ed.indentationMarkers.markerType}
                    onValueChange={(v) =>
                      updateDraft((d) => {
                        d.app.editor.indentationMarkers.markerType = v;
                        return { ...d };
                      })
                    }
                    disabled={!ed.indentationMarkers.enabled}
                  >
                    <SelectTrigger className="w-32" size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fullScope">Full Scope</SelectItem>
                      <SelectItem value="codeOnly">Code Only</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>

                <SettingRow
                  label="Thickness"
                  description={`${ed.indentationMarkers.thickness}px`}
                >
                  <div className="w-24">
                    <Slider
                      min={1}
                      max={4}
                      step={1}
                      value={[ed.indentationMarkers.thickness]}
                      onValueChange={([v]) =>
                        updateDraft((d) => {
                          d.app.editor.indentationMarkers.thickness = v;
                          return { ...d };
                        })
                      }
                      disabled={!ed.indentationMarkers.enabled}
                    />
                  </div>
                </SettingRow>
              </SettingSection>
            </TabsContent>

            {/* ─── Theme Tab ──────────────────────── */}
            <TabsContent value="theme" className="space-y-6 mt-0">
              <SettingSection title="Appearance" icon={Palette}>
                <SettingRow
                  label="Default Theme"
                  description="Choose the colour scheme for the editor"
                >
                  <Select
                    value={theme.default}
                    onValueChange={(v) =>
                      updateDraft((d) => {
                        d.app.theme.default = v;
                        return { ...d };
                      })
                    }
                  >
                    <SelectTrigger className="w-40" size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {defaultConfig.app.theme.options.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          <span className="flex items-center gap-2">
                            <span
                              className={`size-2 rounded-full ${
                                t.appearance === "dark"
                                  ? "bg-zinc-700"
                                  : "bg-amber-300"
                              }`}
                            />
                            {t.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </SettingRow>
              </SettingSection>
            </TabsContent>

            {/* ─── Layout Tab ─────────────────────── */}
            <TabsContent value="layout" className="space-y-6 mt-0">
              <SettingSection title="Pane Sizes" icon={Columns3}>
                <SettingRow
                  label="Left Pane"
                  description={`Default width: ${layout.leftPane.defaultSize}%`}
                >
                  <div className="w-32">
                    <Slider
                      min={10}
                      max={40}
                      step={1}
                      value={[layout.leftPane.defaultSize]}
                      onValueChange={([v]) =>
                        updateDraft((d) => {
                          d.app.editor.layout.leftPane.defaultSize = v;
                          return { ...d };
                        })
                      }
                    />
                  </div>
                </SettingRow>

                <SettingRow
                  label="Center Pane"
                  description={`Default width: ${layout.centerPane.defaultSize}%`}
                >
                  <div className="w-32">
                    <Slider
                      min={30}
                      max={80}
                      step={1}
                      value={[layout.centerPane.defaultSize]}
                      onValueChange={([v]) =>
                        updateDraft((d) => {
                          d.app.editor.layout.centerPane.defaultSize = v;
                          return { ...d };
                        })
                      }
                    />
                  </div>
                </SettingRow>

                <SettingRow
                  label="Right Pane"
                  description={`Default width: ${layout.rightPane.defaultSize}%`}
                >
                  <div className="w-32">
                    <Slider
                      min={10}
                      max={40}
                      step={1}
                      value={[layout.rightPane.defaultSize]}
                      onValueChange={([v]) =>
                        updateDraft((d) => {
                          d.app.editor.layout.rightPane.defaultSize = v;
                          return { ...d };
                        })
                      }
                    />
                  </div>
                </SettingRow>
              </SettingSection>

              <Separator />

              <SettingSection title="Center Split" icon={Monitor}>
                <SettingRow
                  label="Terminal Height"
                  description={`Default: ${layout.centerSplit.terminal.defaultSize}%`}
                >
                  <div className="w-32">
                    <Slider
                      min={10}
                      max={60}
                      step={1}
                      value={[layout.centerSplit.terminal.defaultSize]}
                      onValueChange={([v]) =>
                        updateDraft((d) => {
                          d.app.editor.layout.centerSplit.terminal.defaultSize =
                            v;
                          return { ...d };
                        })
                      }
                    />
                  </div>
                </SettingRow>
              </SettingSection>
            </TabsContent>
          </div>
        </Tabs>

        <SheetFooter className="p-6 pt-4 border-t flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isSaving}
            className="gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            Reset Defaults
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-1.5"
          >
            {isSaving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            Save
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
