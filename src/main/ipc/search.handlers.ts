import { registerIpcHandler, authGuard } from './index';
import { SearchService } from '../services/search.service';
import { globalSearchSchema } from '../validation/search.schema';

export function registerSearchHandlers() {
  registerIpcHandler('search:global', globalSearchSchema, authGuard(async (payload) => {
    const data = await SearchService.globalSearch(payload.query, payload.limit);
    return { success: true, data };
  }));
}
