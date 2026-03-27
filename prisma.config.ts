import "dotenv/config";
import { defineConfig } from "prisma/config";
import path from "path";

// Turso usa libsql:// en runtime, pero Prisma CLI necesita file: para db push
// Para push remoto, usamos un script separado
const localUrl = "file:" + path.resolve(process.cwd(), "dev.db");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: localUrl,
  },
});
