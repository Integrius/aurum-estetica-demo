-- AlterTable
ALTER TABLE "Professional" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "credentials" TEXT[],
ADD COLUMN     "role" TEXT,
ADD COLUMN     "specialties" TEXT[];

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "coverUrl" TEXT NOT NULL,
    "tags" TEXT[],
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResultCase" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "beforeUrl" TEXT NOT NULL,
    "afterUrl" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "sessions" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResultCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE INDEX "Post_publishedAt_idx" ON "Post"("publishedAt");

-- CreateIndex
CREATE INDEX "ResultCase_serviceId_order_idx" ON "ResultCase"("serviceId", "order");

-- AddForeignKey
ALTER TABLE "ResultCase" ADD CONSTRAINT "ResultCase_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
