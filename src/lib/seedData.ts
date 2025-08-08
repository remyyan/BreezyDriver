import { LocationFormData } from './firebase';
import { addLocation, approveLocation } from './locationService';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { geocodeAddress } from './geocodingService';

// Sample location data for Toronto area
const sampleLocations: LocationFormData[] = [
  {
    name: "Yorkdale Shopping Centre Parking Lot",
    address: "3401 Dufferin St, Toronto, ON M6A 2T9",
    description: "Large parking lot with multiple levels. Great for practicing parking, lane changes, and navigating tight spaces. Less busy during weekday mornings.",
    difficulty: "Beginner",
    features: ["Large parking area", "Multiple levels", "Good lighting", "Security cameras"],
    coordinates: { latitude: 43.7251, longitude: -79.4516 }
  },
  {
    name: "Centennial College Progress Campus",
    address: "941 Progress Ave, Scarborough, ON M1G 3T8",
    description: "Spacious campus parking with wide lanes and clear markings. Perfect for new drivers to practice basic maneuvers.",
    difficulty: "Beginner",
    features: ["Wide lanes", "Clear markings", "Quiet on weekends", "Multiple entrances"],
    coordinates: { latitude: 43.7854, longitude: -79.2311 }
  },
  {
    name: "High Park Area Streets",
    address: "High Park Ave & Bloor St W, Toronto, ON",
    description: "Residential streets with moderate traffic. Good for practicing parallel parking and navigating around parked cars.",
    difficulty: "Intermediate",
    features: ["Parallel parking spots", "Residential traffic", "Tree-lined streets", "Speed bumps"],
    coordinates: { latitude: 43.6536, longitude: -79.4630 }
  },
  {
    name: "Sherway Gardens Mall",
    address: "25 The West Mall, Etobicoke, ON M9C 1B8",
    description: "Busy shopping center with challenging parking situations. Great for advanced parking practice and dealing with pedestrians.",
    difficulty: "Advanced",
    features: ["Busy parking", "Pedestrian traffic", "Tight spaces", "Multiple levels"],
    coordinates: { latitude: 43.6103, longitude: -79.5572 }
  },
  {
    name: "Downsview Park",
    address: "70 Canuck Ave, Toronto, ON M3K 2C5",
    description: "Large open parking area with minimal traffic. Excellent for beginners to practice basic driving skills.",
    difficulty: "Beginner",
    features: ["Open space", "Minimal traffic", "Good visibility", "Free parking"],
    coordinates: { latitude: 43.7420, longitude: -79.4692 }
  },
  {
    name: "Roundabout at Don Mills & Eglinton",
    address: "Don Mills Rd & Eglinton Ave E, Toronto, ON",
    description: "Multi-lane roundabout with moderate to heavy traffic. Perfect for practicing roundabout navigation and lane positioning.",
    difficulty: "Advanced",
    features: ["Multi-lane roundabout", "Heavy traffic", "Multiple exits", "Challenging merging"],
    coordinates: { latitude: 43.7065, longitude: -79.3467 }
  },
  {
    name: "Mississauga Valley Community Centre",
    address: "1275 Mississauga Valley Blvd, Mississauga, ON L5A 2T8",
    description: "Community center parking with moderate activity. Good for practicing in a real-world environment with manageable traffic.",
    difficulty: "Intermediate",
    features: ["Community parking", "Moderate traffic", "Well-lit", "Clear signage"],
    coordinates: { latitude: 43.5890, longitude: -79.7131 }
  },
  {
    name: "Woodbine Beach Parking",
    address: "1675 Lake Shore Blvd E, Toronto, ON M4L 3W6",
    description: "Beachfront parking with angled and parallel spots. Can get busy on weekends but great for practicing different parking types.",
    difficulty: "Intermediate",
    features: ["Angled parking", "Parallel parking", "Scenic location", "Weekend crowds"],
    coordinates: { latitude: 43.6634, longitude: -79.3095 }
  },
  {
    name: "School Zone - Earl Bales Park",
    address: "4169 Bathurst St, Toronto, ON M3H 3P3",
    description: "School zone area with reduced speed limits and crossing guards during school hours. Important for practicing school zone safety.",
    difficulty: "Intermediate",
    features: ["School zone", "Reduced speed limits", "Crossing guards", "Pedestrian crossings"],
    coordinates: { latitude: 43.7344, longitude: -79.4394 }
  },
  {
    name: "Highway 401 On-Ramp Practice",
    address: "Highway 401 & Don Valley Pkwy, Toronto, ON",
    description: "Highway merging practice area. Advanced drivers can practice merging onto busy highways and maintaining highway speeds.",
    difficulty: "Advanced",
    features: ["Highway merging", "High-speed traffic", "Multiple lanes", "Acceleration lane"],
    coordinates: { latitude: 43.6896, longitude: -79.3252 }
  },
  {
    name: "Square One Shopping Centre",
    address: "100 City Centre Dr, Mississauga, ON L5B 2C9",
    description: "Massive shopping center with multi-level parking. Great for practicing in busy conditions with lots of pedestrian traffic.",
    difficulty: "Advanced",
    features: ["Multi-level parking", "Heavy pedestrian traffic", "Tight spaces", "Complex navigation"],
    coordinates: { latitude: 43.5933, longitude: -79.6441 }
  },
  {
    name: "Humber College North Campus",
    address: "205 Humber College Blvd, Toronto, ON M9W 5L7",
    description: "Large campus with multiple parking areas and internal roads. Perfect for practicing various driving scenarios.",
    difficulty: "Beginner",
    features: ["Campus roads", "Multiple parking lots", "Low traffic", "Clear signage"],
    coordinates: { latitude: 43.7284, longitude: -79.6077 }
  },
  {
    name: "Fairview Mall Parking",
    address: "1800 Sheppard Ave E, North York, ON M2J 5A7",
    description: "Shopping mall with both surface and underground parking. Good for practicing different parking environments.",
    difficulty: "Intermediate",
    features: ["Underground parking", "Surface parking", "Moderate traffic", "Good lighting"],
    coordinates: { latitude: 43.7799, longitude: -79.3470 }
  },
  {
    name: "Etobicoke Civic Centre",
    address: "399 The West Mall, Etobicoke, ON M9C 2Y2",
    description: "Government building with ample parking and quiet surroundings. Ideal for nervous beginners.",
    difficulty: "Beginner",
    features: ["Quiet area", "Wide parking spaces", "Low traffic", "Professional environment"],
    coordinates: { latitude: 43.6436, longitude: -79.5577 }
  },
  {
    name: "Scarborough Town Centre",
    address: "300 Borough Dr, Scarborough, ON M1P 4P5",
    description: "Large shopping complex with challenging parking situations and busy traffic patterns.",
    difficulty: "Advanced",
    features: ["Busy shopping center", "Complex traffic patterns", "Multiple entrances", "Peak hour challenges"],
    coordinates: { latitude: 43.7764, longitude: -79.2572 }
  },
  {
    name: "Seneca College King Campus",
    address: "13990 Dufferin St, King City, ON L7B 1B3",
    description: "Suburban campus with winding roads and hills. Great for practicing on varied terrain.",
    difficulty: "Intermediate",
    features: ["Hilly terrain", "Winding roads", "Rural setting", "Varied driving conditions"],
    coordinates: { latitude: 43.9461, longitude: -79.5269 }
  },
  {
    name: "Markville Shopping Centre",
    address: "5000 Hwy 7, Markham, ON L3R 4M9",
    description: "Suburban mall with moderate traffic. Good stepping stone between beginner and advanced practice.",
    difficulty: "Intermediate",
    features: ["Suburban setting", "Moderate traffic", "Standard parking", "Family-friendly"],
    coordinates: { latitude: 43.8563, longitude: -79.3370 }
  },
  {
    name: "Vaughan Mills Outlet Mall",
    address: "1 Bass Pro Mills Dr, Vaughan, ON L4K 5W4",
    description: "Large outlet mall with extensive parking areas. Can get very busy on weekends.",
    difficulty: "Advanced",
    features: ["Extensive parking", "Weekend crowds", "Tourist traffic", "Large scale navigation"],
    coordinates: { latitude: 43.8256, longitude: -79.5389 }
  },
  {
    name: "Centennial Park",
    address: "256 Centennial Park Rd, Etobicoke, ON M9C 5N3",
    description: "Large park with multiple parking areas and internal roads. Perfect for relaxed practice sessions.",
    difficulty: "Beginner",
    features: ["Park setting", "Multiple parking areas", "Scenic environment", "Low stress"],
    coordinates: { latitude: 43.6419, longitude: -79.5947 }
  },
  {
    name: "Pickering Town Centre",
    address: "1355 Kingston Rd, Pickering, ON L1V 1B8",
    description: "Regional shopping center with good mix of parking challenges and moderate traffic.",
    difficulty: "Intermediate",
    features: ["Regional shopping", "Mixed parking types", "Moderate traffic", "Suburban location"],
    coordinates: { latitude: 43.8384, longitude: -79.0869 }
  },
  {
    name: "York University Keele Campus",
    address: "4700 Keele St, Toronto, ON M3J 1P3",
    description: "Large university campus with complex road network and varied parking situations.",
    difficulty: "Intermediate",
    features: ["University campus", "Complex road network", "Student traffic", "Varied parking"],
    coordinates: { latitude: 43.7735, longitude: -79.5019 }
  },
  {
    name: "Bramalea City Centre",
    address: "25 Peel Centre Dr, Brampton, ON L6T 3R5",
    description: "Major shopping center in Brampton with busy traffic and challenging parking scenarios.",
    difficulty: "Advanced",
    features: ["Major shopping center", "Busy traffic", "Challenging parking", "Urban environment"],
    coordinates: { latitude: 43.7069, longitude: -79.7703 }
  },
  {
    name: "Ryerson University Campus",
    address: "350 Victoria St, Toronto, ON M5B 2K3",
    description: "Downtown campus area with urban driving challenges and limited parking.",
    difficulty: "Advanced",
    features: ["Downtown location", "Urban traffic", "Limited parking", "City driving"],
    coordinates: { latitude: 43.6577, longitude: -79.3788 }
  },
  {
    name: "Oshawa Centre",
    address: "419 King St W, Oshawa, ON L1J 2K5",
    description: "Regional mall with good practice opportunities for intermediate drivers.",
    difficulty: "Intermediate",
    features: ["Regional mall", "Standard parking", "Moderate traffic", "Suburban setting"],
    coordinates: { latitude: 43.8971, longitude: -78.8658 }
  },
  {
    name: "Albion Hills Conservation Area",
    address: "16500 Peel Regional Rd 50, Caledon, ON L7E 0L6",
    description: "Conservation area with rural roads and natural setting. Great for building confidence.",
    difficulty: "Beginner",
    features: ["Rural roads", "Natural setting", "Low traffic", "Scenic drives"],
    coordinates: { latitude: 43.8667, longitude: -79.9167 }
  },
  {
    name: "Hillcrest Mall",
    address: "9350 Yonge St, Richmond Hill, ON L4C 5G2",
    description: "Older shopping mall with traditional parking layout. Good for standard practice.",
    difficulty: "Intermediate",
    features: ["Traditional layout", "Standard parking", "Moderate traffic", "Established area"],
    coordinates: { latitude: 43.8642, longitude: -79.4278 }
  },
  {
    name: "Costco Wholesale Etobicoke",
    address: "50 Mulock Dr, Etobicoke, ON M9W 5S5",
    description: "Big box store with large parking lot and busy weekend traffic. Good for real-world practice.",
    difficulty: "Intermediate",
    features: ["Large parking lot", "Weekend crowds", "Big box shopping", "Real-world traffic"],
    coordinates: { latitude: 43.7394, longitude: -79.5947 }
  },
  {
    name: "Pearson Airport Parking",
    address: "6301 Silver Dart Dr, Mississauga, ON L5P 1B2",
    description: "Airport parking areas with complex navigation and time pressure. Advanced practice only.",
    difficulty: "Advanced",
    features: ["Airport environment", "Complex navigation", "Time pressure", "Heavy traffic"],
    coordinates: { latitude: 43.6777, longitude: -79.6248 }
  },
  {
    name: "Morningside Park",
    address: "390 Morningside Ave, Toronto, ON M1E 3E3",
    description: "Large park with quiet roads and minimal traffic. Perfect for first-time drivers.",
    difficulty: "Beginner",
    features: ["Park roads", "Minimal traffic", "Quiet environment", "Beginner-friendly"],
    coordinates: { latitude: 43.7847, longitude: -79.1886 }
  }
];



export const seedDatabase = async (currentUserId: string): Promise<{ success: boolean; message: string; stats: any }> => {
  try {
    let locationsAdded = 0;
    const locationIds: string[] = [];

    console.log('🌱 Starting database seeding...');

    // Add locations
    for (const locationData of sampleLocations) {
      try {
        // Geocode if coordinates missing
        let data = { ...locationData };
        if (!data.coordinates) {
          const geo = await geocodeAddress(data.address);
          if (geo) {
            data.coordinates = geo;
          }
        }

        const locationId = await addLocation(data, currentUserId);

        if (locationId) {
          // Auto-approve the location
          await approveLocation(locationId, currentUserId);
          locationIds.push(locationId);
          locationsAdded++;
          console.log(`✅ Added location: ${data.name}`);
        }
      } catch (error) {
        console.error('Error adding location:', error);
      }
    }

    return {
      success: true,
      message: `Successfully seeded database!`,
      stats: {
        locationsAdded,
        totalItems: locationsAdded
      }
    };
  } catch (error) {
    console.error('Error seeding database:', error);
    return {
      success: false,
      message: `Failed to seed database: ${error instanceof Error ? error.message : 'Unknown error'}`,
      stats: { locationsAdded: 0, totalItems: 0 }
    };
  }
};

// Function to remove all seeded data
export const removeSeedData = async (currentUserId: string): Promise<{ success: boolean; message: string; stats: any }> => {
  try {
    let locationsRemoved = 0;

    console.log('🗑️ Starting seed data removal...');

    // Find all locations submitted by the current user (admin)
    const locationsQuery = query(
      collection(db, 'locations'),
      where('submittedBy', '==', currentUserId)
    );
    const locationsSnapshot = await getDocs(locationsQuery);

    // Delete each location
    for (const locationDoc of locationsSnapshot.docs) {
      try {
        const locationData = locationDoc.data();
        await deleteDoc(doc(db, 'locations', locationDoc.id));
        locationsRemoved++;
        console.log(`🗑️ Removed location: ${locationData.name}`);
      } catch (error) {
        console.error('Error removing location:', error);
      }
    }

    return {
      success: true,
      message: `Successfully removed seed data!`,
      stats: {
        locationsRemoved,
        totalItems: locationsRemoved
      }
    };
  } catch (error) {
    console.error('Error removing seed data:', error);
    return {
      success: false,
      message: `Failed to remove seed data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      stats: { locationsRemoved: 0, totalItems: 0 }
    };
  }
};
