
export interface CountyData {
  countyName: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  data: {
    temperature: {
      value: number;
      unit: string;
      validTime: string;
    };
    relativeHumidity: {
      value: number;
      unit: string;
      validTime: string;
    };
    hazards: string[];
    probabilityOfPrecipitation: {
      value: number;
      unit: string;
      validTime: string;
    };
    visibility: {
      value: number | null;
      unit: string | null;
      validTime: string | null;
    };
  };
}

export type DataType = 'temperature' | 'hazards' | 'visibility';
