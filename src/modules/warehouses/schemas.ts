import { z } from "zod";

export const warehouseSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, { message: "Informe o código." })
    .max(20, { message: "Máximo de 20 caracteres." }),
  name: z
    .string()
    .trim()
    .min(1, { message: "Informe o nome." })
    .max(200, { message: "Máximo de 200 caracteres." }),
  location: z
    .string()
    .trim()
    .max(300, { message: "Máximo de 300 caracteres." })
    .transform((value) => (value === "" ? undefined : value))
    .optional(),
  isDefault: z.boolean(),
});

export type WarehouseInput = z.infer<typeof warehouseSchema>;

export const warehouseListQuerySchema = z.object({
  q: z.string().trim().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  sort: z.enum(["name", "code"]).default("name"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export type WarehouseListQuery = z.infer<typeof warehouseListQuerySchema>;
