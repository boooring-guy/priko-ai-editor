const createInngestKey = <Domain extends string, Name extends string>(
  domain: Domain,
  name: Name,
) => ({
  EVENT: `${domain}/${name}` as const,
  FUNCTION: `${domain}-${name}` as const,
});

export const INNGEST = {
  TEST: {
    HELLO_WORLD: createInngestKey("test", "hello.world"),
    DEMO_GENERATE: createInngestKey("test", "demo.generate"),
  },
} as const;
