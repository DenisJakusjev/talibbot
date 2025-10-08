-- 1) Добавляем колонку временно как NULL
ALTER TABLE "Entry" ADD COLUMN "nicknameLower" TEXT;

-- 2) Заполняем её из существующих данных
UPDATE "Entry"
SET "nicknameLower" = lower("nickname")
WHERE "nicknameLower" IS NULL;

-- 3) Делаем NOT NULL
ALTER TABLE "Entry" ALTER COLUMN "nicknameLower" SET NOT NULL;

-- 4) Индексы/уникальность (названия совпадают с теми, что ожидает Prisma)
CREATE UNIQUE INDEX "Entry_nicknameLower_type_key" ON "Entry"("nicknameLower","type");
-- (если индекс по (nickname,type) уже есть — пропусти следующую строку; если нет — создадим)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'Entry_nickname_type_idx'
  ) THEN
CREATE INDEX "Entry_nickname_type_idx" ON "Entry"("nickname","type");
END IF;
END $$;
