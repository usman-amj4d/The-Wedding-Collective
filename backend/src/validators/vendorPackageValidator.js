import { z } from "zod";

export const addVendorPackageSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  price: z.number().min(0),
  addOns: z.array(z.object({ name: z.string(), price: z.number() })).optional(),
  features: z.array(z.string()).optional(),
  description: z.string().min(1),
  coverPhoto: z.string().min(1, "Cover photo required"),
  photos: z.array(z.string()).optional(),
  videos: z.array(z.string()).optional(),
  weddingTypes: z
    .array(z.enum(["south-asian", "asian", "arab", "english", "turkish"]))
    .optional(),
});
