import { DataProvider } from "./DataProvider";
import { MockDataProvider } from "./MockDataProvider";

export class BPSProvider implements DataProvider {
  private fallbackProvider: MockDataProvider;
  private apiKey: string | null = null;
  private apiBaseUrl: string = "https://api.bps.go.id/v1"; // Example API domain placeholder

  constructor() {
    this.fallbackProvider = new MockDataProvider();
    // Load credentials if present
    this.apiKey = process.env.BPS_API_KEY || null;
  }

  // Helper to check if BPS API is configured
  private isConfigured(): boolean {
    return this.apiKey !== null;
  }

  async getRegions(): Promise<any[]> {
    if (!this.isConfigured()) {
      console.log("BPS API not configured. Falling back to Mock Data Provider.");
      return this.fallbackProvider.getRegions();
    }
    
    // In a real implementation:
    // const response = await fetch(`${this.apiBaseUrl}/regions?key=${this.apiKey}`);
    // return response.json();
    throw new Error("BPS API integration not fully configured.");
  }

  async getRegion(id: string): Promise<any | null> {
    if (!this.isConfigured()) {
      return this.fallbackProvider.getRegion(id);
    }
    throw new Error("BPS API integration not fully configured.");
  }

  async getDatasets(category?: string): Promise<any[]> {
    if (!this.isConfigured()) {
      return this.fallbackProvider.getDatasets(category);
    }
    throw new Error("BPS API integration not fully configured.");
  }

  async getDataset(id: string): Promise<any | null> {
    if (!this.isConfigured()) {
      return this.fallbackProvider.getDataset(id);
    }
    throw new Error("BPS API integration not fully configured.");
  }

  async getIndicators(): Promise<any[]> {
    if (!this.isConfigured()) {
      return this.fallbackProvider.getIndicators();
    }
    throw new Error("BPS API integration not fully configured.");
  }

  async getIndicatorByCode(code: string): Promise<any | null> {
    if (!this.isConfigured()) {
      return this.fallbackProvider.getIndicatorByCode(code);
    }
    throw new Error("BPS API integration not fully configured.");
  }

  async getDataPoints(filters: {
    indicatorCode?: string;
    indicatorId?: string;
    regionId?: string;
    year?: number;
  }): Promise<any[]> {
    if (!this.isConfigured()) {
      return this.fallbackProvider.getDataPoints(filters);
    }
    throw new Error("BPS API integration not fully configured.");
  }

  async getNationalOverview(year: number): Promise<any> {
    if (!this.isConfigured()) {
      return this.fallbackProvider.getNationalOverview(year);
    }
    throw new Error("BPS API integration not fully configured.");
  }

  async getRanking(indicatorCode: string, year: number, limit?: number): Promise<any[]> {
    if (!this.isConfigured()) {
      return this.fallbackProvider.getRanking(indicatorCode, year, limit);
    }
    throw new Error("BPS API integration not fully configured.");
  }

  async getComparison(regionIds: string[], indicatorCodes: string[], year: number): Promise<any> {
    if (!this.isConfigured()) {
      return this.fallbackProvider.getComparison(regionIds, indicatorCodes, year);
    }
    throw new Error("BPS API integration not fully configured.");
  }

  async search(query: string): Promise<{
    regions: any[];
    datasets: any[];
    indicators: any[];
  }> {
    if (!this.isConfigured()) {
      return this.fallbackProvider.search(query);
    }
    throw new Error("BPS API integration not fully configured.");
  }

  async importDataset(
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
  ): Promise<any> {
    if (!this.isConfigured()) {
      return this.fallbackProvider.importDataset(metadata, dataPoints);
    }
    throw new Error("BPS API integration not fully configured.");
  }
}
export class GovernmentDataProvider implements DataProvider {
  private fallbackProvider: MockDataProvider;
  constructor() {
    this.fallbackProvider = new MockDataProvider();
  }
  async getRegions() { return this.fallbackProvider.getRegions(); }
  async getRegion(id: string) { return this.fallbackProvider.getRegion(id); }
  async getDatasets(category?: string) { return this.fallbackProvider.getDatasets(category); }
  async getDataset(id: string) { return this.fallbackProvider.getDataset(id); }
  async getIndicators() { return this.fallbackProvider.getIndicators(); }
  async getIndicatorByCode(code: string) { return this.fallbackProvider.getIndicatorByCode(code); }
  async getDataPoints(filters: any) { return this.fallbackProvider.getDataPoints(filters); }
  async getNationalOverview(year: number) { return this.fallbackProvider.getNationalOverview(year); }
  async getRanking(indicatorCode: string, year: number, limit?: number) { return this.fallbackProvider.getRanking(indicatorCode, year, limit); }
  async getComparison(regionIds: string[], indicatorCodes: string[], year: number) { return this.fallbackProvider.getComparison(regionIds, indicatorCodes, year); }
  async search(query: string) { return this.fallbackProvider.search(query); }
  async importDataset(metadata: any, dataPoints: any) { return this.fallbackProvider.importDataset(metadata, dataPoints); }
}
