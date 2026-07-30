"use client";

import { useId } from "react";

import { hasUnsupportedChars, tidyEditorText } from "@/lib/cv/text";
import { cn } from "@/lib/utils";

type BaseProps = {
  label: string;
  hint?: string;
  className?: string;
};

/**
 * Cleans the field when it loses focus.
 *
 * Pasting from Word, LinkedIn or a PDF drags in double spaces, non-breaking
 * spaces and trailing newlines, and people routinely forget the space after a
 * full stop. The view model fixes both before rendering, but doing it here too
 * means the stored draft stays clean and the user sees the correction instead
 * of wondering why the preview differs from the input.
 *
 * It runs on blur rather than on every keystroke so nothing fights the caret
 * while typing, and the work is a handful of regexes on a single field.
 *
 * The native value is rewritten before re-dispatching so the existing
 * `e.target.value` handlers pick up the cleaned string unchanged.
 */
function useBlurNormaliser<T extends HTMLInputElement | HTMLTextAreaElement>(
  onChange: React.ChangeEventHandler<T> | undefined,
  onBlur: React.FocusEventHandler<T> | undefined,
  multiline = false,
) {
  return (event: React.FocusEvent<T>) => {
    const raw = event.target.value;
    const cleaned = tidyEditorText(raw, multiline);

    if (cleaned !== raw) {
      event.target.value = cleaned;
      onChange?.(event as unknown as React.ChangeEvent<T>);
    }

    onBlur?.(event);
  };
}

/**
 * Warning shown under a field whose text carries characters the PDF font cannot
 * represent. It states what will happen instead of blocking the input, because
 * the character is only dropped when the CV is rendered.
 */
export function UnsupportedCharsNotice() {
  return (
    <p className="text-ink-muted mt-1 flex items-start gap-1.5 text-xs">
      <span aria-hidden="true" className="text-secondary mt-px">
        &#9432;
      </span>
      <span>
        Los emojis y símbolos especiales no se imprimen en el PDF; se quitarán al
        descargar.
      </span>
    </p>
  );
}

export function TextField({
  label,
  hint,
  className,
  onChange,
  onBlur,
  ...props
}: BaseProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const handleBlur = useBlurNormaliser(onChange, onBlur);
  const unsupported = hasUnsupportedChars(String(props.value ?? ""));

  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input
        id={id}
        className="field"
        onChange={onChange}
        onBlur={handleBlur}
        {...props}
      />
      {hint && <p className="text-ink-muted mt-1 text-xs">{hint}</p>}
      {unsupported && <UnsupportedCharsNotice />}
    </div>
  );
}

export function TextAreaField({
  label,
  hint,
  className,
  rows = 4,
  onChange,
  onBlur,
  ...props
}: BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  const handleBlur = useBlurNormaliser(onChange, onBlur, true);
  const unsupported = hasUnsupportedChars(String(props.value ?? ""));

  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        className="field resize-y"
        onChange={onChange}
        onBlur={handleBlur}
        {...props}
      />
      {hint && <p className="text-ink-muted mt-1 text-xs">{hint}</p>}
      {unsupported && <UnsupportedCharsNotice />}
    </div>
  );
}

export function SelectField({
  label,
  hint,
  className,
  children,
  ...props
}: BaseProps &
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    children: React.ReactNode;
  }) {
  const id = useId();

  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <select id={id} className="field cursor-pointer" {...props}>
        {children}
      </select>
      {hint && <p className="text-ink-muted mt-1 text-xs">{hint}</p>}
    </div>
  );
}

/**
 * Month + year as two selects instead of `<input type="month">`.
 *
 * The native control renders inconsistently across browsers (and is a numeric
 * spinner on several mobile ones), and it never shows the month by name. Two
 * selects give full month names, work identically everywhere, and are far
 * easier to operate on a phone. The stored value stays "YYYY-MM".
 */
const MONTH_NAMES = Array.from({ length: 12 }, (_, i) =>
  new Intl.DateTimeFormat("es-ES", { month: "long" }).format(
    new Date(2000, i, 1),
  ),
);

function capitalise(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function MonthField({
  label,
  hint,
  className,
  value = "",
  disabled,
  onChange,
  "aria-label": ariaLabel,
}: {
  label: string;
  hint?: string;
  className?: string;
  value?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  "aria-label"?: string;
}) {
  const monthId = useId();
  const [year = "", month = ""] = value.split("-");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 66 }, (_, i) => String(currentYear + 5 - i));

  function emit(nextYear: string, nextMonth: string) {
    // Half-filled values are stored as "2021-" or "-09" rather than dropped:
    // the two selects are filled one at a time, so discarding the incomplete
    // state would make it impossible to ever set a date. The view formats a
    // year-only value as just the year, and ignores a month without a year.
    if (!nextYear && !nextMonth) return onChange("");
    onChange(`${nextYear}-${nextMonth}`);
  }

  return (
    <div className={className}>
      <label htmlFor={monthId} className="field-label">
        {label}
      </label>
      <div className="flex gap-2">
        <select
          id={monthId}
          className="field min-w-0 flex-1 cursor-pointer"
          value={month}
          disabled={disabled}
          aria-label={ariaLabel ? `${ariaLabel} — mes` : `${label} — mes`}
          onChange={(e) => emit(year, e.target.value)}
        >
          <option value="">Mes</option>
          {MONTH_NAMES.map((name, i) => (
            <option key={name} value={String(i + 1).padStart(2, "0")}>
              {capitalise(name)}
            </option>
          ))}
        </select>
        <select
          className="field w-[5.75rem] shrink-0 cursor-pointer"
          value={year}
          disabled={disabled}
          aria-label={ariaLabel ? `${ariaLabel} — año` : `${label} — año`}
          onChange={(e) => emit(e.target.value, month)}
        >
          <option value="">Año</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
      {hint && <p className="text-ink-muted mt-1 text-xs">{hint}</p>}
    </div>
  );
}

export function Checkbox({
  label,
  className,
  ...props
}: { label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();

  // The label carries the tap area so the whole row is comfortably tappable
  // on a phone, not just the 20px box.
  return (
    <div className={cn("flex items-center", className)}>
      <input
        id={id}
        type="checkbox"
        className="accent-primary size-5 shrink-0 cursor-pointer rounded"
        {...props}
      />
      <label
        htmlFor={id}
        className="text-ink-soft flex min-h-11 cursor-pointer items-center pl-2.5 text-sm select-none"
      >
        {label}
      </label>
    </div>
  );
}

/** Pill-style on/off switch used for the photo and similar toggles. */
export function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled,
  disabledReason,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  disabledReason?: string;
}) {
  return (
    <div
      className={cn(
        "border-line bg-canvas rounded-field flex items-start justify-between gap-4 border p-4",
        disabled && "opacity-60",
      )}
    >
      <div className="min-w-0">
        <p className="text-ink text-sm font-semibold">{label}</p>
        {(disabled && disabledReason ? disabledReason : description) && (
          <p className="text-ink-muted mt-1 text-xs leading-relaxed">
            {disabled && disabledReason ? disabledReason : description}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
          checked ? "bg-primary" : "bg-secondary-200",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-[left] duration-200 ease-out",
            checked ? "left-[22px]" : "left-0.5",
          )}
        />
      </button>
    </div>
  );
}

/** Section wrapper used by every step, with an optional right-hand action. */
export function FieldGroup({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4">
          <div>
            {title && (
              <h3 className="font-display text-ink text-base font-semibold">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-ink-muted mt-1 text-sm leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
