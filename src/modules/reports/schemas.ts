import { z } from "zod";

export const stockReportQuerySchema = z.object({
  warehouseId: z.string().trim().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  belowMinOnly: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  sort: z.enum(["name", "quantity"]).default("name"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export type StockReportQuery = z.infer<typeof stockReportQuerySchema>;
