import { Controller, Get, Query, Req } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchQueryDto, SearchResponseData } from './dto/search-query.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(
    @Query() query: SearchQueryDto,
    @Req() req: any,
  ): Promise<{ status: boolean; message: string; data: SearchResponseData }> {
    try {
      const authHeader = req?.headers?.['authorization'] || req?.headers?.['x-admin-token'];
      const kidsHeader = req?.headers?.['x-kids-mode'];
      const data = await this.searchService.search(query, authHeader, kidsHeader);
      return {
        status: true,
        message: 'Search completed successfully',
        data,
      };
    } catch (error: any) {
      return {
        status: false,
        message: error.message || 'An error occurred during search',
        data: {
          results: [],
          meta: {
            total: 0,
            query: query.q || '',
            category: query.category || 'all',
            counts: { all: 0, movie: 0, series: 0, interactive: 0, short: 0, video: 0 },
          },
          trendingSearches: [],
          recommended: [],
          categories: ['All'],
        },
      };
    }
  }
}
