import { useCallback, useMemo } from 'react';

/* ========================================= */
/* Типы декларативного листа                 */
/* ========================================= */

export interface SheetField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select';
  path: string;
  options?: Array<{ value: string; label: string }>;
}

export interface SheetSection {
  key: string;
  title?: string;
  fields: SheetField[];
}

export interface SheetDefinition {
  schema_version: string;
  name?: string;
  sections: SheetSection[];
}

/* ========================================= */
/* Утилиты для dot-notation                  */
/* ========================================= */

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }

    if (typeof current !== 'object') {
      return undefined;
    }

    current = (current as Record<string, unknown>)[key];
  }

  return current;
}

function setNestedValue(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown> {
  const keys = path.split('.');
  const result = { ...obj };

  let current: Record<string, unknown> = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];

    if (
      current[key] === null ||
      current[key] === undefined ||
      typeof current[key] !== 'object'
    ) {
      current[key] = {};
    }

    current[key] = { ...(current[key] as Record<string, unknown>) };
    current = current[key] as Record<string, unknown>;
  }

  const lastKey = keys[keys.length - 1];
  current[lastKey] = value;

  return result;
}

/* ========================================= */
/* Компоненты полей                          */
/* ========================================= */

function SheetTextField({
  field,
  value,
  onChange,
}: {
  field: SheetField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  return (
    <label className="sheet-field">
      <span className="sheet-field-label">{field.label}</span>
      <input
        type="text"
        className="sheet-field-input"
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function SheetNumberField({
  field,
  value,
  onChange,
}: {
  field: SheetField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  return (
    <label className="sheet-field">
      <span className="sheet-field-label">{field.label}</span>
      <input
        type="number"
        className="sheet-field-input"
        value={typeof value === 'number' ? value : 0}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </label>
  );
}

function SheetTextareaField({
  field,
  value,
  onChange,
}: {
  field: SheetField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  return (
    <label className="sheet-field sheet-field-full">
      <span className="sheet-field-label">{field.label}</span>
      <textarea
        className="sheet-field-textarea"
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
      />
    </label>
  );
}

function SheetSelectField({
  field,
  value,
  onChange,
}: {
  field: SheetField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  return (
    <label className="sheet-field">
      <span className="sheet-field-label">{field.label}</span>
      <select
        className="sheet-field-input"
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">—</option>
        {field.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SheetFieldRenderer({
  field,
  value,
  onChange,
}: {
  field: SheetField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  switch (field.type) {
    case 'text':
      return <SheetTextField field={field} value={value} onChange={onChange} />;
    case 'number':
      return <SheetNumberField field={field} value={value} onChange={onChange} />;
    case 'textarea':
      return <SheetTextareaField field={field} value={value} onChange={onChange} />;
    case 'select':
      return <SheetSelectField field={field} value={value} onChange={onChange} />;
    default:
      return (
        <div className="sheet-field-unknown">
          Unknown field type: {field.type}
        </div>
      );
  }
}

/* ========================================= */
/* Основной компонент SheetRenderer          */
/* ========================================= */

interface SheetRendererProps {
  sheetJson: string;
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
}

export function SheetRenderer({ sheetJson, data, onChange }: SheetRendererProps) {
  const sheet: SheetDefinition | null = useMemo(() => {
    try {
      return JSON.parse(sheetJson) as SheetDefinition;
    } catch {
      return null;
    }
  }, [sheetJson]);

  const handleFieldChange = useCallback(
    (path: string, value: unknown) => {
      const updated = setNestedValue(data, path, value);
      onChange(updated);
    },
    [data, onChange],
  );

  if (!sheet) {
    return <div className="empty-state">Failed to parse sheet definition.</div>;
  }

  if (!sheet.sections || sheet.sections.length === 0) {
    return <div className="empty-state">Sheet has no sections.</div>;
  }

  return (
    <div className="sheet-renderer">
      {sheet.sections.map((section) => (
        <section key={section.key} className="sheet-section">
          {section.title && (
            <h3 className="sheet-section-title">{section.title}</h3>
          )}

          <div className="sheet-section-fields">
            {section.fields.map((field) => {
              const value = getNestedValue(data, field.path);

              return (
                <SheetFieldRenderer
                  key={field.key}
                  field={field}
                  value={value}
                  onChange={(newValue) =>
                    handleFieldChange(field.path, newValue)
                  }
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}