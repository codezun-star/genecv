import { z } from "zod";

import { SECTION_IDS } from "@/lib/cv/types";
import type { CvData } from "@/lib/cv/types";

/**
 * Validación del CV que llega a la API.
 *
 * El contenido es del propio usuario, así que no hay nada que "autorizar" aquí,
 * pero sí hay que acotarlo: el endpoint es público (solo protegido por el
 * transaction_id) y sin límites alguien podría mandar megabytes de texto o una
 * foto enorme y hacer trabajar al servidor gratis. Los topes son holgados para
 * un CV real y estrictos frente a un abuso.
 */

const SHORT = 200;
const MEDIUM = 500;
const LONG = 3000;

/** ~1,4 MB en base64 ≈ 1 MB de imagen. El editor ya la reescala a 400 px. */
const MAX_PHOTO_CHARS = 1_400_000;

const shortText = z.string().max(SHORT).default("");
const mediumText = z.string().max(MEDIUM).default("");

const photoSchema = z
  .string()
  .max(MAX_PHOTO_CHARS)
  // Solo data URLs de imagen: nada de http(s), que convertiría al servidor en
  // un proxy de descargas arbitrarias al renderizar el PDF.
  .regex(/^data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+$/)
  .nullable()
  .default(null);

const monthSchema = z
  .string()
  .max(7)
  // "2021-09", o una mitad a medio elegir ("2021-" / "-09").
  .regex(/^(\d{4})?-?(\d{2})?$/)
  .default("");

const experienceSchema = z.object({
  id: z.string().max(64),
  position: shortText,
  company: shortText,
  location: shortText,
  startDate: monthSchema,
  endDate: monthSchema,
  current: z.boolean().default(false),
  achievements: z.array(z.string().max(MEDIUM)).max(20).default([]),
});

const educationSchema = z.object({
  id: z.string().max(64),
  degree: shortText,
  institution: shortText,
  location: shortText,
  startDate: monthSchema,
  endDate: monthSchema,
  current: z.boolean().default(false),
  description: mediumText,
});

const skillSchema = z.object({
  id: z.string().max(64),
  name: shortText,
  level: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
});

const languageSchema = z.object({
  id: z.string().max(64),
  name: shortText,
  level: z.enum(["A1", "A2", "B1", "B2", "C1", "C2", "nativo"]),
});

export const cvPayloadSchema = z.object({
  version: z.number().int().default(1),
  region: z.enum(["europa", "latam", "anglo"]),
  templateId: z.string().max(64),
  industry: z.string().max(64).default("general"),
  accentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#234D68"),
  personal: z.object({
    firstName: shortText,
    lastName: shortText,
    headline: shortText,
    email: shortText,
    phone: shortText,
    city: shortText,
    country: shortText,
    website: shortText,
    linkedin: shortText,
    photo: photoSchema,
    showPhoto: z.boolean().default(false),
    summary: z.string().max(LONG).default(""),
    birthDate: shortText,
    nationality: shortText,
    drivingLicense: shortText,
  }),
  experience: z.array(experienceSchema).max(30).default([]),
  education: z.array(educationSchema).max(30).default([]),
  skills: z.array(skillSchema).max(60).default([]),
  languages: z.array(languageSchema).max(20).default([]),
  sectionOrder: z.array(z.enum(SECTION_IDS as [string, ...string[]])).max(10),
  updatedAt: z.string().max(40).default(""),
});

export type CvPayload = z.infer<typeof cvPayloadSchema>;

export const generateRequestSchema = z.object({
  transactionId: z.string().min(1).max(128),
  templateId: z.string().min(1).max(64),
  cv: cvPayloadSchema,
});

/** El schema ya garantiza la forma; el cast documenta la equivalencia. */
export function toCvData(payload: CvPayload): CvData {
  return payload as unknown as CvData;
}
