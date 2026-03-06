import { showMinimap } from "@replit/codemirror-minimap";

const createMinimap = () => {
  const dom = document.createElement("div");
  return { dom };
};

export const minimapExtension = showMinimap.compute([], () => {
  return {
    create: createMinimap,
  };
});
