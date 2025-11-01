import type { NextFunction, Request, Response } from 'express';
import { vehicleService } from '../services/vehicle.service';
import { createHttpError } from '../utils/http-error';

export async function saveVehicles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Unauthorized');
    }

    const vehicles = await vehicleService.upsertVehicles(
      req.user.id,
      req.body.vehicles.map((vehicle: any) => ({
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        price: vehicle.price,
        mileage: vehicle.mileage ?? null,
        vin: vehicle.vin ?? null,
        images: vehicle.images ?? [],
        features: vehicle.features ?? [],
        description: vehicle.description,
        sourceUrl: vehicle.sourceUrl,
        scrapedAt: vehicle.scrapedAt ? new Date(vehicle.scrapedAt) : undefined,
      })),
    );

    res.status(200).json({ vehicles });
  } catch (error) {
    next(error);
  }
}

export async function getVehicles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Unauthorized');
    }

    const vehicles = await vehicleService.listVehiclesByUser(req.user.id);
    res.status(200).json({ vehicles });
  } catch (error) {
    next(error);
  }
}

export async function deleteVehicle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw createHttpError(401, 'Unauthorized');
    }

    await vehicleService.deleteVehicle(req.user.id, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

