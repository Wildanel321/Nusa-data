import { DataProvider } from "./DataProvider";

class ClientDataProvider implements DataProvider {
  private async queryServer(method: string, args: any[]): Promise<any> {
    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, args }),
      });

      if (!res.ok) {
        throw new Error(`RPC query failed: ${res.statusText}`);
      }

      return await res.json();
    } catch (error) {
      console.error(`ClientDataProvider query failed for ${method}:`, error);
      throw error;
    }
  }

  async getRegions(): Promise<any[]> {
    return this.queryServer("getRegions", []);
  }

  async getRegion(id: string): Promise<any | null> {
    return this.queryServer("getRegion", [id]);
  }

  async getDatasets(category?: string): Promise<any[]> {
    return this.queryServer("getDatasets", [category]);
  }

  async getDataset(id: string): Promise<any | null> {
    return this.queryServer("getDataset", [id]);
  }

  async getIndicators(): Promise<any[]> {
    return this.queryServer("getIndicators", []);
  }

  async getIndicatorByCode(code: string): Promise<any | null> {
    return this.queryServer("getIndicatorByCode", [code]);
  }

  async getDataPoints(filters: {
    indicatorCode?: string;
    indicatorId?: string;
    regionId?: string;
    year?: number;
  }): Promise<any[]> {
    return this.queryServer("getDataPoints", [filters]);
  }

  async getNationalOverview(year: number): Promise<any> {
    return this.queryServer("getNationalOverview", [year]);
  }

  async getRanking(indicatorCode: string, year: number, limit?: number): Promise<any[]> {
    return this.queryServer("getRanking", [indicatorCode, year, limit]);
  }

  async getComparison(regionIds: string[], indicatorCodes: string[], year: number): Promise<any> {
    return this.queryServer("getComparison", [regionIds, indicatorCodes, year]);
  }

  async search(query: string): Promise<{
    regions: any[];
    datasets: any[];
    indicators: any[];
  }> {
    return this.queryServer("search", [query]);
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
    return this.queryServer("importDataset", [metadata, dataPoints]);
  }
}

const clientDataProvider = new ClientDataProvider();
export default clientDataProvider;
