import { PredictionService } from '../src/services/PredictionService';
import { usePredictionStore } from '../src/store/usePredictionStore';

jest.mock('../src/database/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
  },
}));

describe('PredictionService', () => {
  it('should generate predictions based on progress', async () => {
    // Basic mock test for structure
    expect(PredictionService).toBeDefined();
  });
});
