import { z } from "zod";

// ? add vendor package schema
export const addVendorPackageSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  price: z.number().min(0),
  addOns: z.array(z.object({ name: z.string(), price: z.number() })).optional(),
  features: z.array(z.string()).optional(),
  addOns: z
    .array(
      z.object({
        name: z.string().min(1, "Add-on name is required"),
        price: z.coerce.number().min(0, "Add-on price must be positive"),
        description: z.string().optional(),
      }),
    )
    .optional(),
  description: z.string().min(1),
  coverPhoto: z.string().min(1, "Cover photo required"),
  photos: z.array(z.string()).optional(),
  videos: z.array(z.string()).optional(),
  weddingTypes: z
    .array(z.enum(["south-asian", "asian", "arab", "english", "turkish"]))
    .optional(),
});

// ? Separate schema for add-on validation when adding add-ons to existing packages
export const addAddOnSchema = z.object({
  name: z.string().min(1, "Add-on name is required"),
  price: z.coerce.number().min(0, "Add-on price must be positive"),
  description: z.string().optional(),
});

// ? Separate schema for validating add-on updates (partial updates allowed)
export const updateAddOnSchema = z
  .object({
    name: z.string().min(1).optional(),
    price: z.coerce.number().min(0).optional(),
    description: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });
