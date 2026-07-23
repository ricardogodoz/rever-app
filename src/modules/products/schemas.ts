import { z } from "zod";

export const PRODUCT_TYPES = ["MATERIAL", "FINISHED"] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  MATERIAL: "Material",
  FINISHED: "Produto final",
};

export const UNITS_OF_MEASURE = [
  "UNIT",
  "KG",
  "G",
  "M",
  "CM",
  "L",
  "ML",
  "PACKAGE",
  "ROLL",
] as const;
export type UnitOfMeasure = (typeof UNITS_OF_MEASURE)[number];

export const UNIT_OF_MEASURE_LABELS: Record<UnitOfMeasure, string> = {
  UNIT: "Unidade",
  KG: "Quilograma",
  G: "Grama",
  M: "Metro",
  CM: "Centímetro",
  L: "Litro",
  ML: "Mililitro",
  PACKAGE: "Pacote",
  ROLL: "Rolo",
};

function optionalDecimalString(maxDecimals: number, message: string) {
  const pattern = new RegExp(`^\\d+(\\.\\d{1,${maxDecimals}})?$`);
  return z
    .string()
    .trim()
    .transform((value) => (value === "" ? undefined : value))
    .optional()
    .refine((value) => value === undefined || pattern.test(value), {
      message,
    });
}

function optionalText(maxLength: number) {
  return z
    .string()
    .trim()
    .max(maxLength, { message: `Máximo de ${maxLength} caracteres.` })
    .transform((value) => (value === "" ? undefined : value))
    .optional();
}

export const productSchema = z.object({
  sku: z
    .string()
    .trim()
    .min(1, { message: "Informe o SKU." })
    .max(50, { message: "Máximo de 50 caracteres." }),
  name: z
    .string()
    .trim()
    .min(1, { message: "Informe o nome." })
    .max(200, { message: "Máximo de 200 caracteres." }),
  type: z.enum(PRODUCT_TYPES, { message: "Selecione o tipo." }),
  unit: z.enum(UNITS_OF_MEASURE, { message: "Selecione a unidade." }),
  description: optionalText(1000),
  barcode: optionalText(100),
  unitCost: optionalDecimalString(2, "Custo inválido. Use até 2 casas decimais."),
  defaultPrice: optionalDecimalString(
    2,
    "Preço inválido. Use até 2 casas decimais.",
  ),
  minStock: optionalDecimalString(
    3,
    "Estoque mínimo inválido. Use até 3 casas decimais.",
  ),
  imageUrl: z
    .string()
    .trim()
    .max(500, { message: "Máximo de 500 caracteres." })
    .transform((value) => (value === "" ? undefined : value))
    .optional()
    .refine((value) => value === undefined || z.url().safeParse(value).success, {
      message: "Informe uma URL válida.",
    }),
  notes: optionalText(1000),
});

export type ProductInput = z.infer<typeof productSchema>;

export const productListQuerySchema = z.object({
  q: z.string().trim().optional(),
  type: z.enum(PRODUCT_TYPES).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  sort: z.enum(["name", "sku", "type"]).default("name"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;
