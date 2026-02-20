export interface GuideTourStep {
  partId: string;
  partNameKo: string;
  explanation: string;
  order: number;
}

export interface GuideTour {
  modelId: string;
  title: string;
  steps: GuideTourStep[];
  generatedAt: number;
}
