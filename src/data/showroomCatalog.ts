/**
 * TAJ TYRE WORKS - MRF & CEAT Master Showroom Catalogue
 * 
 * Exclusively Bike and Scooty tyres from authorized MRF and CEAT manufacturer lines.
 * Multiple patterns for identical sizes are fully preserved as separate entries.
 * Entries marked with an asterisk (*) are flagged with `isPositionConfirmed: false` for workshop verification.
 */

export interface ShowroomCatalogueItem {
  id: string;
  sku?: string;
  brand: "MRF" | "CEAT";
  category: "Bike" | "Scooty" | "Car";
  size: string;
  position: "Front" | "Rear" | "Front / Rear" | "Verification Needed";
  isPositionConfirmed: boolean;
  pattern: string;
  warranty: string;
  grip: "Excellent" | "High" | "Medium" | "All-Terrain";
  noise: "Ultra Silent" | "Low" | "Moderate";
  durability: "Ultra High" | "High" | "Extreme Duty";
  imageUrl?: string | null;
  description: string;
  stockStatus?: "Catalogue Only" | "In Stock" | "Out of Stock";
  inStock?: boolean;
  physicalQuantity?: number;
}

export const SHOWROOM_CATALOGUE: ShowroomCatalogueItem[] = [
  // ==========================================
  // MRF BIKE TYRES
  // ==========================================
  {
    id: "mrf-zapper-fs-80-100-18",
    brand: "MRF",
    category: "Bike",
    size: "80/100-18",
    position: "Front",
    isPositionConfirmed: true,
    pattern: "Zapper FS",
    warranty: "5 Years",
    grip: "High",
    noise: "Low",
    durability: "High",
    imageUrl: null,
    description: "Directional center-groove steering tread designed for sharp high-speed cornering and wet highway stability."
  },
  {
    id: "mrf-nylogrip-ezeeride-80-100-18",
    brand: "MRF",
    category: "Bike",
    size: "80/100-18",
    position: "Rear",
    isPositionConfirmed: true,
    pattern: "Nylogrip Ezeeride",
    warranty: "5 Years",
    grip: "High",
    noise: "Low",
    durability: "Ultra High",
    imageUrl: null,
    description: "Multi-sipe commuter rear tread with high rubber mileage compound for daily city & rural road endurance."
  },
  {
    id: "mrf-ngp-tt-3-00-18",
    brand: "MRF",
    category: "Bike",
    size: "3.00-18",
    position: "Rear",
    isPositionConfirmed: true,
    pattern: "NGP TT",
    warranty: "3 Years",
    grip: "Medium",
    noise: "Low",
    durability: "Ultra High",
    imageUrl: null,
    description: "Heavy-duty tube-type commuter rear tyre with deep lug bite for rough roads and commercial loads."
  },
  {
    id: "mrf-zapper-90-90-19-front",
    brand: "MRF",
    category: "Bike",
    size: "90/90-19",
    position: "Front",
    isPositionConfirmed: true,
    pattern: "Zapper",
    warranty: "5 Years",
    grip: "High",
    noise: "Low",
    durability: "High",
    imageUrl: null,
    description: "Road-hugging directional front rib design engineered specifically for classic and cruiser motorcycle stability."
  },
  {
    id: "mrf-zapper-120-80-18-rear",
    brand: "MRF",
    category: "Bike",
    size: "120/80-18",
    position: "Rear",
    isPositionConfirmed: true,
    pattern: "Zapper",
    warranty: "5 Years",
    grip: "High",
    noise: "Low",
    durability: "Ultra High",
    imageUrl: null,
    description: "Wide profile cruiser rear tread for superior torque transmission, straight-line traction, and braking balance."
  },
  {
    id: "mrf-zapper-q-110-80-17",
    brand: "MRF",
    category: "Bike",
    size: "110/80-17",
    position: "Rear",
    isPositionConfirmed: true,
    pattern: "Zapper Q",
    warranty: "5 Years",
    grip: "High",
    noise: "Low",
    durability: "Ultra High",
    imageUrl: null,
    description: "Aggressive block channels for sport-commuter motorcycles, optimized for wet and dry tarmac safety."
  },
  {
    id: "mrf-revz-140-70-17",
    brand: "MRF",
    category: "Bike",
    size: "140/70 R17",
    position: "Rear",
    isPositionConfirmed: true,
    pattern: "Revz",
    warranty: "5 Years",
    grip: "Excellent",
    noise: "Ultra Silent",
    durability: "High",
    imageUrl: null,
    description: "Premium radial sport tyre featuring silica compound for extreme lean angles and high-speed stability."
  },
  {
    id: "mrf-mogrip-meteor-100-90-19",
    brand: "MRF",
    category: "Bike",
    size: "100/90-19",
    position: "Front",
    isPositionConfirmed: true,
    pattern: "Mogrip Meteor",
    warranty: "5 Years",
    grip: "All-Terrain",
    noise: "Moderate",
    durability: "Extreme Duty",
    imageUrl: null,
    description: "Deep shoulder blocks and all-terrain tread pattern for adventurous highway and gravel road touring."
  },
  {
    id: "mrf-mogrip-meteor-120-80-17",
    brand: "MRF",
    category: "Bike",
    size: "120/80-17",
    position: "Rear",
    isPositionConfirmed: true,
    pattern: "Mogrip Meteor",
    warranty: "5 Years",
    grip: "All-Terrain",
    noise: "Moderate",
    durability: "Extreme Duty",
    imageUrl: null,
    description: "Chunky off-road traction lugs providing maximum gravel bite and puncture resistance for rough terrain."
  },
  {
    id: "mrf-zapper-c-100-90-18-ambiguous",
    brand: "MRF",
    category: "Bike",
    size: "100/90-18",
    position: "Verification Needed",
    isPositionConfirmed: false,
    pattern: "Zapper C*",
    warranty: "5 Years",
    grip: "High",
    noise: "Low",
    durability: "High",
    imageUrl: null,
    description: "Flagged with asterisk (*) in manufacturer lists. Fitment position requires verification by garage technician based on motorcycle rim width."
  },

  // ==========================================
  // CEAT BIKE TYRES
  // ==========================================
  {
    id: "ceat-gripp-x3-80-100-18",
    brand: "CEAT",
    category: "Bike",
    size: "80/100-18",
    position: "Rear",
    isPositionConfirmed: true,
    pattern: "Gripp X3",
    warranty: "5 Years (with Unconditional Cover)",
    grip: "High",
    noise: "Low",
    durability: "Ultra High",
    imageUrl: null,
    description: "Patented dual-compound technology delivering lifelong road grip even as the tyre tread wears down over time."
  },
  {
    id: "ceat-secura-neo-2-75-18",
    brand: "CEAT",
    category: "Bike",
    size: "2.75-18",
    position: "Front",
    isPositionConfirmed: true,
    pattern: "Secura Neo",
    warranty: "5 Years",
    grip: "High",
    noise: "Low",
    durability: "Ultra High",
    imageUrl: null,
    description: "Center-rib directional steer profile built for feather-light city steering and quick water channeling."
  },
  {
    id: "ceat-zoom-plus-90-90-19-front",
    brand: "CEAT",
    category: "Bike",
    size: "90/90-19",
    position: "Front",
    isPositionConfirmed: true,
    pattern: "Zoom Plus",
    warranty: "5 Years",
    grip: "High",
    noise: "Low",
    durability: "High",
    imageUrl: null,
    description: "Continuous circumferential groove engineered for high straight-line tracking on highway expressways."
  },
  {
    id: "ceat-zoom-plus-120-80-18-rear",
    brand: "CEAT",
    category: "Bike",
    size: "120/80-18",
    position: "Rear",
    isPositionConfirmed: true,
    pattern: "Zoom Plus",
    warranty: "5 Years",
    grip: "High",
    noise: "Low",
    durability: "High",
    imageUrl: null,
    description: "Deep lateral shoulder sipes provide secure wet grip during braking and high leaning angles."
  },
  {
    id: "ceat-zoom-x3-100-80-17",
    brand: "CEAT",
    category: "Bike",
    size: "100/80-17",
    position: "Front",
    isPositionConfirmed: true,
    pattern: "Zoom X3",
    warranty: "5 Years",
    grip: "High",
    noise: "Low",
    durability: "High",
    imageUrl: null,
    description: "Sport directional tread with lightning-bolt siping for aggressive modern commuter motorcycles."
  },
  {
    id: "ceat-zoom-rad-x1-140-70-17",
    brand: "CEAT",
    category: "Bike",
    size: "140/70 R17",
    position: "Rear",
    isPositionConfirmed: true,
    pattern: "Zoom Rad X1",
    warranty: "5 Years",
    grip: "Excellent",
    noise: "Ultra Silent",
    durability: "High",
    imageUrl: null,
    description: "Zero-degree steel-belted radial structure designed for cornering balance, high-speed damping, and thermal dissipation."
  },
  {
    id: "ceat-gripp-xl-120-80-18",
    brand: "CEAT",
    category: "Bike",
    size: "120/80-18",
    position: "Rear",
    isPositionConfirmed: true,
    pattern: "Gripp XL",
    warranty: "5 Years",
    grip: "All-Terrain",
    noise: "Moderate",
    durability: "Extreme Duty",
    imageUrl: null,
    description: "Block-type rugged tread blocks providing outstanding off-road grip, stone ejection, and hill climb traction."
  },

  // ==========================================
  // MRF SCOOTY / SCOOTER TYRES
  // ==========================================
  {
    id: "mrf-zapper-kurve-90-90-12",
    brand: "MRF",
    category: "Scooty",
    size: "90/90-12",
    position: "Front / Rear",
    isPositionConfirmed: true,
    pattern: "Zapper Kurve",
    warranty: "5 Years",
    grip: "High",
    noise: "Low",
    durability: "High",
    imageUrl: null,
    description: "Curved shoulder groove technology providing smooth turning transitions and confident wet road braking on scooters."
  },
  {
    id: "mrf-nylogrip-zapper-90-100-10",
    brand: "MRF",
    category: "Scooty",
    size: "90/100-10",
    position: "Rear",
    isPositionConfirmed: true,
    pattern: "Nylogrip Zapper",
    warranty: "5 Years",
    grip: "High",
    noise: "Low",
    durability: "Ultra High",
    imageUrl: null,
    description: "High-mileage scooter tread compounding with balanced traction for high-stress daily city traffic stops."
  },

  // ==========================================
  // CEAT SCOOTY / SCOOTER TYRES
  // ==========================================
  {
    id: "ceat-milaze-90-90-12",
    brand: "CEAT",
    category: "Scooty",
    size: "90/90-12",
    position: "Front",
    isPositionConfirmed: true,
    pattern: "Milaze",
    warranty: "5 Years",
    grip: "High",
    noise: "Low",
    durability: "Ultra High",
    imageUrl: null,
    description: "Legendary high-mileage scooter tyre with deep non-skid tread depth for unmatched tread life and puncture prevention."
  },
  {
    id: "ceat-milaze-90-100-10",
    brand: "CEAT",
    category: "Scooty",
    size: "90/100-10",
    position: "Rear",
    isPositionConfirmed: true,
    pattern: "Milaze",
    warranty: "5 Years",
    grip: "High",
    noise: "Low",
    durability: "Ultra High",
    imageUrl: null,
    description: "Continuous center-band with knurled shoulders ensuring extended tyre life and reliable braking on wet tarmac."
  },
  {
    id: "ceat-gripp-90-100-10",
    brand: "CEAT",
    category: "Scooty",
    size: "90/100-10",
    position: "Rear",
    isPositionConfirmed: true,
    pattern: "Gripp",
    warranty: "5 Years",
    grip: "High",
    noise: "Moderate",
    durability: "High",
    imageUrl: null,
    description: "Block-pattern tread delivering solid grip on slippery monsoon roads, loose gravel, and uneven city surfaces."
  },

  // ==========================================
  // CAR TYRES (MRF & CEAT)
  // ==========================================
  {
    id: "ceat-securadrive-195-55-16",
    sku: "CEAT-SECDR-1955516-FR",
    brand: "CEAT",
    category: "Car",
    size: "195/55 R16",
    position: "Front / Rear",
    isPositionConfirmed: true,
    pattern: "SecuraDrive",
    warranty: "5 Years",
    grip: "High",
    noise: "Low",
    durability: "Ultra High",
    imageUrl: null,
    description: "Premium passenger car radial tyre offering superior wet road grip, acoustic comfort, and long tread life."
  },
  {
    id: "mrf-wanderer-at-235-70-16",
    sku: "MRF-WAND-2357016-FR",
    brand: "MRF",
    category: "Car",
    size: "235/70 R16",
    position: "Front / Rear",
    isPositionConfirmed: true,
    pattern: "Wanderer A/T",
    warranty: "5 Years",
    grip: "All-Terrain",
    noise: "Low",
    durability: "Extreme Duty",
    imageUrl: null,
    description: "All-terrain SUV tyre engineered for tough off-road capability, reinforced sidewalls, and smooth highway ride."
  },
  {
    id: "mrf-zvtv-185-65-15",
    sku: "MRF-ZVTV-1856515-FR",
    brand: "MRF",
    category: "Car",
    size: "185/65 R15",
    position: "Front / Rear",
    isPositionConfirmed: true,
    pattern: "ZVTV",
    warranty: "5 Years",
    grip: "High",
    noise: "Low",
    durability: "Ultra High",
    imageUrl: null,
    description: "High-efficiency commuter car tyre with asymmetric tread pattern for responsive steering and fuel economy."
  },
  {
    id: "ceat-milaze-x3-175-65-14",
    sku: "CEAT-MILX3-1756514-FR",
    brand: "CEAT",
    category: "Car",
    size: "175/65 R14",
    position: "Front / Rear",
    isPositionConfirmed: true,
    pattern: "Milaze X3",
    warranty: "5 Years",
    grip: "High",
    noise: "Low",
    durability: "Ultra High",
    imageUrl: null,
    description: "High durability car radial engineered for 100,000 km durability with continuous center groove and wide contact patch."
  }
];
