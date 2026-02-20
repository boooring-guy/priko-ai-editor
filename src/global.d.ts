// Explicit declaration to ensure the IDE's TypeScript language server
// recognizes global CSS files, even if the Next.js TypeScript plugin
// is temporarily out of sync.
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}
