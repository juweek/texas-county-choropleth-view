import { CountyData } from '@/types/county';
import Papa from 'papaparse';

// Load county data from CSV file
export const loadCountyData = async (): Promise<CountyData[]> => {
  try {
    // This is where we would load the CSV file with county data
    // For now, we'll use the hardcoded sample data
    // In a production app, you'd use:
    // const response = await fetch('/path/to/county-data.csv');
    // const csvText = await response.text();
    // const parsed = Papa.parse(csvText, { header: true });
    // return parsed.data as CountyData[];
    
    // Sample data as provided in the prompt
    const data: CountyData[] = [
    {
      "countyName": "Foard",
      "coordinates": {
        "latitude": 33.97408519,
        "longitude": -99.77871109
      },
      "data": {
        "temperature": {
          "value": 2.7777777777777777,
          "unit": "wmoUnit:degC",
          "validTime": "2025-04-07T10:00:00+00:00/PT1H"
        },
        "relativeHumidity": {
          "value": 78,
          "unit": "wmoUnit:percent",
          "validTime": "2025-04-07T10:00:00+00:00/PT1H"
        },
        "hazards": [],
        "probabilityOfPrecipitation": {
          "value": 0,
          "unit": "wmoUnit:percent",
          "validTime": "2025-04-07T10:00:00+00:00/P4DT14H"
        },
        "visibility": {
          "value": null,
          "unit": null,
          "validTime": null
        }
      }
    },
    {
      "countyName": "Blanco",
      "coordinates": {
        "latitude": 30.26636128,
        "longitude": -98.39974086
      },
      "data": {
        "temperature": {
          "value": 2.7777777777777777,
          "unit": "wmoUnit:degC",
          "validTime": "2025-04-07T11:00:00+00:00/PT1H"
        },
        "relativeHumidity": {
          "value": 84,
          "unit": "wmoUnit:percent",
          "validTime": "2025-04-07T11:00:00+00:00/PT1H"
        },
        "hazards": [],
        "probabilityOfPrecipitation": {
          "value": 0,
          "unit": "wmoUnit:percent",
          "validTime": "2025-04-07T11:00:00+00:00/P7DT13H"
        },
        "visibility": {
          "value": 16093.44,
          "unit": "wmoUnit:m",
          "validTime": "2025-04-07T11:00:00+00:00/P2DT8H"
        }
      }
    },
    {
      "countyName": "Llano",
      "coordinates": {
        "latitude": 30.70566579,
        "longitude": -98.68387398
      },
      "data": {
        "temperature": {
          "value": 0.5555555555555556,
          "unit": "wmoUnit:degC",
          "validTime": "2025-04-07T11:00:00+00:00/PT1H"
        },
        "relativeHumidity": {
          "value": 91,
          "unit": "wmoUnit:percent",
          "validTime": "2025-04-07T11:00:00+00:00/PT1H"
        },
        "hazards": [],
        "probabilityOfPrecipitation": {
          "value": 0,
          "unit": "wmoUnit:percent",
          "validTime": "2025-04-07T11:00:00+00:00/P7DT7H"
        },
        "visibility": {
          "value": 16093.44,
          "unit": "wmoUnit:m",
          "validTime": "2025-04-07T11:00:00+00:00/P2DT8H"
        }
      }
    },
    // Adding more sample counties to make the map more interesting
    {
      "countyName": "Travis",
      "coordinates": {
        "latitude": 30.33192778,
        "longitude": -97.77100281
      },
      "data": {
        "temperature": {
          "value": 18.3,
          "unit": "wmoUnit:degC",
          "validTime": "2025-04-07T11:00:00+00:00/PT1H"
        },
        "relativeHumidity": {
          "value": 65,
          "unit": "wmoUnit:percent",
          "validTime": "2025-04-07T11:00:00+00:00/PT1H"
        },
        "hazards": ["Thunderstorm"],
        "probabilityOfPrecipitation": {
          "value": 60,
          "unit": "wmoUnit:percent",
          "validTime": "2025-04-07T11:00:00+00:00/P7DT7H"
        },
        "visibility": {
          "value": 5000,
          "unit": "wmoUnit:m",
          "validTime": "2025-04-07T11:00:00+00:00/P2DT8H"
        }
      }
    },
    {
      "countyName": "Harris",
      "coordinates": {
        "latitude": 29.85731173,
        "longitude": -95.39722273
      },
      "data": {
        "temperature": {
          "value": 25.6,
          "unit": "wmoUnit:degC",
          "validTime": "2025-04-07T11:00:00+00:00/PT1H"
        },
        "relativeHumidity": {
          "value": 75,
          "unit": "wmoUnit:percent",
          "validTime": "2025-04-07T11:00:00+00:00/PT1H"
        },
        "hazards": ["Flood Warning"],
        "probabilityOfPrecipitation": {
          "value": 80,
          "unit": "wmoUnit:percent",
          "validTime": "2025-04-07T11:00:00+00:00/P7DT7H"
        },
        "visibility": {
          "value": 3000,
          "unit": "wmoUnit:m",
          "validTime": "2025-04-07T11:00:00+00:00/P2DT8H"
        }
      }
    },
    {
      "countyName": "El Paso",
      "coordinates": {
        "latitude": 31.76920633,
        "longitude": -106.23590355
      },
      "data": {
        "temperature": {
          "value": 32.2,
          "unit": "wmoUnit:degC",
          "validTime": "2025-04-07T11:00:00+00:00/PT1H"
        },
        "relativeHumidity": {
          "value": 15,
          "unit": "wmoUnit:percent",
          "validTime": "2025-04-07T11:00:00+00:00/PT1H"
        },
        "hazards": ["Excessive Heat"],
        "probabilityOfPrecipitation": {
          "value": 0,
          "unit": "wmoUnit:percent",
          "validTime": "2025-04-07T11:00:00+00:00/P7DT7H"
        },
        "visibility": {
          "value": 16093.44,
          "unit": "wmoUnit:m",
          "validTime": "2025-04-07T11:00:00+00:00/P2DT8H"
        }
      }
    }
  ];

    return data;
  } catch (error) {
    console.error('Error loading county data:', error);
    throw error;
  }
};

// Function to match county names between GeoJSON and our data
// GeoJSON properties may use a different format or naming convention
export const normalizeCountyName = (name: string): string => {
  // Remove "County" suffix if present and trim whitespace
  return name.replace(/\s+County$/i, '').trim();
};
