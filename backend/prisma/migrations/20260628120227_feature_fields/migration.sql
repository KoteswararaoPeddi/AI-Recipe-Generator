/*
  Warnings:

  - You are about to drop the column `lowStockThreshold` on the `pantry_items` table. All the data in the column will be lost.
  - You are about to drop the column `defaultCuisine` on the `preferences` table. All the data in the column will be lost.
  - You are about to drop the column `defaultDiet` on the `preferences` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "pantry_items" DROP COLUMN "lowStockThreshold",
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Other',
ADD COLUMN     "runningLow" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "preferences" DROP COLUMN "defaultCuisine",
DROP COLUMN "defaultDiet",
ADD COLUMN     "allergies" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "defaultServings" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "dietaryRestrictions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "measurementUnit" TEXT NOT NULL DEFAULT 'metric',
ADD COLUMN     "preferredCuisine" "Cuisine" NOT NULL DEFAULT 'ANY';

-- AlterTable
ALTER TABLE "recipes" ADD COLUMN     "cookMinutes" INTEGER,
ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "dietTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "prepMinutes" INTEGER,
ADD COLUMN     "totalMinutes" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "shopping_items" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Other';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "name" TEXT;
