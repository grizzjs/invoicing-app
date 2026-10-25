import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, ChevronDown, ChevronUp, X } from "lucide-react";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Shape of a single Zod issue as surfaced by TanStack Form's errorMap.
 * Add more fields (e.g. `minimum`, `format`) if you need them in the UI.
 */
interface ZodIssue {
  message: string;
  path: (string | number)[];
  code?: string;
}

/**
 * The value of `form.store`'s `errorMap` after a failed submission.
 *
 * TanStack Form groups errors under a timing key ("onSubmit" | "onBlur" |
 * "onChange" | "onDynamic" …). Each timing key maps field-name strings to
 * arrays of ZodIssues.
 *
 * Example:
 *   {
 *     onDynamic: {
 *       "address": [{ message: "Address is required", … }],
 *       "lineItems[0].name": [{ message: "Item name is required", … }],
 *     }
 *   }
 */
type FormErrorMap = Partial<Record<string, Record<string, ZodIssue[]>>>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Pretty-print a camelCase / bracket-notation field key.
 *  "lineItems[0].name" → "Line Items [0] Name"
 *  "phoneNumber"       → "Phone Number"
 */
function humanizeKey(key: string): string {
  return key
    .replace(/\[(\d+)\]/g, " [$1]") // lineItems[0] → lineItems [0]
    .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase → camel Case
    .replace(/\./g, " ") // dots → spaces
    .replace(/\b\w/g, (c) => c.toUpperCase()) // Title Case
    .trim();
}

/**
 * Detect whether a field key refers to a line-item row.
 * Keys like "lineItems[2].name" → group label "Row 3" (0-indexed → 1-based).
 */
function parseLineItemKey(
  key: string,
): { rowIndex: number; subField: string } | null {
  const match = key.match(/^lineItems\[(\d+)\]\.(.+)$/);
  if (!match) return null;
  return { rowIndex: parseInt(match[1], 10) + 1, subField: match[2] };
}

// ─── Flat error list extracted from errorMap ──────────────────────────────────

interface FlatError {
  fieldKey: string; // raw key, e.g. "lineItems[0].name"
  label: string; // human-readable, e.g. "Line Items [0] Name"
  message: string;
  rowIndex?: number; // set only for lineItems rows
  subField?: string; // set only for lineItems rows, e.g. "name"
}

function flattenErrorMap(errorMap: FormErrorMap): FlatError[] {
  const flat: FlatError[] = [];

  for (const timingErrors of Object.values(errorMap)) {
    if (!timingErrors || typeof timingErrors !== "object") continue;

    for (const [fieldKey, issues] of Object.entries(timingErrors)) {
      if (!Array.isArray(issues)) continue;

      for (const issue of issues) {
        const lineItem = parseLineItemKey(fieldKey);
        flat.push({
          fieldKey,
          label: humanizeKey(fieldKey),
          message: issue.message,
          ...(lineItem ?? {}),
        });
      }
    }
  }

  return flat;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ValidationErrorBannerProps {
  /** Pass `form.store` directly — the banner subscribes to it reactively. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errorMap: any;
  onDismiss?: () => void;
}

export function ValidationErrorBanner({
  errorMap,
  onDismiss,
}: ValidationErrorBannerProps) {
  const [collapsed, setCollapsed] = useState(false);

  const allErrors = flattenErrorMap(errorMap ?? {});

  if (allErrors.length === 0) return null;

  // Split into top-level fields and line-item rows
  const topLevelErrors = allErrors.filter((e) => e.rowIndex === undefined);
  const lineItemErrors = allErrors.filter((e) => e.rowIndex !== undefined);

  // Group line-item errors by row
  const lineItemsByRow = lineItemErrors.reduce<Record<number, FlatError[]>>(
    (acc, err) => {
      const row = err.rowIndex!;
      if (!acc[row]) acc[row] = [];
      acc[row].push(err);
      return acc;
    },
    {},
  );

  const totalErrors = allErrors.length;

  return (
    <Alert variant="destructive">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <AlertTitle className="mb-0 leading-none">
            Fix the following errors before saving
          </AlertTitle>
          <Badge
            variant="destructive"
            className="px-2 py-0.5 text-xs font-semibold"
          >
            {totalErrors} {totalErrors === 1 ? "error" : "errors"}
          </Badge>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand errors" : "Collapse errors"}
          >
            {collapsed ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronUp className="h-3.5 w-3.5" />
            )}
          </Button>

          {onDismiss && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onDismiss}
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      {!collapsed && (
        <AlertDescription className="mt-3 space-y-4">
          {/* Top-level fields */}
          {topLevelErrors.length > 0 && (
            <ul className="space-y-1">
              {topLevelErrors.map((err) => (
                <li
                  key={err.fieldKey}
                  className="flex items-baseline gap-2 text-sm"
                >
                  <span className="font-medium shrink-0">{err.label}:</span>
                  <span className="text-destructive/90">{err.message}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Line-item rows */}
          {Object.keys(lineItemsByRow).length > 0 && (
            <div className="space-y-3">
              {topLevelErrors.length > 0 && (
                <hr className="border-destructive/20" />
              )}
              <p className="text-xs font-semibold uppercase tracking-wide text-destructive/70">
                Order items
              </p>
              {Object.entries(lineItemsByRow)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([rowIndex, rowErrors]) => (
                  <div key={rowIndex}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-destructive mb-1">
                      Row {rowIndex}
                    </p>
                    <ul className="space-y-1 pl-2 border-l-2 border-destructive/30">
                      {rowErrors.map((err, i) => (
                        <li
                          key={i}
                          className="flex items-baseline gap-2 text-sm"
                        >
                          <span className="font-medium shrink-0 capitalize">
                            {err.subField}:
                          </span>
                          <span className="text-destructive/90">
                            {err.message}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          )}
        </AlertDescription>
      )}
    </Alert>
  );
}
