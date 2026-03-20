"use client";

interface EditableFieldProps {
  value: string;
  placeholder?: string;
  isEditing: boolean;
  onChange?: (value: string) => void;
  multiline?: boolean;
}

export default function EditableField({
  value,
  placeholder,
  isEditing,
  onChange,
  multiline = false,
}: EditableFieldProps) {
  const baseClass = "w-full rounded border p-2 text-sm";

  if (isEditing) {
    return multiline ? (
      <textarea
        className={`${baseClass} resize-none h-28`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    ) : (
      <input
        type="text"
        className={baseClass}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    );
  }

  return (
    <div className={`${baseClass} min-h-[2.25rem] text-gray-800 bg-gray-50`}>
      {value || <span className="text-gray-400">{placeholder}</span>}
    </div>
  );
}
