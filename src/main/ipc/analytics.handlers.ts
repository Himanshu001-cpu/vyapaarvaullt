import { registerIpcHandler, authGuard } from './index';
import { AnalyticsService } from '../services/analytics.service';
import { dashboardDataSchema } from '../validation/analytics.schema';

export function registerAnalyticsHandlers() {
  registerIpcHandler('analytics:dashboard', dashboardDataSchema, authGuard(async () => {
    const data = await AnalyticsService.getDashboardData();
    return { success: true, data };
  }));
}
