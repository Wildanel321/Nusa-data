import { DataProvider } from "./DataProvider";
import {
  provinces,
  dataSources,
  datasets as initialDatasets,
  indicators as initialIndicators,
  generateMockDataPoints,
  RegionMock,
  DatasetMock,
  IndicatorMock,
  DataPointMock
} from "../data/mockDatasets";

// Module-level state for mock provider to persist imports during app runtime
let mockDatasets = [...initialDatasets];
let mockIndicators = [...initialIndicators];
let mockDataPoints = generateMockDataPoints();

export class MockDataProvider implements DataProvider {
  async getRegions(): Promise<any[]> {
    return provinces;
  }

  async getRegion(id: string): Promise<any | null> {
    const region = provinces.find((p) => p.id === id);
    if (!region) return null;

    // Get cities/regencies count (mocked based on province ID name length)
    const citiesCount = 8 + (region.name.length % 5) * 6;

    return {
      ...region,
      citiesCount,
    };
  }

  async getDatasets(category?: string): Promise<any[]> {
    if (category && category !== "Semua" && category !== "all") {
      return mockDatasets.filter(
        (d) => d.category.toLowerCase() === category.toLowerCase()
      );
    }
    return mockDatasets;
  }

  async getDataset(id: string): Promise<any | null> {
    const dataset = mockDatasets.find((d) => d.id === id);
    if (!dataset) return null;

    const source = dataSources.find((s) => s.id === dataset.dataSourceId) || {
      id: "unknown",
      name: "Sumber Tidak Diketahui",
      url: "#",
    };

    const datasetIndicators = mockIndicators.filter((i) => i.datasetId === dataset.id);

    return {
      ...dataset,
      dataSource: source,
      indicators: datasetIndicators,
    };
  }

  async getIndicators(): Promise<any[]> {
    return mockIndicators;
  }

  async getIndicatorByCode(code: string): Promise<any | null> {
    const indicator = mockIndicators.find((i) => i.code === code);
    if (!indicator) return null;

    const dataset = mockDatasets.find((d) => d.id === indicator.datasetId);

    return {
      ...indicator,
      dataset,
    };
  }

  async getDataPoints(filters: {
    indicatorCode?: string;
    indicatorId?: string;
    regionId?: string;
    year?: number;
  }): Promise<any[]> {
    let list = mockDataPoints;

    if (filters.indicatorCode) {
      const ind = mockIndicators.find((i) => i.code === filters.indicatorCode);
      if (ind) {
        list = list.filter((dp) => dp.indicatorId === ind.id);
      } else {
        return [];
      }
    }

    if (filters.indicatorId) {
      list = list.filter((dp) => dp.indicatorId === filters.indicatorId);
    }

    if (filters.regionId) {
      list = list.filter((dp) => dp.regionId === filters.regionId);
    }

    if (filters.year) {
      list = list.filter((dp) => dp.year === filters.year);
    }

    // Map region names for convenience
    return list.map((dp) => {
      const region = provinces.find((p) => p.id === dp.regionId);
      return {
        ...dp,
        regionName: region ? region.name : dp.regionId,
      };
    });
  }

  async getNationalOverview(year: number): Promise<any> {
    const overview: Record<string, any> = {};

    // Helper to get average or sum value for an indicator
    const getStats = (code: string, mode: "sum" | "avg" = "avg") => {
      const ind = mockIndicators.find((i) => i.code === code);
      if (!ind) return { value: 0, change: 0 };

      const currentPoints = mockDataPoints.filter((dp) => dp.indicatorId === ind.id && dp.year === year);
      const prevPoints = mockDataPoints.filter((dp) => dp.indicatorId === ind.id && dp.year === year - 1);

      if (currentPoints.length === 0) return { value: 0, change: 0 };

      let currentVal = 0;
      let prevVal = 0;

      if (mode === "sum") {
        currentVal = currentPoints.reduce((acc, curr) => acc + curr.value, 0);
        prevVal = prevPoints.reduce((acc, curr) => acc + curr.value, 0);
      } else {
        currentVal = currentPoints.reduce((acc, curr) => acc + curr.value, 0) / currentPoints.length;
        prevVal = prevPoints.reduce((acc, curr) => acc + curr.value, 0) / prevPoints.length;
      }

      let change = 0;
      if (prevVal > 0) {
        change = ((currentVal - prevVal) / prevVal) * 100;
      }

      return {
        value: currentVal,
        change,
        unit: mockDatasets.find((d) => d.id === ind.datasetId)?.unit || "",
        source: dataSources.find((s) => s.id === mockDatasets.find((d) => d.id === ind.datasetId)?.dataSourceId)?.name || "BPS",
      };
    };

    overview["POPULATION"] = getStats("POPULATION", "sum");
    overview["POVERTY_RATE"] = getStats("POVERTY_RATE", "avg");
    overview["LITERACY_RATE"] = getStats("LITERACY_RATE", "avg");
    overview["INTERNET_ACCESS"] = getStats("INTERNET_ACCESS", "avg");
    overview["HEALTH_FACILITIES"] = getStats("HEALTH_FACILITIES", "sum");
    overview["UMKM_COUNT"] = getStats("UMKM_COUNT", "sum");

    return overview;
  }

  async getRanking(indicatorCode: string, year: number, limit: number = 10): Promise<any[]> {
    const ind = mockIndicators.find((i) => i.code === indicatorCode);
    if (!ind) return [];

    const currentPoints = mockDataPoints.filter((dp) => dp.indicatorId === ind.id && dp.year === year);
    const prevPoints = mockDataPoints.filter((dp) => dp.indicatorId === ind.id && dp.year === year - 1);

    const rankings = currentPoints.map((dp) => {
      const region = provinces.find((p) => p.id === dp.regionId);
      const prevDp = prevPoints.find((p) => p.regionId === dp.regionId);

      let changeSymbol = "—";
      let diff = 0;

      if (prevDp) {
        diff = dp.value - prevDp.value;
        if (diff > 0.001) {
          changeSymbol = "UP";
        } else if (diff < -0.001) {
          changeSymbol = "DOWN";
        }
      }

      return {
        regionId: dp.regionId,
        regionName: region ? region.name : dp.regionId,
        value: dp.value,
        prevValue: prevDp ? prevDp.value : null,
        change: changeSymbol,
        diff,
      };
    });

    // Sort descending for positive indicators, ascending for poverty/unemployment
    const reverseSortCodes = ["POVERTY_RATE", "UNEMPLOYMENT_RATE"];
    const isPovertyOrUnemployment = reverseSortCodes.includes(indicatorCode);

    rankings.sort((a, b) => {
      return isPovertyOrUnemployment ? a.value - b.value : b.value - a.value;
    });

    return rankings.slice(0, limit);
  }

  async getComparison(regionIds: string[], indicatorCodes: string[], year: number): Promise<any> {
    const result: Record<string, Record<string, number>> = {};

    for (const rId of regionIds) {
      result[rId] = {};
      for (const code of indicatorCodes) {
        const ind = mockIndicators.find((i) => i.code === code);
        if (ind) {
          const dp = mockDataPoints.find(
            (p) => p.regionId === rId && p.indicatorId === ind.id && p.year === year
          );
          result[rId][code] = dp ? dp.value : 0;
        } else {
          result[rId][code] = 0;
        }
      }
    }

    return result;
  }

  async search(query: string): Promise<{
    regions: any[];
    datasets: any[];
    indicators: any[];
  }> {
    const q = query.toLowerCase().trim();
    if (!q) {
      return { regions: [], datasets: [], indicators: [] };
    }

    const matchedRegions = provinces.filter((p) => p.name.toLowerCase().includes(q));
    const matchedDatasets = mockDatasets.filter(
      (d) => d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)
    );
    const matchedIndicators = mockIndicators.filter((i) => i.name.toLowerCase().includes(q));

    return {
      regions: matchedRegions,
      datasets: matchedDatasets,
      indicators: matchedIndicators,
    };
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
    // Generate new IDs
    const datasetId = `ds-import-${Date.now()}`;
    const indicatorId = `ind-import-${Date.now()}`;
    const indicatorCode = `IMPORT_${metadata.title.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`;

    // Add to in-memory state
    const newDataset: DatasetMock = {
      id: datasetId,
      title: metadata.title,
      description: metadata.description,
      category: metadata.category.toUpperCase(),
      status: "Demo", // Mock uploaded is marked as Demo
      unit: metadata.unit,
      methodology: metadata.methodology || "",
      dataSourceId: metadata.dataSourceId,
    };

    const newIndicator: IndicatorMock = {
      id: indicatorId,
      name: metadata.title,
      code: indicatorCode,
      datasetId: datasetId,
    };

    mockDatasets.push(newDataset);
    mockIndicators.push(newIndicator);

    // Add data points
    let pointCounter = mockDataPoints.length + 1;
    const newPoints = dataPoints.map((p) => ({
      id: `dp-import-${pointCounter++}`,
      regionId: p.regionId,
      indicatorId: indicatorId,
      year: p.year,
      value: p.value,
    }));

    mockDataPoints.push(...newPoints);

    return {
      success: true,
      datasetId,
      indicatorId,
      indicatorCode,
      pointsCount: newPoints.length,
    };
  }
}
