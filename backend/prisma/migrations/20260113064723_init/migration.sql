-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ride_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "pickupAddress" TEXT NOT NULL,
    "pickupLat" REAL NOT NULL,
    "pickupLng" REAL NOT NULL,
    "desiredPickupTime" DATETIME NOT NULL,
    "dropoffAddress" TEXT NOT NULL,
    "dropoffLat" REAL NOT NULL,
    "dropoffLng" REAL NOT NULL,
    "returnAddress" TEXT NOT NULL,
    "returnLat" REAL NOT NULL,
    "returnLng" REAL NOT NULL,
    "desiredReturnTime" DATETIME NOT NULL,
    "homeAddress" TEXT NOT NULL,
    "homeLat" REAL NOT NULL,
    "homeLng" REAL NOT NULL,
    "passengerCount" INTEGER NOT NULL DEFAULT 1,
    "specialRequests" TEXT,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ride_requests_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "trips" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleId" TEXT NOT NULL,
    "driverId" TEXT,
    "direction" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "totalDistance" REAL,
    "estimatedDuration" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "trips_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "trips_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stops" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "stopType" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "scheduledTime" DATETIME NOT NULL,
    "actualTime" DATETIME,
    "customerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "stops_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "outboundTripId" TEXT,
    "pickupTime" DATETIME NOT NULL,
    "dropoffTime" DATETIME NOT NULL,
    "returnTripId" TEXT,
    "returnPickupTime" DATETIME NOT NULL,
    "returnDropoffTime" DATETIME NOT NULL,
    "estimatedPrice" REAL NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "proposals_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ride_requests" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "outboundTripId" TEXT,
    "returnTripId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "totalPrice" REAL NOT NULL,
    "paidAmount" REAL NOT NULL DEFAULT 0,
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT,
    "cancelledAt" DATETIME,
    "cancellationFee" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "bookings_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ride_requests" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bookings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bookings_outboundTripId_fkey" FOREIGN KEY ("outboundTripId") REFERENCES "trips" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "isMock" BOOLEAN NOT NULL DEFAULT true,
    "mockReference" TEXT,
    "paymentMethod" TEXT,
    "pgProvider" TEXT,
    "pgTransactionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_licensePlate_key" ON "vehicles"("licensePlate");
