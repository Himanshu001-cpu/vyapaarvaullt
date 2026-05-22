import { AnalyticsRepository } from '../repositories/analytics.repository';

export class AnalyticsService {
  static async getDashboardData() {
    const [
      monthlyRevenue,
      pendingReceivables,
      pendingPayables,
      lowStockCount,
      topCustomers,
      recentInvoices,
      recentTransactions
    ] = await Promise.all([
      AnalyticsRepository.getMonthlyRevenue(),
      AnalyticsRepository.getPendingReceivables(),
      AnalyticsRepository.getPendingPayables(),
      AnalyticsRepository.getLowStockCount(),
      AnalyticsRepository.getTopCustomers(),
      AnalyticsRepository.getRecentInvoices(),
      AnalyticsRepository.getRecentTransactions()
    ]);

    return {
      monthlyRevenue,
      pendingReceivables,
      pendingPayables,
      lowStockCount,
      topCustomers,
      recentInvoices,
      recentTransactions
    };
  }
}
