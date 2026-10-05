export interface PredictionResponse {
  success: boolean;

  prediction: {
    label: string;
    confidence: number;
  };

  cell_distribution: {
    SCC: number;
    HSIL: number;
    LSIL: number;
    Normal: number;
  };

  result_image: string;

  report: {
    report_id: string;
    download_url: string;
  };
}
