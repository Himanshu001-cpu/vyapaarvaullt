import { db } from './index';
import { units, categories } from './schema';
import { eq } from 'drizzle-orm';

export async function seedDatabase() {
  try {
    // Check if base unit exists
    const existingUnit = await db.select().from(units).where(eq(units.name, 'Pieces')).limit(1);

    if (existingUnit.length === 0) {
      await db.insert(units).values([
        { name: 'Pieces', short_name: 'pcs' },
        { name: 'Kilograms', short_name: 'kg' },
        { name: 'Liters', short_name: 'L' },
        { name: 'Boxes', short_name: 'box' },
      ]);
      console.log('Seeded default units');
    }

    const existingCategory = await db.select().from(categories).where(eq(categories.name, 'General')).limit(1);

    if (existingCategory.length === 0) {
      await db.insert(categories).values([
        { name: 'General' }
      ]);
      console.log('Seeded default categories');
    }
  } catch (error) {
    console.error('Failed to seed database:', error);
  }
}
