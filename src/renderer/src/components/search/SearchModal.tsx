import { useEffect, useRef } from 'react';
import { useSearchStore } from '../../store/searchStore';
import { Search as SearchIcon, X, Loader2 } from 'lucide-react';

export function SearchModal() {
  const { isModalOpen, setModalOpen, query, setQuery, results, isLoading, executeSearch } = useSearchStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setModalOpen(true);
      }
      if (e.key === 'Escape' && isModalOpen) {
        setModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, setModalOpen]);

  useEffect(() => {
    if (isModalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isModalOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) executeSearch();
    }, 300); // debounce
    return () => clearTimeout(timer);
  }, [query]);

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-background/80 backdrop-blur-sm">
      <div
         className="w-full max-w-2xl bg-card border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center px-4 border-b">
           <SearchIcon className="h-5 w-5 text-muted-foreground mr-3" />
           <input
             ref={inputRef}
             type="text"
             className="flex-1 h-14 bg-transparent outline-none text-lg placeholder:text-muted-foreground"
             placeholder="Search customers, products, transactions... (Ctrl+K)"
             value={query}
             onChange={e => setQuery(e.target.value)}
           />
           {isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-3" />}
           <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-muted rounded-md text-muted-foreground">
             <X className="h-5 w-5" />
           </button>
        </div>

        <div className="max-h-[60vh] overflow-auto">
           {query.trim() === '' && (
              <div className="p-12 text-center text-sm text-muted-foreground">
                 Start typing to search across the entire vault.
              </div>
           )}

           {query.trim() !== '' && results.length === 0 && !isLoading && (
              <div className="p-12 text-center text-sm text-muted-foreground">
                 No results found for "{query}"
              </div>
           )}

           {results.length > 0 && (
             <ul className="py-2">
               {results.map((result, idx) => (
                 <li key={`${result.entityType}-${result.entityId}-${idx}`}>
                   <a
                     href={`#/${result.entityType === 'party' ? 'customers' : result.entityType === 'product' ? 'inventory' : 'transactions'}`}
                     onClick={() => setModalOpen(false)}
                     className="flex flex-col px-6 py-3 hover:bg-muted cursor-pointer transition-colors"
                   >
                     <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{result.displayText}</span>
                        <span className="text-xs uppercase bg-secondary text-secondary-foreground px-2 py-0.5 rounded font-semibold">{result.entityType}</span>
                     </div>
                     <span className="text-sm text-muted-foreground mt-0.5">{result.subtitle}</span>
                   </a>
                 </li>
               ))}
             </ul>
           )}
        </div>
      </div>
    </div>
  );
}
