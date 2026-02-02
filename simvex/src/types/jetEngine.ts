export interface EngineParams {
  throttle: number;        // 0-100%
  altitude: number;        // 0-45000 ft
  machNumber: number;      // 0-0.9
  bypassRatio: number;     // 5-12
}

export interface EngineOutput {
  thrust: number;          // kN
  fuelFlow: number;        // kg/h
  sfc: number;             // kg/(kN·h) - Specific Fuel Consumption
  n1: number;              // Fan speed %
  n2: number;              // Core speed %
  egt: number;             // Exhaust Gas Temperature °C
  airflow: number;         // kg/s
  pressureRatio: number;   // Overall Pressure Ratio
}

export interface EngineSection {
  id: string;
  name: string;
  description: string;
  color: string;
  temperature: number;     // °C
  pressure: number;        // bar
}

export const ENGINE_SECTIONS: EngineSection[] = [
  { id: 'inlet', name: 'Inlet', description: 'Air intake', color: '#60A5FA', temperature: 15, pressure: 1 },
  { id: 'fan', name: 'Fan', description: 'Large front fan', color: '#34D399', temperature: 50, pressure: 1.6 },
  { id: 'lpc', name: 'LPC', description: 'Low Pressure Compressor', color: '#22D3EE', temperature: 150, pressure: 4 },
  { id: 'hpc', name: 'HPC', description: 'High Pressure Compressor', color: '#818CF8', temperature: 450, pressure: 35 },
  { id: 'combustor', name: 'Combustor', description: 'Combustion Chamber', color: '#F97316', temperature: 1500, pressure: 34 },
  { id: 'hpt', name: 'HPT', description: 'High Pressure Turbine', color: '#EF4444', temperature: 1200, pressure: 8 },
  { id: 'lpt', name: 'LPT', description: 'Low Pressure Turbine', color: '#F59E0B', temperature: 800, pressure: 2 },
  { id: 'nozzle', name: 'Nozzle', description: 'Exhaust nozzle', color: '#EC4899', temperature: 600, pressure: 1 },
];

export const DEFAULT_ENGINE_PARAMS: EngineParams = {
  throttle: 50,
  altitude: 0,
  machNumber: 0,
  bypassRatio: 8,
};

// Simplified engine performance calculation
export function calculateEngineOutput(params: EngineParams): EngineOutput {
  const { throttle, altitude, machNumber, bypassRatio } = params;

  // Atmospheric corrections
  const altitudeFactor = Math.exp(-altitude / 30000); // Density decreases with altitude
  const ramFactor = 1 + 0.2 * machNumber * machNumber; // Ram pressure recovery

  // Base performance at sea level, static
  const baseThrust = 280; // kN (like CFM56 class engine)
  const baseFuelFlow = 3000; // kg/h at max thrust
  const baseAirflow = 400; // kg/s

  // Throttle effect (non-linear)
  const throttleFactor = Math.pow(throttle / 100, 1.5);

  // Calculate outputs
  const thrust = baseThrust * throttleFactor * altitudeFactor * ramFactor;
  const fuelFlow = baseFuelFlow * throttleFactor * Math.sqrt(altitudeFactor);
  const sfc = thrust > 0 ? fuelFlow / thrust : 0;

  const n1 = 25 + (throttle * 0.75); // 25-100%
  const n2 = 60 + (throttle * 0.40); // 60-100%

  // EGT increases with throttle, decreases slightly with altitude (cooler air)
  const egt = 300 + (throttle * 5.5) - (altitude / 100);

  const airflow = baseAirflow * throttleFactor * altitudeFactor;
  const pressureRatio = 10 + (throttle / 100) * 30; // 10-40

  return {
    thrust: Math.max(0, thrust),
    fuelFlow: Math.max(0, fuelFlow),
    sfc: Math.max(0, sfc),
    n1: Math.min(100, n1),
    n2: Math.min(100, n2),
    egt: Math.max(200, Math.min(900, egt)),
    airflow: Math.max(0, airflow),
    pressureRatio,
  };
}

// Get section properties based on throttle
export function getSectionProperties(sectionId: string, throttle: number): { temperature: number; pressure: number } {
  const section = ENGINE_SECTIONS.find(s => s.id === sectionId);
  if (!section) return { temperature: 15, pressure: 1 };

  const throttleFactor = throttle / 100;

  // Temperature and pressure scale with throttle
  const tempRange = {
    inlet: [15, 40],
    fan: [30, 80],
    lpc: [80, 250],
    hpc: [250, 600],
    combustor: [800, 1600],
    hpt: [700, 1300],
    lpt: [400, 900],
    nozzle: [300, 700],
  };

  const pressRange = {
    inlet: [1, 1.2],
    fan: [1.2, 1.8],
    lpc: [1.8, 5],
    hpc: [5, 40],
    combustor: [38, 38],
    hpt: [8, 10],
    lpt: [2, 3],
    nozzle: [1, 1.5],
  };

  const temps = tempRange[sectionId as keyof typeof tempRange] || [15, 100];
  const press = pressRange[sectionId as keyof typeof pressRange] || [1, 2];

  return {
    temperature: temps[0] + (temps[1] - temps[0]) * throttleFactor,
    pressure: press[0] + (press[1] - press[0]) * throttleFactor,
  };
}
