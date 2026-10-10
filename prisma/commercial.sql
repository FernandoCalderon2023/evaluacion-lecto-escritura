-- Additive, idempotent migration. Does not alter existing accounts.
CREATE TABLE IF NOT EXISTS "AccesoComercial" (
    "usuarioId" TEXT NOT NULL PRIMARY KEY,
    "estado" TEXT NOT NULL DEFAULT 'PRUEBA',
    "estudiantesUsados" INTEGER NOT NULL DEFAULT 0,
    "evaluacionesUsadas" INTEGER NOT NULL DEFAULT 0,
    "solicitadoEn" DATETIME,
    "telefono" TEXT,
    "organizacion" TEXT,
    "mensaje" TEXT,
    "activadoEn" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AccesoComercial_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "RegistroVentana" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "intentos" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "AvisoSistema" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "destinatario" TEXT NOT NULL,
    "asunto" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "bloqueoHasta" DATETIME,
    "enviadoEn" DATETIME,
    "proveedorId" TEXT,
    "ultimoError" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "AvisoSistema_estado_createdAt_idx" ON "AvisoSistema"("estado", "createdAt");
