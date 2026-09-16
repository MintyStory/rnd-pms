interface Option {
  id: string;
  label: string;
}

interface Props {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (ids: string[]) => void;
  emptyHint?: string;
}

export default function LinkedItemsSelect({
  label,
  options,
  selected,
  onChange,
  emptyHint,
}: Props) {
  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {options.length === 0 ? (
        <p className="text-xs text-gray-400">{emptyHint ?? "등록된 항목이 없습니다."}</p>
      ) : (
        <div className="flex flex-wrap gap-2 rounded border border-gray-200 p-2">
          {options.map((o) => (
            <label
              key={o.id}
              className={`flex items-center gap-1 rounded border px-2 py-1 text-xs ${
                selected.includes(o.id)
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-300 text-gray-600"
              }`}
            >
              <input
                type="checkbox"
                checked={selected.includes(o.id)}
                onChange={() => toggle(o.id)}
                className="hidden"
              />
              {o.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
