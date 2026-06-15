export function CategoryFilter({ categories, selectedCategory, onChange }) {
  return (
    <div className="flex justify-end">
      <select
        value={selectedCategory}
        onChange={(e) => onChange(e.target.value)}
        className="p-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
      >
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>
  );
}
