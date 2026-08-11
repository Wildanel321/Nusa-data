import { DataProvider } from "./DataProvider";
import { MockDataProvider } from "./MockDataProvider";

const BPS_VARIABLES: Record<string, { id: number; name: string; unit: string }> = {
  "POVERTY_RATE": { id: 23, name: "Persentase Penduduk Miskin", unit: "%" },
  "POPULATION": { id: 12, name: "Jumlah Penduduk", unit: "Jiwa" },
  "LITERACY_RATE": { id: 111, name: "Angka Melek Huruf", unit: "%" },
  "INTERNET_ACCESS": { id: 164, name: "Persentase Rumah Tangga yang Mengakses Internet", unit: "%" },
  "UNEMPLOYMENT_RATE": { id: 548, name: "Tingkat Pengangguran Terbuka", unit: "%" }
};

export class BPSProvider implements DataProvider {
  private fallbackProvider: MockDataProvider;
  private apiKey: string | null = null;
  private apiBaseUrl: string = "https://webapi.bps.go.id/v1/api";

  constructor() {
    this.fallbackProvider = new MockDataProvider();
    this.apiKey = process.env.BPS_API_KEY || null;
  }

  private isConfigured(): boolean {
    return this.apiKey !== null && this.apiKey !== "" && this.apiKey !== "your-app-id-here";
  }

  // Normalize BPS Vervar labels to fit our local region ID slugs
  private normalizeRegionName(name: string): string {
    let slug = name.toLowerCase()
      .replace(/d\.i\./g, "di")
      .replace(/d\.k\.i\./g, "dki")
      .replace(/di yogyakarta/g, "di-yogyakarta")
      .trim()
      .replace(/\s+/g, "-");
    
    if (slug === "kepulauan-bangka-belitung") return "bangka-belitung";
    if (slug === "nanggroe-aceh-darussalam" || slug === "aceh") return "aceh";
    return slug;
  }

  async getRegions(): Promise<any[]> {
    return this.fallbackProvider.getRegions();
  }

  async getRegion(id: string): Promise<any | null> {
    return this.fallbackProvider.getRegion(id);
  }

  async getDatasets(category?: string): Promise<any[]> {
    const list = await this.fallbackProvider.getDatasets(category);
    // Mark datasets as Official when running BPS API mode
    return list.map(d => ({
      ...d,
      status: this.isConfigured() ? "Official" : "Verified"
    }));
  }

  async getDataset(id: string): Promise<any | null> {
    const ds = await this.fallbackProvider.getDataset(id);
    if (!ds) return null;
    return {
      ...ds,
      status: this.isConfigured() ? "Official" : "Verified"
    };
  }

  async getIndicators(): Promise<any[]> {
    return this.fallbackProvider.getIndicators();
  }

  async getIndicatorByCode(code: string): Promise<any | null> {
    const ind = await this.fallbackProvider.getIndicatorByCode(code);
    if (!ind) return null;
    return {
      ...ind,
      dataset: ind.dataset ? {
        ...ind.dataset,
        status: this.isConfigured() ? "Official" : "Verified"
      } : null
    };
  }

  async getDataPoints(filters: {
    indicatorCode?: string;
    indicatorId?: string;
    regionId?: string;
    year?: number;
  }): Promise<any[]> {
    // If not configured, immediately use mock data
    if (!this.isConfigured()) {
      return this.fallbackProvider.getDataPoints(filters);
    }

    const code = filters.indicatorCode || "POVERTY_RATE";
    const bpsVar = BPS_VARIABLES[code];

    // If indicator is not supported by BPS direct API, fall back to mock
    if (!bpsVar) {
      return this.fallbackProvider.getDataPoints(filters);
    }

    try {
      // 0000 = National Domain (covers all provinces)
      const url = `${this.apiBaseUrl}/list/model/data/lang/ind/domain/0000/var/${bpsVar.id}/key/${this.apiKey}/`;
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`BPS API request failed with status ${res.status}`);
      }

      const json = await res.json();
      if (json.status !== "OK" || !json.datacontent) {
        throw new Error(`BPS API returned error status: ${json.feedback || "Unknown"}`);
      }

      const parsedPoints: any[] = [];
      const vervarList = json.vervar || [];
      const tahunList = json.tahun || [];
      const content = json.datacontent;

      // Extract indicators reference
      const localIndicator = await this.fallbackProvider.getIndicatorByCode(code);
      const indicatorId = localIndicator ? localIndicator.id : "ind-populasi";

      // Parse BPS datacontent which keys values as: {var_id}{vervar_id}{year_id}
      vervarList.forEach((province: any) => {
        const provSlug = this.normalizeRegionName(province.label);
        
        // Filter by region if requested
        if (filters.regionId && filters.regionId !== provSlug) return;

        tahunList.forEach((yr: any) => {
          const yearNum = parseInt(yr.label);
          
          // Filter by year if requested
          if (filters.year && filters.year !== yearNum) return;

          const key = `${bpsVar.id}${province.val}${yr.val}`;
          const val = content[key];

          if (val !== undefined && val !== null) {
            parsedPoints.push({
              id: `bps-${bpsVar.id}-${province.val}-${yr.val}`,
              regionId: provSlug,
              regionName: province.label,
              indicatorId,
              year: yearNum,
              value: parseFloat(val)
            });
          }
        });
      });

      // If nothing matches but filters were passed, return empty or fallback
      if (parsedPoints.length === 0) {
        return this.fallbackProvider.getDataPoints(filters);
      }

      return parsedPoints;
    } catch (err) {
      console.warn("Error calling BPS API, falling back to mock data provider:", err);
      return this.fallbackProvider.getDataPoints(filters);
    }
  }

  async getNationalOverview(year: number): Promise<any> {
    // Check if configured, otherwise use mock overview
    if (!this.isConfigured()) {
      return this.fallbackProvider.getNationalOverview(year);
    }

    const overview: Record<string, any> = {};
    const codes = Object.keys(BPS_VARIABLES);

    for (const code of codes) {
      const points = await this.getDataPoints({ indicatorCode: code, year });
      if (points.length === 0) {
        overview[code] = { value: 0, change: 0, unit: "%", source: "BPS" };
        continue;
      }

      // Calculate average/sum
      const isSumMode = ["POPULATION", "UMKM_COUNT"].includes(code);
      const sum = points.reduce((acc, curr) => acc + curr.value, 0);
      const currentVal = isSumMode ? sum : sum / points.length;

      // Calculate previous year for trends
      const prevPoints = await this.getDataPoints({ indicatorCode: code, year: year - 1 });
      let change = 0;
      if (prevPoints.length > 0) {
        const prevSum = prevPoints.reduce((acc, curr) => acc + curr.value, 0);
        const prevVal = isSumMode ? prevSum : prevSum / prevPoints.length;
        if (prevVal > 0) {
          change = ((currentVal - prevVal) / prevVal) * 100;
        }
      }

      overview[code] = {
        value: currentVal,
        change,
        unit: BPS_VARIABLES[code].unit,
        source: "BPS Web API",
        status: "Official"
      };
    }

    return overview;
  }

  async getRanking(indicatorCode: string, year: number, limit?: number): Promise<any[]> {
    const points = await this.getDataPoints({ indicatorCode, year });
    const prevPoints = await this.getDataPoints({ indicatorCode, year: year - 1 });

    const rankings = points.map((dp) => {
      const prevDp = prevPoints.find((p) => p.regionId === dp.regionId);
      let changeSymbol = "—";
      let diff = 0;

      if (prevDp) {
        diff = dp.value - prevDp.value;
        if (diff > 0.001) changeSymbol = "UP";
        else if (diff < -0.001) changeSymbol = "DOWN";
      }

      return {
        regionId: dp.regionId,
        regionName: dp.regionName,
        value: dp.value,
        prevValue: prevDp ? prevDp.value : null,
        change: changeSymbol,
        diff,
      };
    });

    const isPovertyOrUnemployment = ["POVERTY_RATE", "UNEMPLOYMENT_RATE"].includes(indicatorCode);
    rankings.sort((a, b) => isPovertyOrUnemployment ? a.value - b.value : b.value - a.value);

    return rankings.slice(0, limit);
  }

  async getComparison(regionIds: string[], indicatorCodes: string[], year: number): Promise<any> {
    const result: Record<string, Record<string, number>> = {};

    for (const rId of regionIds) {
      result[rId] = {};
      for (const code of indicatorCodes) {
        const points = await this.getDataPoints({ indicatorCode: code, regionId: rId, year });
        result[rId][code] = points.length > 0 ? points[0].value : 0;
      }
    }

    return result;
  }

  async search(query: string): Promise<{
    regions: any[];
    datasets: any[];
    indicators: any[];
  }> {
    return this.fallbackProvider.search(query);
  }

  async importDataset(metadata: any, dataPoints: any[]): Promise<any> {
    return this.fallbackProvider.importDataset(metadata, dataPoints);
  }
}

export class GovernmentDataProvider implements DataProvider {
  private bpsProvider: BPSProvider;
  constructor() {
    this.bpsProvider = new BPSProvider();
  }
  async getRegions() { return this.bpsProvider.getRegions(); }
  async getRegion(id: string) { return this.bpsProvider.getRegion(id); }
  async getDatasets(category?: string) { return this.bpsProvider.getDatasets(category); }
  async getDataset(id: string) { return this.bpsProvider.getDataset(id); }
  async getIndicators() { return this.bpsProvider.getIndicators(); }
  async getIndicatorByCode(code: string) { return this.bpsProvider.getIndicatorByCode(code); }
  async getDataPoints(filters: any) { return this.bpsProvider.getDataPoints(filters); }
  async getNationalOverview(year: number) { return this.bpsProvider.getNationalOverview(year); }
  async getRanking(indicatorCode: string, year: number, limit?: number) { return this.bpsProvider.getRanking(indicatorCode, year, limit); }
  async getComparison(regionIds: string[], indicatorCodes: string[], year: number) { return this.bpsProvider.getComparison(regionIds, indicatorCodes, year); }
  async search(query: string) { return this.bpsProvider.search(query); }
  async importDataset(metadata: any, dataPoints: any) { return this.bpsProvider.importDataset(metadata, dataPoints); }
}
