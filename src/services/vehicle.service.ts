import { Prisma, Vehicle } from '@prisma/client';
import { prisma } from '../config/database';
import { createHttpError } from '../utils/http-error';

export interface VehiclePayload {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage?: number | null;
  vin?: string | null;
  images: string[];
  features: string[];
  description: string;
  sourceUrl: string;
  scrapedAt?: Date;
}

export class VehicleService {
  async upsertVehicles(userId: string, vehicles: VehiclePayload[]): Promise<Vehicle[]> {
    const operations = vehicles.map((vehicle) =>
      prisma.vehicle.upsert({
        where: { id: vehicle.id },
        update: this.toPersistence(vehicle, userId),
        create: this.toPersistence(vehicle, userId),
      }),
    );

    return Promise.all(operations);
  }

  async listVehiclesByUser(userId: string): Promise<Vehicle[]> {
    return prisma.vehicle.findMany({ where: { userId }, orderBy: { scrapedAt: 'desc' } });
  }

  async deleteVehicle(userId: string, vehicleId: string): Promise<void> {
    const deleted = await prisma.vehicle.deleteMany({
      where: {
        id: vehicleId,
        userId,
      },
    });

    if (deleted.count === 0) {
      throw createHttpError(404, 'Vehicle not found');
    }
  }

  private toPersistence(vehicle: VehiclePayload, userId: string): Prisma.VehicleUncheckedCreateInput {
    return {
      id: vehicle.id,
      userId,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      price: new Prisma.Decimal(vehicle.price),
      mileage: vehicle.mileage ?? null,
      vin: vehicle.vin ?? null,
      images: vehicle.images,
      features: vehicle.features,
      description: vehicle.description,
      sourceUrl: vehicle.sourceUrl,
      scrapedAt: vehicle.scrapedAt ?? new Date(),
    };
  }
}

export const vehicleService = new VehicleService();

