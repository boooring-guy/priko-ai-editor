import FireCrawl from "@mendable/firecrawl-js";
import { envs } from "../envs";
export const firecrawl = new FireCrawl({
  apiKey: envs.FIRECRAWL_API_KEY,
});
