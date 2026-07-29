"use client";

import { useRef, useState } from "react";

import { useCv } from "@/components/editor/use-cv";
import {
  FieldGroup,
  TextAreaField,
  TextField,
  Toggle,
} from "@/components/editor/fields";
import { PhrasePicker } from "@/components/editor/phrase-picker";
import { Button } from "@/components/ui/button";

/** Photos live in localStorage, so keep them small. */
const MAX_PHOTO_BYTES = 700 * 1024;
const PHOTO_MAX_EDGE = 400;

export function PersonalStep() {
  const { cv, region, updatePersonal } = useCv();
  const p = cv.personal;
  const fileInput = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const photoDisabled = region.photo === "discouraged";

  async function handlePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoError(null);

    if (!file.type.startsWith("image/")) {
      setPhotoError("El archivo debe ser una imagen.");
      return;
    }

    try {
      const dataUrl = await resizeImage(file, PHOTO_MAX_EDGE);
      if (dataUrl.length > MAX_PHOTO_BYTES) {
        setPhotoError(
          "La imagen sigue siendo muy pesada. Prueba con una foto más pequeña.",
        );
        return;
      }
      updatePersonal({ photo: dataUrl, showPhoto: true });
    } catch {
      setPhotoError("No se pudo procesar la imagen.");
    } finally {
      // Allow re-selecting the same file.
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-8">
      <FieldGroup title="Datos personales">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Nombre"
            value={p.firstName}
            autoComplete="given-name"
            onChange={(e) => updatePersonal({ firstName: e.target.value })}
            placeholder="María"
          />
          <TextField
            label="Apellidos"
            value={p.lastName}
            autoComplete="family-name"
            onChange={(e) => updatePersonal({ lastName: e.target.value })}
            placeholder="García López"
          />
        </div>

        <TextField
          label="Puesto o titular profesional"
          value={p.headline}
          onChange={(e) => updatePersonal({ headline: e.target.value })}
          placeholder="Desarrolladora Frontend"
          hint="Usa las mismas palabras que la oferta a la que te postulas."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Correo electrónico"
            type="email"
            value={p.email}
            autoComplete="email"
            onChange={(e) => updatePersonal({ email: e.target.value })}
            placeholder="maria@email.com"
          />
          <TextField
            label="Teléfono"
            type="tel"
            value={p.phone}
            autoComplete="tel"
            onChange={(e) => updatePersonal({ phone: e.target.value })}
            placeholder="+34 600 000 000"
          />
          <TextField
            label="Ciudad"
            value={p.city}
            autoComplete="address-level2"
            onChange={(e) => updatePersonal({ city: e.target.value })}
            placeholder="Madrid"
          />
          <TextField
            label="País"
            value={p.country}
            autoComplete="country-name"
            onChange={(e) => updatePersonal({ country: e.target.value })}
            placeholder="España"
          />
          <TextField
            label="LinkedIn"
            value={p.linkedin}
            onChange={(e) => updatePersonal({ linkedin: e.target.value })}
            placeholder="linkedin.com/in/mariagarcia"
          />
          <TextField
            label="Web o portfolio"
            value={p.website}
            onChange={(e) => updatePersonal({ website: e.target.value })}
            placeholder="mariagarcia.dev"
          />
        </div>
      </FieldGroup>

      {/* Region-specific extras — hidden where the market does not expect them. */}
      {(region.personalFields.birthDate ||
        region.personalFields.nationality ||
        region.personalFields.drivingLicense) && (
        <FieldGroup
          title="Datos adicionales"
          description={`Campos que se siguen incluyendo en ${region.label}. Son opcionales.`}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {region.personalFields.birthDate && (
              <TextField
                label="Fecha de nacimiento"
                value={p.birthDate}
                onChange={(e) => updatePersonal({ birthDate: e.target.value })}
                placeholder="12/05/1994"
              />
            )}
            {region.personalFields.nationality && (
              <TextField
                label="Nacionalidad"
                value={p.nationality}
                onChange={(e) => updatePersonal({ nationality: e.target.value })}
                placeholder="Española"
              />
            )}
            {region.personalFields.drivingLicense && (
              <TextField
                label="Carnet de conducir"
                value={p.drivingLicense}
                onChange={(e) =>
                  updatePersonal({ drivingLicense: e.target.value })
                }
                placeholder="B, vehículo propio"
              />
            )}
          </div>
        </FieldGroup>
      )}

      <FieldGroup title="Fotografía">
        <Toggle
          label="Incluir foto en el CV"
          description={
            region.photo === "recommended"
              ? "En este mercado es habitual incluirla."
              : "Opcional. Inclúyela solo si la oferta lo pide."
          }
          checked={p.showPhoto}
          disabled={photoDisabled}
          disabledReason="Desactivada para el formato anglosajón: incluir foto puede provocar el descarte por política antidiscriminación."
          onChange={(value) => updatePersonal({ showPhoto: value })}
        />

        {!photoDisabled && p.showPhoto && (
          <div className="border-line bg-canvas rounded-field flex flex-wrap items-center gap-4 border p-4">
            {p.photo ? (
              // Local data URL, never a remote asset.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.photo}
                alt="Vista previa de tu fotografía"
                className="border-line size-20 rounded-full border object-cover"
              />
            ) : (
              <div className="bg-surface text-ink-muted grid size-20 place-items-center rounded-full">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="size-7"
                  aria-hidden
                >
                  <circle cx="12" cy="9" r="3.2" />
                  <path d="M5 20a7 7 0 0114 0" />
                </svg>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInput.current?.click()}
              >
                {p.photo ? "Cambiar foto" : "Subir foto"}
              </Button>
              {p.photo && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => updatePersonal({ photo: null })}
                >
                  Quitar
                </Button>
              )}
            </div>

            <p className="text-ink-muted w-full text-xs">
              La imagen se recorta a 400 px y se guarda solo en tu navegador.
              {photoError && (
                <span className="text-danger block font-medium">
                  {photoError}
                </span>
              )}
            </p>
          </div>
        )}
      </FieldGroup>

      <FieldGroup title={region.terms.summary}>
        <TextAreaField
          label="Resumen"
          rows={5}
          value={p.summary}
          onChange={(e) => updatePersonal({ summary: e.target.value })}
          placeholder="Dos o tres líneas sobre quién eres profesionalmente y qué buscas."
          hint="Entre 40 y 80 palabras es lo que mejor funciona."
        />
        <PhrasePicker
          industry={cv.industry}
          kind="summaries"
          label="Ver frases sugeridas"
          onPick={(phrase) =>
            updatePersonal({
              summary: p.summary.trim()
                ? `${p.summary.trim()} ${phrase}`
                : phrase,
            })
          }
        />
      </FieldGroup>
    </div>
  );
}

/**
 * Downscales an image on a canvas before storing it. Raw camera photos blow
 * past the localStorage quota, and the CV only ever prints it small.
 */
function resizeImage(file: File, maxEdge: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("read-failed"));
    reader.onload = () => {
      const image = new window.Image();
      image.onerror = () => reject(new Error("decode-failed"));
      image.onload = () => {
        const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
        const width = Math.round(image.width * scale);
        const height = Math.round(image.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no-canvas"));

        ctx.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      image.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
