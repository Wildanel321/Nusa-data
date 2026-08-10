import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { provinces, dataSources, datasets, indicators, generateMockDataPoints } from "../lib/data/mockDatasets";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/nusadata?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Wiping existing database records...");
  await prisma.dataPoint.deleteMany();
  await prisma.indicator.deleteMany();
  await prisma.dataset.deleteMany();
  await prisma.dataSource.deleteMany();
  await prisma.region.deleteMany();

  console.log("Seeding DataSources...");
  for (const ds of dataSources) {
    await prisma.dataSource.create({
      data: {
        id: ds.id,
        name: ds.name,
        url: ds.url,
      },
    });
  }

  console.log("Seeding Regions (Provinces)...");
  for (const reg of provinces) {
    await prisma.region.create({
      data: {
        id: reg.id,
        name: reg.name,
        type: reg.type,
        area: reg.area,
        latitude: reg.latitude,
        longitude: reg.longitude,
      },
    });
  }

  console.log("Seeding Datasets...");
  for (const d of datasets) {
    await prisma.dataset.create({
      data: {
        id: d.id,
        title: d.title,
        description: d.description,
        category: d.category,
        status: "Demo", // Seeded mock data is labeled as Demo for transparency
        unit: d.unit,
        methodology: d.methodology,
        dataSourceId: d.dataSourceId,
      },
    });
  }

  console.log("Seeding Indicators...");
  for (const ind of indicators) {
    await prisma.indicator.create({
      data: {
        id: ind.id,
        name: ind.name,
        code: ind.code,
        datasetId: ind.datasetId,
      },
    });
  }

  console.log("Generating DataPoints...");
  const points = generateMockDataPoints();
  console.log(`Seeding ${points.length} DataPoints in batches of 500...`);

  const chunkSize = 500;
  for (let i = 0; i < points.length; i += chunkSize) {
    const chunk = points.slice(i, i + chunkSize);
    await prisma.dataPoint.createMany({
      data: chunk.map((p) => ({
        regionId: p.regionId,
        indicatorId: p.indicatorId,
        year: p.year,
        value: p.value,
      })),
    });
  }

  console.log("Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
