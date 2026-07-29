"use client";

import { useId } from "react";

import { cn } from "@/lib/utils";

type BaseProps = {
  label: string;
  hint?: string;
  className?: string;
};

export function TextField({
  label,
  hint,
  className,
  ...props
}: BaseProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();

  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input id={id} className="field" {...props} />
      {hint && <p className="text-ink-muted mt-1 text-xs">{hint}</p>}
    </div>
  );
}

export function TextAreaField({
  label,
  hint,
  className,
  rows = 4,
  ...props
}: BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();

  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <textarea id={id} rows={rows} className="field resize-y" {...props} />
      {hint && <p className="text-ink-muted mt-1 text-xs">{hint}</p>}
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

/** <input type="month"> — stores "YYYY-MM", which is what the view formats. */
export function MonthField({
  label,
  hint,
  className,
  ...props
}: BaseProps & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <TextField
      type="month"
      label={label}
      hint={hint}
      className={className}
      {...props}
    />
  );
}

export function Checkbox({
  label,
  className,
  ...props
}: { label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <input
        id={id}
        type="checkbox"
        className="accent-primary size-4 cursor-pointer rounded"
        {...props}
      />
      <label
        htmlFor={id}
        className="text-ink-soft cursor-pointer text-sm select-none"
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
