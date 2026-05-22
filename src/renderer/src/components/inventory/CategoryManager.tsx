import { useState, useEffect } from 'react';
import { useToast } from '../../hooks/use-toast';
import { LoadingState } from '../feedback/States';

interface Category {
  id: number;
  name: string;
}

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const { toast } = useToast();

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const response = await window.api.category.list();
      if (response.success) {
        setCategories(response.data as Category[]);
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to load categories' });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    try {
      const response = await window.api.category.create({ name: newName });
      if (response.success) {
        toast({ title: 'Success', description: 'Category created successfully' });
        setNewName('');
        loadCategories();
      } else {
         toast({ title: 'Error', description: response.error?.message || 'Failed to create category' });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'An unexpected error occurred' });
    }
  };

  if (isLoading) return <LoadingState />;

  return (
    <div className="bg-card text-card-foreground p-4 border rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Manage Categories</h3>
      <form onSubmit={handleCreate} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Category Name"
          className="p-2 border rounded-md bg-input text-sm flex-1"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          required
        />
        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">Add</button>
      </form>
      <div className="flex flex-wrap gap-2">
        {categories.map(c => (
          <div key={c.id} className="px-3 py-1 bg-muted rounded-full text-sm border flex items-center gap-2">
            <span>{c.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
