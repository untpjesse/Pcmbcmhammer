import React, { useState } from 'react';
import { Power, Fan, Zap, Volume2, Wind, AlertTriangle, Lightbulb, RefreshCw, CarFront, Gauge, Settings, ShieldAlert, Droplets, Thermometer, Battery, Lock, Unlock, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, CircleDashed, Disc, Radio, Speaker, Sun, Moon, Flame, Activity } from 'lucide-react';

interface ActuatorsPanelProps {
  isConnected: boolean;
}

interface Actuator {
  id: string;
  name: string;
  icon: any;
  state: boolean;
  isProcessing?: boolean;
  category: 'Engine' | 'Body' | 'Transmission' | 'Chassis';
  type?: 'toggle' | 'momentary' | 'slider';
}

export function ActuatorsPanel({ isConnected }: ActuatorsPanelProps) {
  const [activeCategory, setActiveCategory] = useState<'Engine' | 'Body' | 'Transmission' | 'Chassis'>('Engine');
  
  const [actuators, setActuators] = useState<Actuator[]>([
    // Engine
    { id: 'fan1', name: 'Radiator Fan (Low)', icon: Fan, state: false, category: 'Engine' },
    { id: 'fan2', name: 'Radiator Fan (High)', icon: Fan, state: false, category: 'Engine' },
    { id: 'fuel', name: 'Fuel Pump Relay', icon: Droplets, state: false, category: 'Engine' },
    { id: 'fuel_pressure', name: 'Fuel Pressure Control', icon: Gauge, state: false, category: 'Engine' },
    { id: 'ac', name: 'A/C Compressor Clutch', icon: Wind, state: false, category: 'Engine' },
    { id: 'mil', name: 'Malfunction Indicator Lamp', icon: Lightbulb, state: false, category: 'Engine' },
    { id: 'evap_purge', name: 'EVAP Purge Solenoid', icon: Thermometer, state: false, category: 'Engine' },
    { id: 'evap_vent', name: 'EVAP Vent Solenoid', icon: Thermometer, state: false, category: 'Engine' },
    { id: 'egr', name: 'EGR Valve Position', icon: Settings, state: false, category: 'Engine' },
    { id: 'iac', name: 'Idle Air Control (IAC)', icon: Wind, state: false, category: 'Engine' },
    { id: 'etc', name: 'Electronic Throttle Control', icon: Gauge, state: false, category: 'Engine' },
    { id: 'inj1', name: 'Injector 1 Disable', icon: Zap, state: false, category: 'Engine' },
    { id: 'inj2', name: 'Injector 2 Disable', icon: Zap, state: false, category: 'Engine' },
    { id: 'inj3', name: 'Injector 3 Disable', icon: Zap, state: false, category: 'Engine' },
    { id: 'inj4', name: 'Injector 4 Disable', icon: Zap, state: false, category: 'Engine' },
    { id: 'inj5', name: 'Injector 5 Disable', icon: Zap, state: false, category: 'Engine' },
    { id: 'inj6', name: 'Injector 6 Disable', icon: Zap, state: false, category: 'Engine' },
    { id: 'inj7', name: 'Injector 7 Disable', icon: Zap, state: false, category: 'Engine' },
    { id: 'inj8', name: 'Injector 8 Disable', icon: Zap, state: false, category: 'Engine' },
    { id: 'coil1', name: 'Ignition Coil 1 Disable', icon: Flame, state: false, category: 'Engine' },
    { id: 'coil2', name: 'Ignition Coil 2 Disable', icon: Flame, state: false, category: 'Engine' },
    { id: 'coil3', name: 'Ignition Coil 3 Disable', icon: Flame, state: false, category: 'Engine' },
    { id: 'coil4', name: 'Ignition Coil 4 Disable', icon: Flame, state: false, category: 'Engine' },
    { id: 'o2_htr_b1s1', name: 'O2 Heater B1S1', icon: Flame, state: false, category: 'Engine' },
    { id: 'o2_htr_b1s2', name: 'O2 Heater B1S2', icon: Flame, state: false, category: 'Engine' },
    { id: 'o2_htr_b2s1', name: 'O2 Heater B2S1', icon: Flame, state: false, category: 'Engine' },
    { id: 'o2_htr_b2s2', name: 'O2 Heater B2S2', icon: Flame, state: false, category: 'Engine' },
    { id: 'vvt_intake', name: 'VVT Intake Solenoid', icon: Settings, state: false, category: 'Engine' },
    { id: 'vvt_exhaust', name: 'VVT Exhaust Solenoid', icon: Settings, state: false, category: 'Engine' },
    { id: 'starter', name: 'Starter Relay', icon: Power, state: false, category: 'Engine' },
    { id: 'alternator', name: 'Alternator Field Control', icon: Battery, state: false, category: 'Engine' },
    
    // Body
    { id: 'horn', name: 'Horn Relay', icon: Volume2, state: false, category: 'Body' },
    { id: 'headlights_low', name: 'Headlights (Low Beam)', icon: Lightbulb, state: false, category: 'Body' },
    { id: 'headlights_high', name: 'Headlights (High Beam)', icon: Sun, state: false, category: 'Body' },
    { id: 'turn_l', name: 'Turn Signal (Left)', icon: ArrowLeft, state: false, category: 'Body' },
    { id: 'turn_r', name: 'Turn Signal (Right)', icon: ArrowRight, state: false, category: 'Body' },
    { id: 'hazards', name: 'Hazard Lights', icon: AlertTriangle, state: false, category: 'Body' },
    { id: 'brake_lights', name: 'Brake Lights', icon: Lightbulb, state: false, category: 'Body' },
    { id: 'reverse_lights', name: 'Reverse Lights', icon: Lightbulb, state: false, category: 'Body' },
    { id: 'fog_lights', name: 'Fog Lights', icon: Lightbulb, state: false, category: 'Body' },
    { id: 'dome_light', name: 'Interior Dome Light', icon: Lightbulb, state: false, category: 'Body' },
    { id: 'wipers_low', name: 'Windshield Wipers (Low)', icon: Droplets, state: false, category: 'Body' },
    { id: 'wipers_high', name: 'Windshield Wipers (High)', icon: Droplets, state: false, category: 'Body' },
    { id: 'washer_pump', name: 'Windshield Washer Pump', icon: Droplets, state: false, category: 'Body' },
    { id: 'door_lock', name: 'Door Locks (Lock All)', icon: Lock, state: false, category: 'Body' },
    { id: 'door_unlock', name: 'Door Locks (Unlock All)', icon: Unlock, state: false, category: 'Body' },
    { id: 'window_lf', name: 'Window LF (Up/Down)', icon: ArrowUp, state: false, category: 'Body' },
    { id: 'window_rf', name: 'Window RF (Up/Down)', icon: ArrowUp, state: false, category: 'Body' },
    { id: 'window_lr', name: 'Window LR (Up/Down)', icon: ArrowUp, state: false, category: 'Body' },
    { id: 'window_rr', name: 'Window RR (Up/Down)', icon: ArrowUp, state: false, category: 'Body' },
    { id: 'trunk', name: 'Trunk/Liftgate Release', icon: Unlock, state: false, category: 'Body' },
    { id: 'sunroof', name: 'Sunroof (Open/Close)', icon: Sun, state: false, category: 'Body' },
    { id: 'seat_htr_d', name: 'Seat Heater (Driver)', icon: Flame, state: false, category: 'Body' },
    { id: 'seat_htr_p', name: 'Seat Heater (Passenger)', icon: Flame, state: false, category: 'Body' },
    
    // Transmission
    { id: 'shift_a', name: 'Shift Solenoid A', icon: Settings, state: false, category: 'Transmission' },
    { id: 'shift_b', name: 'Shift Solenoid B', icon: Settings, state: false, category: 'Transmission' },
    { id: 'shift_c', name: 'Shift Solenoid C', icon: Settings, state: false, category: 'Transmission' },
    { id: 'shift_d', name: 'Shift Solenoid D', icon: Settings, state: false, category: 'Transmission' },
    { id: 'shift_e', name: 'Shift Solenoid E', icon: Settings, state: false, category: 'Transmission' },
    { id: 'tcc', name: 'Torque Converter Clutch', icon: Disc, state: false, category: 'Transmission' },
    { id: 'line_pressure', name: 'Line Pressure Control', icon: Activity, state: false, category: 'Transmission' },
    { id: 'gear_1', name: 'Gear Command (1st)', icon: Settings, state: false, category: 'Transmission' },
    { id: 'gear_2', name: 'Gear Command (2nd)', icon: Settings, state: false, category: 'Transmission' },
    { id: 'gear_3', name: 'Gear Command (3rd)', icon: Settings, state: false, category: 'Transmission' },
    { id: 'gear_4', name: 'Gear Command (4th)', icon: Settings, state: false, category: 'Transmission' },
    { id: 'gear_5', name: 'Gear Command (5th)', icon: Settings, state: false, category: 'Transmission' },
    { id: 'gear_6', name: 'Gear Command (6th)', icon: Settings, state: false, category: 'Transmission' },
    { id: 'trans_cooler', name: 'Trans Cooler Pump/Fan', icon: Fan, state: false, category: 'Transmission' },
    
    // Chassis
    { id: 'abs_pump', name: 'ABS Pump Motor', icon: ShieldAlert, state: false, category: 'Chassis' },
    { id: 'abs_in_fl', name: 'ABS Inlet Valve FL', icon: CarFront, state: false, category: 'Chassis' },
    { id: 'abs_out_fl', name: 'ABS Outlet Valve FL', icon: CarFront, state: false, category: 'Chassis' },
    { id: 'abs_in_fr', name: 'ABS Inlet Valve FR', icon: CarFront, state: false, category: 'Chassis' },
    { id: 'abs_out_fr', name: 'ABS Outlet Valve FR', icon: CarFront, state: false, category: 'Chassis' },
    { id: 'abs_in_rl', name: 'ABS Inlet Valve RL', icon: CarFront, state: false, category: 'Chassis' },
    { id: 'abs_out_rl', name: 'ABS Outlet Valve RL', icon: CarFront, state: false, category: 'Chassis' },
    { id: 'abs_in_rr', name: 'ABS Inlet Valve RR', icon: CarFront, state: false, category: 'Chassis' },
    { id: 'abs_out_rr', name: 'ABS Outlet Valve RR', icon: CarFront, state: false, category: 'Chassis' },
    { id: 'tc_disable', name: 'Traction Control Disable', icon: ShieldAlert, state: false, category: 'Chassis' },
    { id: 'epb_apply', name: 'EPB Apply', icon: CircleDashed, state: false, category: 'Chassis' },
    { id: 'epb_release', name: 'EPB Release', icon: CircleDashed, state: false, category: 'Chassis' },
    { id: 'epb_service', name: 'EPB Service Mode', icon: Settings, state: false, category: 'Chassis' },
    { id: 'susp_comp', name: 'Air Suspension Compressor', icon: ArrowUp, state: false, category: 'Chassis' },
    { id: 'susp_vent', name: 'Air Suspension Vent', icon: ArrowDown, state: false, category: 'Chassis' },
    { id: 'susp_fl', name: 'Air Suspension Fill FL', icon: ArrowUp, state: false, category: 'Chassis' },
    { id: 'susp_fr', name: 'Air Suspension Fill FR', icon: ArrowUp, state: false, category: 'Chassis' },
    { id: 'susp_rl', name: 'Air Suspension Fill RL', icon: ArrowUp, state: false, category: 'Chassis' },
    { id: 'susp_rr', name: 'Air Suspension Fill RR', icon: ArrowUp, state: false, category: 'Chassis' },
    { id: 'eps_assist', name: 'EPS Assist Control', icon: Settings, state: false, category: 'Chassis' },
    { id: 'tpms_light', name: 'TPMS Warning Light', icon: AlertTriangle, state: false, category: 'Chassis' },
  ]);

  const toggleActuator = (id: string) => {
    if (!isConnected) return;
    
    // Set processing state
    setActuators(prev => prev.map(a => a.id === id ? { ...a, isProcessing: true } : a));
    
    // Simulate network delay and command execution
    setTimeout(() => {
      setActuators(prev => prev.map(a => a.id === id ? { ...a, state: !a.state, isProcessing: false } : a));
    }, 800 + Math.random() * 1000);
  };

  const filteredActuators = actuators.filter(a => a.category === activeCategory);

  return (
    <div className="h-full flex flex-col bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center">
          <Power className="w-5 h-5 mr-2 text-rose-500" />
          Bi-Directional Controls
        </h2>
      </div>

      <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-200/70">
          <strong className="text-amber-500 font-semibold">Caution:</strong> Activating components manually can cause physical movement, engine stalling, or battery drain. Ensure the vehicle is in a safe state (Park/Neutral, Engine Off for most tests).
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-zinc-800 bg-zinc-950/30 overflow-x-auto">
        {(['Engine', 'Body', 'Transmission', 'Chassis'] as const).map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeCategory === category
                ? 'border-rose-500 text-rose-400 bg-rose-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            {category} Controls
          </button>
        ))}
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredActuators.map((actuator) => {
            const Icon = actuator.icon;
            return (
              <div key={actuator.id} className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-5 flex flex-col items-center text-center transition-colors hover:border-zinc-700 relative group">
                <div className={`p-4 rounded-full mb-4 transition-all duration-300 ${
                  actuator.state 
                    ? 'bg-rose-500/20 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.4)] scale-110' 
                    : 'bg-zinc-800 text-zinc-500 group-hover:bg-zinc-700'
                }`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-medium text-zinc-200 mb-4 h-10 flex items-center justify-center">{actuator.name}</h3>
                <button
                  onClick={() => toggleActuator(actuator.id)}
                  disabled={!isConnected || actuator.isProcessing}
                  className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center ${
                    !isConnected || actuator.isProcessing ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' :
                    actuator.state 
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/20' 
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                >
                  {actuator.isProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    actuator.state ? 'Turn OFF' : 'Turn ON'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Helper icon since Activity isn't imported from lucide-react in this file directly
function ActivityIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
