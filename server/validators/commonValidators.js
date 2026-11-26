import { z } from 'zod';
const empty=z.object({}).passthrough();
export const emptyRequestSchema=z.object({body:empty,params:empty,query:empty});
