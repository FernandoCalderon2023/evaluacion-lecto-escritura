CREATE TABLE IF NOT EXISTS "RecuperacionPassword" (
    "tokenHash" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "venceEn" DATETIME NOT NULL,
    "usadoEn" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecuperacionPassword_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "RecuperacionPassword_usuarioId_venceEn_idx" ON "RecuperacionPassword"("usuarioId", "venceEn");

CREATE TABLE IF NOT EXISTS "ObservacionFamiliar" (
 "id" TEXT NOT NULL PRIMARY KEY, "usuarioId" TEXT NOT NULL, "alias" TEXT NOT NULL,
 "edad" INTEGER NOT NULL, "respuestas" TEXT NOT NULL,
 "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL,
 FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "ObservacionFamiliar_usuarioId_createdAt_idx" ON "ObservacionFamiliar"("usuarioId", "createdAt");
