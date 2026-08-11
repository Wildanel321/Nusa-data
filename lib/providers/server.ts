import { DbDataProvider } from "./DbDataProvider";
import { MockDataProvider } from "./MockDataProvider";
import { BPSProvider } from "./BPSProvider";

const providerType = process.env.DATA_PROVIDER;
const hasBpsKey = !!process.env.BPS_API_KEY && process.env.BPS_API_KEY !== "" && process.env.BPS_API_KEY !== "your-app-id-here";

let primaryProvider: any;

if (providerType === "bps" || (hasBpsKey && providerType !== "db" && providerType !== "mock")) {
  primaryProvider = new BPSProvider();
} else if (providerType === "db" || (!!process.env.DATABASE_URL && providerType !== "mock")) {
  primaryProvider = new DbDataProvider();
} else {
  primaryProvider = new MockDataProvider();
}

const fallback = new MockDataProvider();

class DynamicFallbackProvider {
  private activeProvider = primaryProvider;

  private async executeSafely(method: string, args: any[]) {
    try {
      const fn = this.activeProvider[method];
      return await fn.apply(this.activeProvider, args);
    } catch (error: any) {
      // Catch database connection issues (ECONNREFUSED or connection failures) and fall back to Mock provider
      const isDbProvider = this.activeProvider instanceof DbDataProvider;
      const isConnectionError = error.code === "ECONNREFUSED" || error.message?.includes("connect") || error.message?.includes("InitializationError");
      
      if (isDbProvider && isConnectionError) {
        console.warn("Database connection refused or failed to initialize. Falling back to Mock Data Provider (BPS Official Statistics) dynamically.");
        this.activeProvider = fallback;
        const fnFallback = fallback[method as keyof MockDataProvider];
        return await (fnFallback as Function).apply(fallback, args);
      }
      throw error;
    }
  }

  async getRegions() { return this.executeSafely("getRegions", []); }
  async getRegion(id: string) { return this.executeSafely("getRegion", [id]); }
  async getDatasets(category?: string) { return this.executeSafely("getDatasets", [category]); }
  async getDataset(id: string) { return this.executeSafely("getDataset", [id]); }
  async getIndicators() { return this.executeSafely("getIndicators", []); }
  async getIndicatorByCode(code: string) { return this.executeSafely("getIndicatorByCode", [code]); }
  async getDataPoints(filters: any) { return this.executeSafely("getDataPoints", [filters]); }
  async getNationalOverview(year: number) { return this.executeSafely("getNationalOverview", [year]); }
  async getRanking(indicatorCode: string, year: number, limit?: number) { return this.executeSafely("getRanking", [indicatorCode, year, limit]); }
  async getComparison(regionIds: string[], indicatorCodes: string[], year: number) { return this.executeSafely("getComparison", [regionIds, indicatorCodes, year]); }
  async search(query: string) { return this.executeSafely("search", [query]); }
  async importDataset(metadata: any, dataPoints: any) { return this.executeSafely("importDataset", [metadata, dataPoints]); }
}

const dataProvider = new DynamicFallbackProvider();
export default dataProvider;
