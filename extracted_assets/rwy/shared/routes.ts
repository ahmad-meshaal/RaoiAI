import { z } from 'zod';
import { insertNovelSchema, insertCharacterSchema, insertChapterSchema, novels, characters, chapters } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  novels: {
    list: {
      method: 'GET' as const,
      path: '/api/novels' as const,
      responses: {
        200: z.array(z.custom<typeof novels.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/novels/:id' as const,
      responses: {
        200: z.custom<typeof novels.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/novels' as const,
      input: insertNovelSchema,
      responses: {
        201: z.custom<typeof novels.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/novels/:id' as const,
      input: insertNovelSchema.partial(),
      responses: {
        200: z.custom<typeof novels.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/novels/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  characters: {
    list: {
      method: 'GET' as const,
      path: '/api/novels/:novelId/characters' as const,
      responses: {
        200: z.array(z.custom<typeof characters.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/novels/:novelId/characters' as const,
      input: insertCharacterSchema.omit({ novelId: true }),
      responses: {
        201: z.custom<typeof characters.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/characters/:id' as const,
      input: insertCharacterSchema.partial().omit({ novelId: true }),
      responses: {
        200: z.custom<typeof characters.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/characters/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  chapters: {
    list: {
      method: 'GET' as const,
      path: '/api/novels/:novelId/chapters' as const,
      responses: {
        200: z.array(z.custom<typeof chapters.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/novels/:novelId/chapters' as const,
      input: insertChapterSchema.omit({ novelId: true }),
      responses: {
        201: z.custom<typeof chapters.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/chapters/:id' as const,
      responses: {
        200: z.custom<typeof chapters.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/chapters/:id' as const,
      input: insertChapterSchema.partial().omit({ novelId: true }),
      responses: {
        200: z.custom<typeof chapters.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/chapters/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  ai: {
    generatePlot: {
      method: 'POST' as const,
      path: '/api/ai/generate-plot' as const,
      input: z.object({
        genre: z.string(),
        theme: z.string().optional(),
      }),
      responses: {
        200: z.object({
          plot: z.string(),
          characters: z.array(z.object({
            name: z.string(),
            role: z.string(),
            description: z.string(),
          })),
          chapters: z.array(z.object({
            title: z.string(),
            outline: z.string(),
            sequence: z.number(),
          })),
        }),
      },
    },
    generateChapter: {
      method: 'POST' as const,
      path: '/api/ai/generate-chapter' as const,
      input: z.object({
        novelId: z.number(),
        chapterTitle: z.string(),
        outline: z.string().optional(),
        previousChapterContent: z.string().optional(),
      }),
      responses: {
        200: z.object({
          content: z.string(),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
