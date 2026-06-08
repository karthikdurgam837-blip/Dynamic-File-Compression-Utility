export interface CareStats {
  sunlight: string;
  sunlightLevel: number; // 1-5
  watering: string;
  wateringLevel: number; // 1-5
  soilType: string;
  humidity: string;
  humidityLevel: number; // 1-5
  temperature: string;
}

export interface CareInstructions {
  wateringTips: string;
  sunlightTips: string;
  feedingTips: string;
  pruningTips: string;
}

export interface CommonIssue {
  issue: string;
  symptom: string;
  solution: string;
}

export interface PropagationDetails {
  method: string;
  steps: string[];
}

export interface PlantDetails {
  name: string;
  scientificName: string;
  description: string;
  difficulty: "Easy" | "Moderate" | "Expert";
  careStats: CareStats;
  careInstructions: CareInstructions;
  commonIssues: CommonIssue[];
  propagation: PropagationDetails;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}
