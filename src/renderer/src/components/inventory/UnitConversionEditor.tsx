import { useState, useEffect } from 'react';
import { useToast } from '../../hooks/use-toast';

interface Unit {
  id: number;
  name: string;
  short_name: string;
}

interface Conversion {
  id: number;
  product_id: number;
  from_unit_id: number;
  to_unit_id: number;
  multiplier: number;
}

export function UnitConversionEditor({ productId }: { productId: number }) {
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [fromUnitId, setFromUnitId] = useState<number | ''>('');
  const [toUnitId, setToUnitId] = useState<number | ''>('');
  const [multiplier, setMultiplier] = useState<number>(1);
  const { toast } = useToast();

  const loadData = async () => {
    const [unitsResp, convsResp] = await Promise.all([
      window.api.unit.list(),
      window.api.conversion.list({ id: productId })
    ]);

    if (unitsResp.success) setUnits(unitsResp.data as Unit[]);
    if (convsResp.success) setConversions(convsResp.data as Conversion[]);
  };

  useEffect(() => {
    loadData();
  }, [productId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromUnitId || !toUnitId || multiplier <= 0) return;

    try {
      const response = await window.api.conversion.create({
        product_id: productId,
        from_unit_id: Number(fromUnitId),
        to_unit_id: Number(toUnitId),
        multiplier
      });

      if (response.success) {
        toast({ title: 'Success', description: 'Conversion rule added' });
        setFromUnitId('');
        setToUnitId('');
        setMultiplier(1);
        loadData();
      } else {
        toast({ title: 'Error', description: response.error?.message || 'Failed to add rule' });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Unexpected error occurred' });
    }
  };

  const getUnitName = (id: number) => units.find(u => u.id === id)?.name || id;

  return (
    <div className="bg-card text-card-foreground p-4 border rounded-xl shadow-sm mt-4">
      <h3 className="text-lg font-semibold mb-4">Unit Conversions</h3>
      <form onSubmit={handleCreate} className="flex gap-2 mb-4 items-end">
        <div className="flex-1">
          <label className="block text-xs mb-1">1 of (From Unit)</label>
          <select
            value={fromUnitId}
            onChange={e => setFromUnitId(Number(e.target.value))}
            className="w-full p-2 border rounded-md bg-input text-sm"
            required
          >
            <option value="">Select Unit</option>
            {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <div className="text-center px-2 py-2">=</div >
        <div className="w-24">
          <label className="block text-xs mb-1">Multiplier</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={multiplier}
            onChange={e => setMultiplier(Number(e.target.value))}
            className="w-full p-2 border rounded-md bg-input text-sm"
            required
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs mb-1">Of (To Unit)</label>
          <select
            value={toUnitId}
            onChange={e => setToUnitId(Number(e.target.value))}
            className="w-full p-2 border rounded-md bg-input text-sm"
            required
          >
            <option value="">Select Unit</option>
            {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">Add Rule</button>
      </form>

      <div className="flex flex-col gap-2">
        {conversions.map(c => (
          <div key={c.id} className="p-2 bg-muted rounded-md text-sm border flex justify-between items-center">
            <span>1 {getUnitName(c.from_unit_id)} = {c.multiplier} {getUnitName(c.to_unit_id)}</span>
            <button
              onClick={async () => {
                await window.api.conversion.delete({ id: c.id });
                loadData();
              }}
              className="text-destructive hover:underline text-xs"
            >
              Remove
            </button>
          </div>
        ))}
        {conversions.length === 0 && <p className="text-sm text-muted-foreground">No conversion rules defined for this product.</p>}
      </div>
    </div>
  );
}
