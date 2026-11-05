import { highCapacityStore } from '../storage/highCapacityStore';

export interface GeofenceHub {
  id: string;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  dockCount: number;
  activeVehiclesInside: number;
  vehiclesApproaching: number;
}

export interface VehicleGeofenceStatus {
  vehicleId: string;
  driverName: string;
  routeName: string;
  latitude: number;
  longitude: number;
  speedKmh: number;
  closestHub: string;
  distanceKm: number;
  status: 'INSIDE_ZONE' | 'APPROACHING' | 'ON_HIGHWAY';
  statusLabel: string;
  etaMinutes: number | null;
  assignedDock: string;
}

export class GeofenceEngine {
  private static instance: GeofenceEngine;

  private hubs: GeofenceHub[] = [
    {
      id: 'hub_cajamar',
      name: 'CD Central Loggi Cajamar',
      code: 'CD-CAJ',
      latitude: -23.3556,
      longitude: -46.8778,
      radiusKm: 12.0,
      dockCount: 32,
      activeVehiclesInside: 0,
      vehiclesApproaching: 0
    },
    {
      id: 'hub_leopoldina',
      name: 'Polo Regional Leopoldina / Jaguaré',
      code: 'HUB-LEO',
      latitude: -23.5329,
      longitude: -46.7264,
      radiusKm: 8.0,
      dockCount: 16,
      activeVehiclesInside: 0,
      vehiclesApproaching: 0
    },
    {
      id: 'hub_campinas',
      name: 'Hub Loggi Campinas / Interior',
      code: 'HUB-CPQ',
      latitude: -22.9056,
      longitude: -47.0608,
      radiusKm: 10.0,
      dockCount: 14,
      activeVehiclesInside: 0,
      vehiclesApproaching: 0
    },
    {
      id: 'hub_pavuna',
      name: 'CD Metropolitano Pavuna / RJ',
      code: 'CD-RIO',
      latitude: -22.8122,
      longitude: -43.3644,
      radiusKm: 8.0,
      dockCount: 18,
      activeVehiclesInside: 0,
      vehiclesApproaching: 0
    }
  ];

  private constructor() {}

  public static getInstance(): GeofenceEngine {
    if (!GeofenceEngine.instance) {
      GeofenceEngine.instance = new GeofenceEngine();
    }
    return GeofenceEngine.instance;
  }

  /**
   * Cálculo de distância ortodrômica Haversine entre dois pontos em km
   */
  public calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Avalia a posição atual de toda a frota contra as cercas virtuais dos polos
   */
  public evaluateFleetGeofencing(): {
    hubs: GeofenceHub[];
    vehicles: VehicleGeofenceStatus[];
    summary: { totalVehicles: number; insideCount: number; approachingCount: number; transitCount: number };
  } {
    const rawFleet = highCapacityStore.getFleetLocations();

    // Reseta contadores dos polos
    const hubsCopy = this.hubs.map(h => ({ ...h, activeVehiclesInside: 0, vehiclesApproaching: 0 }));

    const vehicles: VehicleGeofenceStatus[] = [];
    let insideCount = 0;
    let approachingCount = 0;
    let transitCount = 0;

    for (const v of rawFleet) {
      let closestHub = hubsCopy[0];
      let minDistance = 999999;

      for (const h of hubsCopy) {
        const dist = this.calculateDistanceKm(v.latitude, v.longitude, h.latitude, h.longitude);
        if (dist < minDistance) {
          minDistance = dist;
          closestHub = h;
        }
      }

      let status: 'INSIDE_ZONE' | 'APPROACHING' | 'ON_HIGHWAY' = 'ON_HIGHWAY';
      let statusLabel = 'Em Rodovia';
      let etaMinutes: number | null = null;

      if (minDistance <= closestHub.radiusKm) {
        status = 'INSIDE_ZONE';
        statusLabel = `Dentro da Cerca (${closestHub.code})`;
        insideCount++;
        closestHub.activeVehiclesInside++;
      } else if (minDistance <= closestHub.radiusKm + 18.0) {
        status = 'APPROACHING';
        statusLabel = `Em Aproximação (< ${Math.round(minDistance)}km)`;
        approachingCount++;
        closestHub.vehiclesApproaching++;

        const speed = v.speed_kmh > 15 ? v.speed_kmh : 50;
        etaMinutes = Math.round((minDistance / speed) * 60);
      } else {
        transitCount++;
      }

      // Atribuição de doca baseada no ID do veículo
      const dockNum = (Math.abs(v.vehicle_id.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0)) % closestHub.dockCount) + 1;
      const assignedDock = `Doca ${String(dockNum).padStart(2, '0')}`;

      vehicles.push({
        vehicleId: v.vehicle_id,
        driverName: v.driver_name,
        routeName: v.route_name,
        latitude: v.latitude,
        longitude: v.longitude,
        speedKmh: v.speed_kmh,
        closestHub: closestHub.name,
        distanceKm: minDistance,
        status,
        statusLabel,
        etaMinutes,
        assignedDock
      });
    }

    return {
      hubs: hubsCopy,
      vehicles,
      summary: {
        totalVehicles: vehicles.length,
        insideCount,
        approachingCount,
        transitCount
      }
    };
  }
}

export const geofenceEngine = GeofenceEngine.getInstance();
