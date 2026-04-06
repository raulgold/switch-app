-- CreateTable
CREATE TABLE "diarias_bonus_pendentes" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "semanas_marco" INTEGER NOT NULL,
    "local" TEXT,
    "data_diaria" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diarias_bonus_pendentes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "diarias_bonus_pendentes" ADD CONSTRAINT "diarias_bonus_pendentes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
