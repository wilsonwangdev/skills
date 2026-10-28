import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { i18nLoader } from "@astrojs/starlight/loaders";
import { docsSchema, i18nSchema } from "@astrojs/starlight/schema";
import { contentPatterns, prepareSource } from "../site/content.ts";

export const collections = {
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
  docs: defineCollection({
    loader: glob({
      base: ".",
      pattern: contentPatterns,
      generateId: ({ entry, data }) => prepareSource(entry, data),
    }),
    schema: docsSchema(),
  }),
};
