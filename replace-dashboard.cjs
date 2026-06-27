const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

// Replace gaps
code = code.replace(/<div className="flex flex-col gap-8">/, '<div className={`flex flex-col ${sectionGapClass}`}>');

// Replace card paddings
code = code.replace(/className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm overflow-hidden"/g, 'className={`bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-700 ${cardPaddingClass} shadow-sm overflow-hidden`}');

code = code.replace(/className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm"/g, 'className={`bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-700 ${cardPaddingClass} shadow-sm`}');

code = code.replace(/<div className="tour-quick-actions grid grid-cols-1 md:grid-cols-2 gap-6">/g, '<div className={`tour-quick-actions grid grid-cols-1 md:grid-cols-2 ${dashboardSpaceClass === "space-y-4" ? "gap-4" : "gap-6"}`}>');

fs.writeFileSync('src/pages/Dashboard.tsx', code);
