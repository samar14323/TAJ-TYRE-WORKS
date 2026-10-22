-- CreateEnum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CorrectionField') THEN
        CREATE TYPE "CorrectionField" AS ENUM ('MOBILE_NUMBER', 'VEHICLE_NUMBER');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CorrectionStatus') THEN
        CREATE TYPE "CorrectionStatus" AS ENUM ('Pending', 'Approved', 'Rejected');
    END IF;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "ProfileCorrectionRequest" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "field" "CorrectionField" NOT NULL,
    "currentValue" TEXT NOT NULL,
    "requestedValue" TEXT NOT NULL,
    "reason" TEXT,
    "status" "CorrectionStatus" NOT NULL DEFAULT 'Pending',
    "adminNote" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileCorrectionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ProfileCorrectionRequest_requestId_key" ON "ProfileCorrectionRequest"("requestId");
CREATE INDEX IF NOT EXISTS "ProfileCorrectionRequest_customerId_idx" ON "ProfileCorrectionRequest"("customerId");
CREATE INDEX IF NOT EXISTS "ProfileCorrectionRequest_status_idx" ON "ProfileCorrectionRequest"("status");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ProfileCorrectionRequest_customerId_fkey'
    ) THEN
        ALTER TABLE "ProfileCorrectionRequest" ADD CONSTRAINT "ProfileCorrectionRequest_customerId_fkey" 
        FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
