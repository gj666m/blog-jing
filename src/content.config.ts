import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()),
    category: z.string(),
    coverImage: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const life = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/life' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()),
    type: z.enum(['essay', 'photo', 'travel']),
    images: z.array(z.string()).optional(),
    location: z.string().optional(),
  }),
});

const bookshelf = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/bookshelf' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()),
    type: z.enum(['book', 'tool', 'resource']),
    rating: z.number().min(1).max(5).optional(),
    link: z.string().optional(),
  }),
});

export const collections = { blog, life, bookshelf };
