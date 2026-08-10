import { z } from "zod";

// Schema for global search queries
export const searchSchema = z.object({
  q: z.string().min(1, "Kata kunci pencarian tidak boleh kosong").max(100),
});

// Schema for CSV row import validation
export const csvRowSchema = z.object({
  regionId: z.string().min(1, "ID Wilayah (slug) tidak boleh kosong").transform((val) => val.toLowerCase().trim()),
  year: z.coerce.number().int().min(1900).max(2100),
  value: z.coerce.number(),
});

// Schema for creating datasets
export const createDatasetSchema = z.object({
  title: z.string().min(3, "Judul dataset minimal 3 karakter").max(150),
  description: z.string().min(10, "Deskripsi minimal 10 karakter").max(1000),
  category: z.enum(["EKONOMI", "PENDIDIKAN", "KESEHATAN", "INFRASTRUKTUR", "LINGKUNGAN", "UMKM", "DEMOGRAFI"]),
  status: z.enum(["Verified", "Official", "Demo", "Archived"]).default("Demo"),
  unit: z.string().min(1, "Satuan data tidak boleh kosong").max(50),
  methodology: z.string().max(2000).optional(),
  dataSourceId: z.string().min(1, "ID Sumber data tidak boleh kosong"),
});

// Combined schema for importing dataset with points
export const importDatasetSchema = z.object({
  metadata: createDatasetSchema,
  dataPoints: z.array(csvRowSchema).min(1, "Data points tidak boleh kosong"),
});
