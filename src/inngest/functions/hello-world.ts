import { inngestClient } from "@/inngest/client";
import { INNGEST } from "@/inngest/keys";

export const helloWorld = inngestClient.createFunction(
  {
    id: INNGEST.TEST.HELLO_WORLD.FUNCTION,
  },
  {
    event: INNGEST.TEST.HELLO_WORLD.EVENT,
  },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");

    return {
      message: `Hello ${event.data.name}!`,
    };
  },
);
