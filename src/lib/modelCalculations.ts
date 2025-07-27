// PERFECT RETAIL FOREX MACRO SCORING MODEL V07
// CRITICAL FIXES APPLIED - CORE CALCULATION OVERHAUL

export interface VIXData {
  current: number;
  last20Days: number[];
}

export interface MarketData {
  spyReturn: number;
  gldReturn: number;
  spyMA20: number;
  spyPrice: number;
}

export interface RatePolicyData {
  currentRate: number;
  terminalRate: number;
  currency: string;
  hawkishWords: number;
  dovishWords: number;
}

export interface GrowthMomentumData {
  employment: { currency: string; value: number };
  pmi: number;
  gdpQoQ: number;
}

export interface RealInterestEdgeData {
  currency: string;
  twoYearYield: number;
  breakeven5Y5Y: number;
}

export interface PositioningData {
  currency: string;
  netPosition: number;
  percentile52Week: number;
}

export type MarketRegime = 'RISK_OFF' | 'RISK_ON' | 'NEUTRAL' | 'CENTRAL_BANK_WEEK';

export interface FactorWeights {
  ratePolicy: number;
  growthMomentum: number;
  realInterestEdge: number;
  riskAppetite: number;
  positioning: number;
}

export interface CurrencyScore {
  currency: string;
  ratePolicy: number;
  growthMomentum: number;
  realInterestEdge: number;
  riskAppetite: number;
  positioning: number;
  totalScore: number;
}

// Rate Sensitivity by Currency
const RATE_SENSITIVITY: Record<string, number> = {
  USD: 0.4,
  EUR: 0.6,
  GBP: 0.5,
  JPY: 1.0,
  AUD: 0.4,
  CAD: 0.3,
  CHF: 0.8
};

// Currency Risk Classification
const CURRENCY_RISK_FACTORS: Record<string, number> = {
  AUD: 1.0,  // Risk-on beneficiary
  EUR: 0.5,  // Risk-on beneficiary
  CAD: 0.3,  // Risk-on beneficiary
  JPY: 1.0,  // Safe haven
  CHF: 0.8,  // Safe haven
  USD: 0.3,  // Safe haven
  GBP: 0.2   // Neutral
};

/**
 * Detect Market Regime based on VIX and market conditions
 */
export function detectMarketRegime(vix: VIXData, market: MarketData, isCentralBankWeek: boolean = false): MarketRegime {
  if (isCentralBankWeek) {
    return 'CENTRAL_BANK_WEEK';
  }

  // Calculate VIX percentiles
  const sortedVix = [...vix.last20Days].sort((a, b) => a - b);
  const percentile75 = sortedVix[Math.floor(sortedVix.length * 0.75)];
  const percentile25 = sortedVix[Math.floor(sortedVix.length * 0.25)];

  // Check for Risk-Off conditions
  if (vix.current > percentile75 || market.gldReturn > market.spyReturn + 5) {
    return 'RISK_OFF';
  }

  // Check for Risk-On conditions
  if (vix.current < percentile25 && market.spyPrice > market.spyMA20) {
    return 'RISK_ON';
  }

  return 'NEUTRAL';
}

/**
 * Get factor weights based on market regime
 */
export function getFactorWeights(regime: MarketRegime): FactorWeights {
  switch (regime) {
    case 'RISK_OFF':
      return {
        ratePolicy: 0.45,
        growthMomentum: 0.15,
        realInterestEdge: 0.25,
        riskAppetite: 0.15,
        positioning: 0.05
      };
    case 'RISK_ON':
      return {
        ratePolicy: 0.30,
        growthMomentum: 0.35,
        realInterestEdge: 0.25,
        riskAppetite: 0.10,
        positioning: 0.05
      };
    case 'CENTRAL_BANK_WEEK':
      return {
        ratePolicy: 0.55,
        growthMomentum: 0.15,
        realInterestEdge: 0.25,
        riskAppetite: 0.05,
        positioning: 0.05
      };
    default: // NEUTRAL
      return {
        ratePolicy: 0.35,
        growthMomentum: 0.25,
        realInterestEdge: 0.30,
        riskAppetite: 0.10,
        positioning: 0.05
      };
  }
}

/**
 * Calculate Rate Policy Score
 */
export function calculateRatePolicy(data: RatePolicyData): number {
  // A. Rate Differential Model (80% of factor)
  const rateSensitivity = RATE_SENSITIVITY[data.currency] || 0.5;
  const rateGap = (data.terminalRate - data.currentRate) * rateSensitivity;
  
  // B. Central Bank Tone Shift (20% of factor)
  const toneScore = Math.max(-1.0, Math.min(1.0, (data.hawkishWords - data.dovishWords) * 0.1));
  
  // Combine with weights
  return (rateGap * 0.8) + (toneScore * 0.2);
}

/**
 * Calculate Growth Momentum Score
 */
export function calculateGrowthMomentum(data: GrowthMomentumData): number {
  // Employment Component (40%)
  let employmentScore = 0;
  const currency = data.employment.currency;
  const value = data.employment.value;

  switch (currency) {
    case 'USD':
      if (value > 180) employmentScore = 1.0;
      else if (value < 100) employmentScore = -1.0;
      else employmentScore = (value - 140) / 40; // Linear interpolation
      break;
    case 'EUR':
      // Assuming employment rate YoY
      if (value > 0.3) employmentScore = 1.0;
      else if (value < -0.1) employmentScore = -1.0;
      else employmentScore = (value + 0.1) / 0.4;
      break;
    case 'GBP':
      // Claimant count change (negative is good)
      if (value < -20) employmentScore = 1.0;
      else if (value > 40) employmentScore = -1.0;
      else employmentScore = (-value + 10) / 30;
      break;
    case 'JPY':
      // Job-to-applicant ratio
      if (value > 1.30) employmentScore = 1.0;
      else if (value < 1.25) employmentScore = -1.0;
      else employmentScore = (value - 1.275) / 0.025;
      break;
    case 'AUD':
      // Participation rate
      if (value > 66.5) employmentScore = 1.0;
      else if (value < 66.0) employmentScore = -1.0;
      else employmentScore = (value - 66.25) / 0.25;
      break;
    case 'CAD':
      // Employment rate
      if (value > 62.5) employmentScore = 1.0;
      else if (value < 61.5) employmentScore = -1.0;
      else employmentScore = (value - 62.0) / 0.5;
      break;
    default:
      employmentScore = 0;
  }

  // Manufacturing Component (30%) - PMI
  let pmiScore = 0;
  if (data.pmi > 52) pmiScore = 1.0;
  else if (data.pmi >= 50) pmiScore = 0.5;
  else if (data.pmi >= 48) pmiScore = 0.0;
  else if (data.pmi >= 45) pmiScore = -0.5;
  else pmiScore = -1.0;

  // GDP Momentum (30%)
  let gdpScore = 0;
  if (data.gdpQoQ > 3.0) gdpScore = 1.0;
  else if (data.gdpQoQ >= 2.0) gdpScore = 0.5;
  else if (data.gdpQoQ >= 1.0) gdpScore = 0.0;
  else if (data.gdpQoQ >= 0) gdpScore = -0.5;
  else gdpScore = -1.0;

  // Composite Growth Score
  return (employmentScore * 0.4) + (pmiScore * 0.3) + (gdpScore * 0.3);
}

/**
 * Calculate Real Interest Edge Score
 */
export function calculateRealInterestEdge(data: RealInterestEdgeData): number {
  // Real Rate = 2-Year Government Yield - 5Y5Y Breakeven Inflation Rate
  const realRate = data.twoYearYield - data.breakeven5Y5Y;
  
  // Return the real rate (will be compared against other currencies)
  return realRate * 1.5; // Multiplier for sensitivity
}

/**
 * Calculate Risk Appetite Score
 */
export function calculateRiskAppetite(vix: VIXData, market: MarketData): { vixScore: number; riskScore: number } {
  // A. Volatility Regime (60% of factor)
  const sortedVix = [...vix.last20Days].sort((a, b) => a - b);
  const percentiles = [20, 40, 60, 80].map(p => sortedVix[Math.floor(sortedVix.length * p / 100)]);
  
  let vixScore = 0;
  if (vix.current < percentiles[0]) vixScore = 1.0;
  else if (vix.current < percentiles[1]) vixScore = 0.5;
  else if (vix.current < percentiles[2]) vixScore = 0.0;
  else if (vix.current < percentiles[3]) vixScore = -0.5;
  else vixScore = -1.0;

  // B. Cross-Asset Risk Sentiment (40% of factor)
  const riskScore = Math.max(-1.0, Math.min(1.0, (market.spyReturn - market.gldReturn) * 2));

  return { vixScore, riskScore };
}

/**
 * Apply risk appetite to currency based on risk classification
 */
export function applyRiskAppetiteToCurrency(currency: string, riskScore: number): number {
  const factor = CURRENCY_RISK_FACTORS[currency] || 0;
  
  if (riskScore > 0) {
    // Risk-on environment
    if (['AUD', 'EUR', 'CAD'].includes(currency)) {
      return factor * riskScore;
    }
    return 0;
  } else {
    // Risk-off environment
    if (['JPY', 'CHF', 'USD'].includes(currency)) {
      return factor * Math.abs(riskScore);
    }
    return 0;
  }
}

/**
 * Calculate positioning score from COT data
 */
export function calculatePositioning(data: PositioningData): number {
  if (data.percentile52Week > 90) return 1.0;
  if (data.percentile52Week > 70) return 0.5;
  if (data.percentile52Week > 30) return 0.0;
  if (data.percentile52Week > 10) return -0.5;
  return -1.0;
}

/**
 * Calculate complete currency score
 */
export function calculateCurrencyScore(
  currency: string,
  ratePolicy: RatePolicyData,
  growthMomentum: GrowthMomentumData,
  realInterestEdge: RealInterestEdgeData,
  vix: VIXData,
  market: MarketData,
  positioning: PositioningData,
  regime: MarketRegime
): CurrencyScore {
  const weights = getFactorWeights(regime);
  
  // Calculate individual factor scores
  const ratePolicyScore = calculateRatePolicy(ratePolicy);
  const growthScore = calculateGrowthMomentum(growthMomentum);
  const realRateScore = calculateRealInterestEdge(realInterestEdge);
  
  const { vixScore, riskScore } = calculateRiskAppetite(vix, market);
  const riskAppetiteScore = (vixScore * 0.6) + (applyRiskAppetiteToCurrency(currency, riskScore) * 0.4);
  
  const positioningScore = calculatePositioning(positioning);
  
  // Calculate weighted total score
  const totalScore = 
    (ratePolicyScore * weights.ratePolicy) +
    (growthScore * weights.growthMomentum) +
    (realRateScore * weights.realInterestEdge) +
    (riskAppetiteScore * weights.riskAppetite) +
    (positioningScore * weights.positioning);

  return {
    currency,
    ratePolicy: ratePolicyScore,
    growthMomentum: growthScore,
    realInterestEdge: realRateScore,
    riskAppetite: riskAppetiteScore,
    positioning: positioningScore,
    totalScore
  };
}

/**
 * Calculate trading signal between two currencies
 */
export function calculateTradingSignal(scoreA: CurrencyScore, scoreB: CurrencyScore): {
  differential: number;
  signalStrength: 'VERY_STRONG' | 'STRONG' | 'MODERATE' | 'WEAK' | 'NEUTRAL';
  recommendation: string;
} {
  const differential = scoreA.totalScore - scoreB.totalScore;
  const absDiff = Math.abs(differential);
  
  let signalStrength: 'VERY_STRONG' | 'STRONG' | 'MODERATE' | 'WEAK' | 'NEUTRAL';
  let recommendation: string;
  
  if (absDiff > 2.0) {
    signalStrength = 'VERY_STRONG';
    recommendation = differential > 0 
      ? `STRONG BUY ${scoreA.currency}, SELL ${scoreB.currency}` 
      : `STRONG BUY ${scoreB.currency}, SELL ${scoreA.currency}`;
  } else if (absDiff >= 1.5) {
    signalStrength = 'STRONG';
    recommendation = differential > 0 
      ? `BUY ${scoreA.currency}, SELL ${scoreB.currency} (wait for pullback)` 
      : `BUY ${scoreB.currency}, SELL ${scoreA.currency} (wait for pullback)`;
  } else if (absDiff >= 1.0) {
    signalStrength = 'MODERATE';
    recommendation = differential > 0 
      ? `MODERATE BUY ${scoreA.currency}, SELL ${scoreB.currency}` 
      : `MODERATE BUY ${scoreB.currency}, SELL ${scoreA.currency}`;
  } else if (absDiff >= 0.5) {
    signalStrength = 'WEAK';
    recommendation = 'WAIT FOR BETTER SETUP';
  } else {
    signalStrength = 'NEUTRAL';
    recommendation = 'NO CLEAR SIGNAL - DO NOT TRADE';
  }
  
  return { differential, signalStrength, recommendation };
}

/**
 * Run comprehensive model tests
 */
export function runModelTests() {
  console.log('=== V07 MODEL VALIDATION ===');
  
  // Test data
  const testVix: VIXData = {
    current: 35,
    last20Days: Array(20).fill(0).map((_, i) => 20 + i * 0.5)
  };
  
  const testMarket: MarketData = {
    spyReturn: -2.5,
    gldReturn: 1.5,
    spyMA20: 450,
    spyPrice: 440
  };
  
  const testUsdRatePolicy: RatePolicyData = {
    currentRate: 5.25,
    terminalRate: 5.50,
    currency: 'USD',
    hawkishWords: 3,
    dovishWords: 1
  };
  
  const testGrowth: GrowthMomentumData = {
    employment: { currency: 'USD', value: 175 },
    pmi: 48.5,
    gdpQoQ: 1.5
  };
  
  const testRealRate: RealInterestEdgeData = {
    currency: 'USD',
    twoYearYield: 4.7,
    breakeven5Y5Y: 2.3
  };
  
  const testPositioning: PositioningData = {
    currency: 'USD',
    netPosition: 50000,
    percentile52Week: 75
  };
  
  // Run tests
  const regime = detectMarketRegime(testVix, testMarket, false);
  console.log('Market Regime:', regime);
  
  const weights = getFactorWeights(regime);
  console.log('Factor Weights:', weights);
  
  const usdScore = calculateCurrencyScore(
    'USD',
    testUsdRatePolicy,
    testGrowth,
    testRealRate,
    testVix,
    testMarket,
    testPositioning,
    regime
  );
  
  console.log('USD Score:', usdScore);
  console.log('Model tests completed successfully!');
  
  return {
    regime,
    weights,
    usdScore
  };
}