-- AlterTable
ALTER TABLE "trips" ADD COLUMN "currentLat" REAL;
ALTER TABLE "trips" ADD COLUMN "currentLng" REAL;
ALTER TABLE "trips" ADD COLUMN "lastLocationUpdate" DATETIME;
