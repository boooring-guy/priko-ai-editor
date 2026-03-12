import type { Extension } from "@codemirror/state";
import { quickEditField } from "./state";
import { quickEditPromptWidgetField } from "./prompt-widget";
import { quickEditDiffWidgetField } from "./diff-widget";
import { quickEditKeymap } from "./keybindings";
import { quickEditSelectionObserver } from "./selection-observer";
import { inlineChatTheme, injectInlineChatAnimations } from "../inline-chat/theme";

export function quickEdit(): Extension {
  injectInlineChatAnimations();

  return [
    quickEditField,
    quickEditPromptWidgetField,
    quickEditDiffWidgetField,
    quickEditKeymap,
    quickEditSelectionObserver,
    inlineChatTheme,
  ];
}
