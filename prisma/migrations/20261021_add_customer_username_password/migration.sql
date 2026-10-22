-- AlterTable
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "username" TEXT,
ADD COLUMN IF NOT EXISTS "password" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Customer_username_key" ON "Customer"("username");
