import { z, defineCollection } from "astro:content";

export const collections = {
    "dagengren-chapters": defineCollection({
        schema: z.object({
            pubDate: z.date(),
            chapter: z.string()
        })  
    }),
    "baoyu-chapters": defineCollection({
        schema: z.object({})
    }),
    "fengshen-chapters": defineCollection({
        schema: z.object({
            title: z.string(),
            displayTitle: z.string(),
            seal: z.boolean(),
            footerLine1: z.string(),
            footerLine2: z.string()
        })
    }),
    "shiji-chapters": defineCollection({
        schema: z.object({
            title: z.string(),
            displayTitle: z.string(),
            seal: z.boolean(),
            footerLine1: z.string(),
            footerLine2: z.string()
        })
    })
}