// src/pages/dagengren/rss.xml.ts
import { getCollection } from 'astro:content';
import { SITE } from '../../data/site'; // define your site metadata here

export async function GET() {
    // 1. Load & sort all chapters
    const all = await getCollection('dagengren-chapters');
    const chapters = all.sort((a, b) => Number(b.slug) - Number(a.slug));

    // 2. Build <item> entries
    const items = await Promise.all(chapters.map(async (entry) => {
        const { slug, data } = entry;
        const { Content, headings } = await entry.render();
        // Title from first H1, e.g. "134. Title Title" → "Title Title"
        const raw = headings[0]?.text ?? slug;
        const title = raw.includes('. ') ? raw.split('. ').slice(1).join('. ') : raw;
        // You could extract a date from frontmatter if available; else use now()
        // @ts-ignore
        const pubDate = (data.pubDate ?? new Date()).toUTCString();
        // …inside your .map over chapters…
        const link = `${SITE.origin}/dagengren/story/${slug}`
        const guidLink =
            Number(slug) <= 482
                ? `${link}.html`    // keep “.html” for chapters 1–482
                : link;             // no “.html” for newer ones

        return `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <description>Chapter ${slug}</description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="true">${guidLink}</guid>
    </item>`
    }));

    // 3. Assemble RSS
    const rss = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0">
  <channel>
    <title>${SITE.title}</title>
    <link>${SITE.origin}/dagengren/</link>
    <description>${SITE.description}</description>
    ${items.join('\n')}
  </channel>
</rss>`;

    return new Response(rss.trim(), {
        status: 200,
        headers: { 'Content-Type': 'application/rss+xml' },
    });
}
