import { useState, useEffect } from 'react';
import { useToast } from '../../hooks/use-toast';
import { LoadingState } from '../feedback/States';

interface Unit {
  id: number;
  name: string;
  short_name: string;
}

export function UnitManager() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newShortName, setNewShortName] = useState('');
  const { toast } = useToast();

  const loadUnits = async () => {
    setIsLoading(true);
    try {
      const response = await window.api.unit.list();
      if (response.success) {
        setUnits(response.data as Unit[]);
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to load units' });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadUnits();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newShortName) return;
    try {
      const response = await window.api.unit.create({ name: newName, short_name: newShortName });
      if (response.success) {
        toast({ title: 'Success', description: 'Unit created successfully' });
        setNewName('');
        setNewShortName('');
        loadUnits();
      } else {
         toast({ title: 'Error', description: response.error?.message || 'Failed to create unit' });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'An unexpected error occurred' });
    }
  };

  if (isLoading) return <LoadingState />;

  return (
    <div className="bg-card text-card-foreground p-4 border rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Manage Units</h3>
      <form onSubmit={handleCreate} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Unit Name (e.g. Dozen)"
          className="p-2 border rounded-md bg-input text-sm flex-1"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Short (e.g. dz)"
          className="p-2 border rounded-md bg-input text-sm w-32"
          value={newShortName}
          onChange={e => setNewShortName(e.target.value)}
          required
        />
        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">Add</button>
      </form>
      <div className="flex flex-wrap gap-2">
        {units.map(u => (
          <div key={u.id} className="px-3 py-1 bg-muted rounded-full text-sm border flex items-center gap-2">
            <span>{u.name} ({u.short_name})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
