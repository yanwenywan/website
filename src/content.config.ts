import { z, defineCollection } from "astro:content";

export const collections = {
    "dagengren-chapters": defineCollection({
        schema: z.object({})  // as no frontmatter
    })
}