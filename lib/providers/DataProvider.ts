export interface DataProvider {
  // Region Retrieval
  getRegions(): Promise<any[]>;
  getRegion(id: string): Promise<any | null>;

  // Dataset Retrieval
  getDatasets(category?: string): Promise<any[]>;
  getDataset(id: string): Promise<any | null>;

  // Indicator Retrieval
  getIndicators(): Promise<any[]>;
  getIndicatorByCode(code: string): Promise<any | null>;

  // DataPoint Retrieval
  getDataPoints(filters: {
    indicatorCode?: string;
    indicatorId?: string;
    regionId?: string;
    year?: number;
  }): Promise<any[]>;

  // Aggregated Views
  getNationalOverview(year: number): Promise<any>;
  getRanking(indicatorCode: string, year: number, limit?: number): Promise<any[]>;
  getComparison(regionIds: string[], indicatorCodes: string[], year: number): Promise<any>;

  // Search
  search(query: string): Promise<{
    regions: any[];
    datasets: any[];
    indicators: any[];
  }>;

  // Import Action
  importDataset(
    metadata: {
      title: string;
      description: string;
      category: string;
      status: string;
      unit: string;
      methodology?: string;
      dataSourceId: string;
    },
    dataPoints: {
      regionId: string;
      year: number;
      value: number;
    }[]
  ): Promise<any>;
}
