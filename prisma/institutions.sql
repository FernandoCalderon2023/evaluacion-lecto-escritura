CREATE TABLE IF NOT EXISTS "InstitucionPlan" (
 "id" TEXT NOT NULL PRIMARY KEY,
 "nombre" TEXT NOT NULL,
 "limiteUsuarios" INTEGER NOT NULL DEFAULT 10,
 "usuariosUsados" INTEGER NOT NULL DEFAULT 0,
 "limiteEvaluaciones" INTEGER NOT NULL DEFAULT 15,
 "evaluacionesUsadas" INTEGER NOT NULL DEFAULT 0,
 "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "InstitucionMiembro" (
 "usuarioId" TEXT NOT NULL PRIMARY KEY,
 "institucionId" TEXT NOT NULL,
 "gestor" BOOLEAN NOT NULL DEFAULT false,
 "evaluacionesUsadas" INTEGER NOT NULL DEFAULT 0,
 "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "InstitucionMiembro_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "InstitucionPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "InstitucionMiembro_institucionId_idx" ON "InstitucionMiembro"("institucionId");
