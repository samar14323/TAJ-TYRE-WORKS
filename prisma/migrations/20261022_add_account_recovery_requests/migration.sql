-- CreateEnum
CREATE TYPE "RecoveryRequestType" AS ENUM ('FORGOT_USERNAME', 'FORGOT_PASSWORD', 'CHANGE_USERNAME');

-- CreateEnum
CREATE TYPE "RecoveryRequestStatus" AS ENUM ('Pending', 'Approved', 'Rejected');

-- CreateTable
CREATE TABLE IF NOT EXISTS "AccountRecoveryRequest" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "type" "RecoveryRequestType" NOT NULL,
    "status" "RecoveryRequestStatus" NOT NULL DEFAULT 'Pending',
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "vehicleNumber" TEXT NOT NULL,
    "invoiceNumber" TEXT,
    "desiredUsername" TEXT,
    "notes" TEXT,
    "customerId" TEXT,
    "adminNote" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "resetCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountRecoveryRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AccountRecoveryRequest_requestId_key" ON "AccountRecoveryRequest"("requestId");
CREATE UNIQUE INDEX IF NOT EXISTS "AccountRecoveryRequest_resetToken_key" ON "AccountRecoveryRequest"("resetToken");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'AccountRecoveryRequest_customerId_fkey'
    ) THEN
        ALTER TABLE "AccountRecoveryRequest" ADD CONSTRAINT "AccountRecoveryRequest_customerId_fkey" 
        FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
