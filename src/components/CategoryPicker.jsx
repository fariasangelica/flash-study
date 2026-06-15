export function CategoryPicker({
  existingCategories = [],
  category,
  customCategory,
  onCategoryChange,
  onCustomCategoryChange,
  label = 'Categoria',
  compact = false,
}) {
  const knownCategories = existingCategories.filter((c) => c !== 'Todos');

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      <label className={`block font-semibold text-slate-700 dark:text-slate-200 ${compact ? 'text-xs' : 'text-sm'}`}>
        {label}
      </label>

      <div className="flex gap-1.5 flex-wrap">
        {knownCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onCategoryChange(cat)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              category === cat
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'border-slate-300 dark:border-slate-500 text-slate-600 dark:text-slate-300 hover:border-indigo-400'
            }`}
          >
            {cat}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onCategoryChange('__custom__')}
          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
            category === '__custom__'
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'border-slate-300 dark:border-slate-500 text-slate-600 dark:text-slate-300 hover:border-indigo-400'
          }`}
        >
          + Nova
        </button>
      </div>

      {category === '__custom__' && (
        <input
          value={customCategory}
          onChange={(e) => onCustomCategoryChange(e.target.value)}
          placeholder="Nome da categoria"
          className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      )}
    </div>
  );
}

export function getActiveCategory(category, customCategory) {
  return category === '__custom__' ? customCategory.trim() : category.trim();
}
