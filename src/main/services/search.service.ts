import { SearchRepository } from '../repositories/search.repository';

export class SearchService {
  static async globalSearch(query: string, limit?: number) {
    if (!query || query.trim() === '') return [];
    return SearchRepository.globalSearch(query.trim(), limit);
  }
}
