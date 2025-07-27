import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as model from './src/lib/modelCalculations.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test data
const testData = {
  vix: {
    current: 35,
    last20Days: Array(20).fill(0).map((_, i) => 20 + i * 0.5)
  },
  market: {
    spyReturn: -2.5,
    gldReturn: 1.5,
    spyMA20: 450,
    spyPrice: 440
  },
  usd: {
    ratePolicy: {
      currentRate: 5.25,
      terminalRate: 5.50,
      currency: 'USD',
      hawkishWords: 3,
      dovishWords: 1
    },
    growthMomentum: {
      employment: { currency: 'USD', value: 175 },
      pmi: 48.5,
      gdpQoQ: 1.5
    },
    realInterestEdge: {
      currency: 'USD',
      twoYearYield: 4.7,
      breakeven5Y5Y: 2.3
    }
  }
};

// Run tests
console.log('=== V07 MODEL VALIDATION ===\n');

// Test 1: Market Regime
const regime = model.detectMarketRegime(testData.vix, testData.market, false);
console.log('Market Regime:', regime);

// Test 2: Factor Weights
const weights = model.getFactorWeights(regime);
console.log('\nFactor Weights:', weights);

// Test 3: Rate Policy
const rateScore = model.calculateRatePolicy(testData.usd.ratePolicy);
console.log('\nRate Policy Score:', rateScore);

// Test 4: Growth Momentum
const growthScore = model.calculateGrowthMomentum(testData.usd.growthMomentum);
console.log('\nGrowth Momentum Score:', growthScore);

// Test 5: Real Interest Edge
const realRateScore = model.calculateRealInterestEdge(testData.usd.realInterestEdge);
console.log('\nReal Interest Edge Score:', realRateScore);

console.log('\nAll tests completed successfully!'); 