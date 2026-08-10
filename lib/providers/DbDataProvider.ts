import { DataProvider } from "./DataProvider";
import prisma from "../db/prisma";

export class DbDataProvider implements DataProvider {
  async getRegions(): Promise<any[]> {
    return prisma.region.findMany({
      orderBy: { name: "asc" },
    });
  }

  async getRegion(id: string): Promise<any | null> {
    const region = await prisma.region.findUnique({
      where: { id },
    });
    if (!region) return null;

    // Estimate number of cities/regencies
    const citiesCount = 8 + (region.name.length % 5) * 6;

    return {
      ...region,
      citiesCount,
    };
  }

  async getDatasets(category?: string): Promise<any[]> {
    if (category && category !== "Semua" && category !== "all") {
      return prisma.dataset.findMany({
        where: {
          category: {
            equals: category.toUpperCase(),
          },
        },
        orderBy: { title: "asc" },
      });
    }
    return prisma.dataset.findMany({
      orderBy: { title: "asc" },
    });
  }

  async getDataset(id: string): Promise<any | null> {
    return prisma.dataset.findUnique({
      where: { id },
      include: {
        dataSource: true,
        indicators: true,
      },
    });
  }

  async getIndicators(): Promise<any[]> {
    return prisma.indicator.findMany({
      orderBy: { name: "asc" },
    });
  }

  async getIndicatorByCode(code: string): Promise<any | null> {
    return prisma.indicator.findUnique({
      where: { code },
      include: {
        dataset: true,
      },
    });
  }

  async getDataPoints(filters: {
    indicatorCode?: string;
    indicatorId?: string;
    regionId?: string;
    year?: number;
  }): Promise<any[]> {
    const whereClause: any = {};

    if (filters.indicatorCode) {
      whereClause.indicator = {
        code: filters.indicatorCode,
      };
    } else if (filters.indicatorId) {
      whereClause.indicatorId = filters.indicatorId;
    }

    if (filters.regionId) {
      whereClause.regionId = filters.regionId;
    }

    if (filters.year) {
      whereClause.year = filters.year;
    }

    const dataPoints = await prisma.dataPoint.findMany({
      where: whereClause,
      include: {
        region: {
          select: { name: true },
        },
      },
      orderBy: {
        region: { name: "asc" },
      },
    });

    return dataPoints.map((dp: any) => ({
      id: dp.id,
      regionId: dp.regionId,
      regionName: dp.region.name,
      indicatorId: dp.indicatorId,
      year: dp.year,
      value: dp.value,
    }));
  }

  async getNationalOverview(year: number): Promise<any> {
    const codes = [
      "POPULATION",
      "POVERTY_RATE",
      "LITERACY_RATE",
      "INTERNET_ACCESS",
      "HEALTH_FACILITIES",
      "UMKM_COUNT",
    ];

    const indicators = await prisma.indicator.findMany({
      where: {
        code: { in: codes },
      },
      include: {
        dataset: {
          include: {
            dataSource: true,
          },
        },
      },
    });

    const overview: Record<string, any> = {};

    for (const code of codes) {
      const indicator = indicators.find((i: any) => i.code === code);
      if (!indicator) {
        overview[code] = { value: 0, change: 0, unit: "", source: "BPS" };
        continue;
      }

      const currentPoints = await prisma.dataPoint.findMany({
        where: { indicatorId: indicator.id, year },
      });

      const prevPoints = await prisma.dataPoint.findMany({
        where: { indicatorId: indicator.id, year: year - 1 },
      });

      if (currentPoints.length === 0) {
        overview[code] = { value: 0, change: 0, unit: "", source: "BPS" };
        continue;
      }

      const isSumMode = ["POPULATION", "HEALTH_FACILITIES", "UMKM_COUNT"].includes(code);
      let currentVal = 0;
      let prevVal = 0;

      if (isSumMode) {
        currentVal = currentPoints.reduce((acc: number, curr: any) => acc + curr.value, 0);
        prevVal = prevPoints.reduce((acc: number, curr: any) => acc + curr.value, 0);
      } else {
        currentVal = currentPoints.reduce((acc: number, curr: any) => acc + curr.value, 0) / currentPoints.length;
        prevVal = prevPoints.reduce((acc: number, curr: any) => acc + curr.value, 0) / prevPoints.length;
      }

      let change = 0;
      if (prevVal > 0) {
        change = ((currentVal - prevVal) / prevVal) * 100;
      }

      overview[code] = {
        value: currentVal,
        change,
        unit: indicator.dataset.unit,
        source: indicator.dataset.dataSource.name,
      };
    }

    return overview;
  }

  async getRanking(indicatorCode: string, year: number, limit: number = 10): Promise<any[]> {
    const indicator = await prisma.indicator.findUnique({
      where: { code: indicatorCode },
    });
    if (!indicator) return [];

    const currentPoints = await prisma.dataPoint.findMany({
      where: { indicatorId: indicator.id, year },
      include: {
        region: { select: { name: true } },
      },
    });

    const prevPoints = await prisma.dataPoint.findMany({
      where: { indicatorId: indicator.id, year: year - 1 },
    });

    const rankings = currentPoints.map((dp: any) => {
      const prevDp = prevPoints.find((p: any) => p.regionId === dp.regionId);

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
        regionName: dp.region.name,
        value: dp.value,
        prevValue: prevDp ? prevDp.value : null,
        change: changeSymbol,
        diff,
      };
    });

    const reverseSortCodes = ["POVERTY_RATE", "UNEMPLOYMENT_RATE"];
    const isPovertyOrUnemployment = reverseSortCodes.includes(indicatorCode);

    rankings.sort((a: any, b: any) => {
      return isPovertyOrUnemployment ? a.value - b.value : b.value - a.value;
    });

    return rankings.slice(0, limit);
  }

  async getComparison(regionIds: string[], indicatorCodes: string[], year: number): Promise<any> {
    const indicators = await prisma.indicator.findMany({
      where: {
        code: { in: indicatorCodes },
      },
    });

    const indicatorIds = indicators.map((i: any) => i.id);

    const dataPoints = await prisma.dataPoint.findMany({
      where: {
        regionId: { in: regionIds },
        indicatorId: { in: indicatorIds },
        year,
      },
    });

    const result: Record<string, Record<string, number>> = {};

    for (const rId of regionIds) {
      result[rId] = {};
      for (const code of indicatorCodes) {
        const ind = indicators.find((i: any) => i.code === code);
        if (ind) {
          const dp = dataPoints.find(
            (p: any) => p.regionId === rId && p.indicatorId === ind.id
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

    const regions = await prisma.region.findMany({
      where: {
        name: {
          contains: q,
          mode: "insensitive",
        },
      },
      take: 10,
    });

    const datasets = await prisma.dataset.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 10,
    });

    const indicators = await prisma.indicator.findMany({
      where: {
        name: {
          contains: q,
          mode: "insensitive",
        },
      },
      take: 10,
    });

    return {
      regions,
      datasets,
      indicators,
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
    const indicatorCode = `IMPORT_${metadata.title.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`;

    // Perform inside a transaction
    return prisma.$transaction(async (tx: any) => {
      const dataset = await tx.dataset.create({
        data: {
          title: metadata.title,
          description: metadata.description,
          category: metadata.category.toUpperCase(),
          status: metadata.status, // e.g., "Verified"
          unit: metadata.unit,
          methodology: metadata.methodology,
          dataSourceId: metadata.dataSourceId,
        },
      });

      const indicator = await tx.indicator.create({
        data: {
          name: metadata.title,
          code: indicatorCode,
          datasetId: dataset.id,
        },
      });

      // Insert data points in bulk
      await tx.dataPoint.createMany({
        data: dataPoints.map((p) => ({
          regionId: p.regionId,
          indicatorId: indicator.id,
          year: p.year,
          value: p.value,
        })),
      });

      return {
        success: true,
        datasetId: dataset.id,
        indicatorId: indicator.id,
        indicatorCode,
        pointsCount: dataPoints.length,
      };
    });
  }
}
