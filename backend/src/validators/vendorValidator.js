import { z } from "zod";

export const vendorSchema = z.object({
  vendorType: z.enum(["individual", "company"]),
  description: z
    .string()
    .min(200, "Description cannot be less than 200 characters"),
  phone: z.string().regex(/^\+?[0-9]{7,15}$/, "Invalid phone number"),
  address: z.string(),
  coverageTime: z.string(),
  coverageAreas: z
    .array(z.string())
    .min(1, "At least one coverage area required"),
  basedIn: z.string(),
  deliveryTime: z.string(),
  servicesOffered: z.array(z.string()).min(1),
  teamSize: z.number().min(1),
  yearsOfExperience: z.number().min(0),
  categories: z.array(z.string()).min(1),
  website: z.string().url().optional(),
  socialMediaLinks: z.array(z.string().url()).optional(),
  bio: z.string().optional(),
  // logo is required but it's a file upload before it get's uploaded on cloudinary, so I've handled it separately in the controller
  coverPhoto: z.string().optional(),
  photos: z
    .array(z.string())
    .max(15, "Cannot upload more than 15 photos")
    .optional(),
  videos: z
    .array(z.string())
    .max(5, "Cannot upload more than 5 videos")
    .optional(),
});
