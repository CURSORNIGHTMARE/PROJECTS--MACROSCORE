// PERFECT RETAIL FOREX MACRO SCORING MODEL V07
// Core calculation implementation

export interface VixData {
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
  hawkishWords?: number;
  dovishWords?: number;
}

export interface EmploymentData {
  currency: string;
  value: number;
}

export interface GrowthMomentumData {
  employment: EmploymentData;
  pmi: number;
  gdpQoQ: number;
}

export interface RealInterestEdgeData {
  currency: string;
  twoYearYield: number;
  breakeven5Y5Y: number;
}

export interface RiskAppetiteData {
  vixScore: number;
  riskScore: number;
  currency: string;
}

export interface PositioningData {
  currency: string;
  percentile: number;
}

export interface FactorWeights {
  ratePolicy: number;
  growthMomentum: number;
  realInterestEdge: number;
  riskAppetite: number;
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

export type MarketRegime = 'RISK_OFF' | 'RISK_ON' | 'NEUTRAL' | 'CENTRAL_BANK_WEEK';

// Rate sensitivity by currency
const RATE_SENSITIVITY: Record<string, number> = {
  USD: 0.4,
  EUR: 0.6,
  GBP: 0.5,
  JPY: 1.0,
  AUD: 0.4,
  CAD: 0.3,
  CHF: 0.8
};

// Currency risk factors for risk appetite calculation
const CURRENCY_RISK_FACTORS: Record<string, { riskOn: number; safeHaven: number }> = {
  USD: { riskOn: 0, safeHaven: 0.3 },
  EUR: { riskOn: 0.5, safeHaven: 0 },
  GBP: { riskOn: 0.3, safeHaven: 0 },
  JPY: { riskOn: 0, safeHaven: 1.0 },
  AUD: { riskOn: 1.0, safeHaven: 0 },
  CAD: { riskOn: 0.3, safeHaven: 0 },
  CHF: { riskOn: 0, safeHaven: 0.8 }
};

// Employment thresholds by currency
const EMPLOYMENT_THRESHOLDS: Record<string, { strong: number; weak: number; type: 'nfp' | 'rate' | 'count' | 'ratio' }> = {
  USD: { strong: 180, weak: 100, type: 'nfp' }, // NFP in thousands
  EUR: { strong: 0.3, weak: -0.1, type: 'rate' }, // Employment Rate YoY %
  GBP: { strong: -20, weak: 40, type: 'count' }, // Claimant Count change in thousands
  JPY: { strong: 1.30, weak: 1.25, type: 'ratio' }, // Job-to-applicant ratio
  AUD: { strong: 66.5, weak: 66.0, type: 'rate' }, // Participation Rate %
  CAD: { strong: 62.5, weak: 61.5, type: 'rate' } // Employment Rate %
};

/**
 * Detects the current market regime based on VIX and market performance
 */
export function detectMarketRegime(
  vixData: VixData, 
  marketData: MarketData, 
  isCentralBankWeek: boolean = false
): MarketRegime {
  if (isCentralBankWeek) {
    return 'CENTRAL_BANK_WEEK';
  }

  // Calculate VIX percentile over last 20 days
  const sortedVix = [...vixData.last20Days].sort((a, b) => a - b);
  const currentVixPercentile = (sortedVix.filter(v => v <= vixData.current).length / sortedVix.length) * 100;
  
  // Check for risk-off conditions
  const vixRiskOff = currentVixPercentile > 75;
  const goldOutperformsSpx = (marketData.gldReturn - marketData.spyReturn) > 0;
  
  if (vixRiskOff || goldOutperformsSpx) {
    return 'RISK_OFF';
  }
  
  // Check for risk-on conditions
  const vixRiskOn = currentVixPercentile < 25;
  const spxAboveMA = marketData.spyPrice > marketData.spyMA20;
  
  if (vixRiskOn && spxAboveMA) {
    return 'RISK_ON';
  }
  
  return 'NEUTRAL';
}

/**
 * Returns factor weights based on market regime
 */
export function getFactorWeights(regime: MarketRegime): FactorWeights {
  switch (regime) {
    case 'RISK_OFF':
      return {
        ratePolicy: 0.45,
        growthMomentum: 0.15,
        realInterestEdge: 0.25,
        riskAppetite: 0.15
      };
    case 'RISK_ON':
      return {
        ratePolicy: 0.30,
        growthMomentum: 0.35,
        realInterestEdge: 0.25,
        riskAppetite: 0.10
      };
    case 'CENTRAL_BANK_WEEK':
      return {
        ratePolicy: 0.55,
        growthMomentum: 0.15,
        realInterestEdge: 0.25,
        riskAppetite: 0.05
      };
    default: // NEUTRAL
      return {
        ratePolicy: 0.35,
        growthMomentum: 0.25,
        realInterestEdge: 0.30,
        riskAppetite: 0.10
      };
  }
}

/**
 * Calculates rate policy factor score (35% of total)
 */
export function calculateRatePolicy(data: RatePolicyData): number {
  // A. Rate Differential Model (80% of factor)
  const rateGap = data.terminalRate - data.currentRate;
  const sensitivity = RATE_SENSITIVITY[data.currency] || 0.5;
  const rateDifferentialScore = rateGap * sensitivity;
  
  // B. Central Bank Tone Shift (20% of factor)
  const hawkishWords = data.hawkishWords || 0;
  const dovishWords = data.dovishWords || 0;
  const toneScore = Math.max(-1.0, Math.min(1.0, (hawkishWords - dovishWords) * 0.1));
  
  // Combine scores
  const finalScore = (rateDifferentialScore * 0.8) + (toneScore * 0.2);
  
  return finalScore;
}

/**
 * Calculates growth momentum factor score (25% of total)
 */
export function calculateGrowthMomentum(data: GrowthMomentumData): number {
  // A. Employment Component (40% of factor)
  const employmentScore = calculateEmploymentScore(data.employment);
  
  // B. Manufacturing Component (30% of factor) - PMI
  let manufacturingScore = 0;
  if (data.pmi > 52) manufacturingScore = 1.0;
  else if (data.pmi >= 50) manufacturingScore = 0.5;
  else if (data.pmi >= 48) manufacturingScore = 0.0;
  else if (data.pmi >= 45) manufacturingScore = -0.5;
  else manufacturingScore = -1.0;
  
  // C. GDP Momentum (30% of factor)
  let gdpScore = 0;
  if (data.gdpQoQ > 3.0) gdpScore = 1.0;
  else if (data.gdpQoQ >= 2.0) gdpScore = 0.5;
  else if (data.gdpQoQ >= 1.0) gdpScore = 0.0;
  else if (data.gdpQoQ >= 0) gdpScore = -0.5;
  else gdpScore = -1.0;
  
  // Combine components
  const finalScore = (employmentScore * 0.4) + (manufacturingScore * 0.3) + (gdpScore * 0.3);
  
  return finalScore;
}

/**
 * Calculates employment score based on currency-specific thresholds
 */
function calculateEmploymentScore(employment: EmploymentData): number {
  const threshold = EMPLOYMENT_THRESHOLDS[employment.currency];
  if (!threshold) return 0;
  
  const { strong, weak, type } = threshold;
  
  // For claimant count (GBP), lower is better
  if (type === 'count') {
    if (employment.value <= strong) return 1.0;
    if (employment.value >= weak) return -1.0;
    return (strong - employment.value) / (strong - weak) * 2 - 1;
  }
  
  // For other metrics, higher is better
  if (employment.value >= strong) return 1.0;
  if (employment.value <= weak) return -1.0;
  
  // Linear interpolation between weak and strong
  return (employment.value - weak) / (strong - weak) * 2 - 1;
}

/**
 * Calculates real interest edge factor score (30% of total)
 */
export function calculateRealInterestEdge(data: RealInterestEdgeData): number {
  // Real Rate = 2-Year Government Yield - 5Y5Y Breakeven Inflation Rate
  const realRate = data.twoYearYield - data.breakeven5Y5Y;
  
  // Return the real rate (will be compared against other currencies)
  return realRate * 1.5; // Multiplier for scoring
}

/**
 * Calculates real interest edge differential between two currencies
 */
export function calculateRealRateDifferential(
  currencyA: RealInterestEdgeData, 
  currencyB: RealInterestEdgeData
): number {
  const realRateA = currencyA.twoYearYield - currencyA.breakeven5Y5Y;
  const realRateB = currencyB.twoYearYield - currencyB.breakeven5Y5Y;
  
  return (realRateA - realRateB) * 1.5;
}

/**
 * Calculates risk appetite factor score (10% of total)
 */
export function calculateRiskAppetite(
  vixData: VixData, 
  marketData: MarketData, 
  currency: string
): number {
  // A. Volatility Regime (60% of factor)
  const sortedVix = [...vixData.last20Days].sort((a, b) => a - b);
  const currentVixPercentile = (sortedVix.filter(v => v <= vixData.current).length / sortedVix.length) * 100;
  
  let vixScore = 0;
  if (currentVixPercentile < 20) vixScore = 1.0;
  else if (currentVixPercentile < 40) vixScore = 0.5;
  else if (currentVixPercentile < 60) vixScore = 0.0;
  else if (currentVixPercentile < 80) vixScore = -0.5;
  else vixScore = -1.0;
  
  // B. Cross-Asset Risk Sentiment (40% of factor)
  const riskScore = Math.max(-1.0, Math.min(1.0, (marketData.spyReturn - marketData.gldReturn) * 2));
  
  // Apply currency-specific risk factors
  const currencyFactors = CURRENCY_RISK_FACTORS[currency];
  if (!currencyFactors) return 0;
  
  let currencyAdjustedScore = 0;
  if (riskScore > 0) {
    // Risk-on environment
    currencyAdjustedScore = riskScore * currencyFactors.riskOn;
  } else {
    // Risk-off environment
    currencyAdjustedScore = Math.abs(riskScore) * currencyFactors.safeHaven;
  }
  
  // Combine VIX and risk sentiment
  const finalScore = (vixScore * 0.6) + (currencyAdjustedScore * 0.4);
  
  return finalScore;
}

/**
 * Calculates positioning factor score (5% of total)
 */
export function calculatePositioning(data: PositioningData): number {
  // Convert percentile to score
  if (data.percentile > 90) return 1.0;
  if (data.percentile > 70) return 0.5;
  if (data.percentile > 30) return 0.0;
  if (data.percentile > 10) return -0.5;
  return -1.0;
}

/**
 * Calculates the final currency score combining all factors
 */
export function calculateCurrencyScore(
  currency: string,
  ratePolicy: RatePolicyData,
  growthMomentum: GrowthMomentumData,
  realInterestEdge: RealInterestEdgeData,
  vixData: VixData,
  marketData: MarketData,
  positioning: PositioningData,
  regime: MarketRegime
): CurrencyScore {
  const weights = getFactorWeights(regime);
  
  const ratePolicyScore = calculateRatePolicy(ratePolicy);
  const growthMomentumScore = calculateGrowthMomentum(growthMomentum);
  const realInterestEdgeScore = calculateRealInterestEdge(realInterestEdge);
  const riskAppetiteScore = calculateRiskAppetite(vixData, marketData, currency);
  const positioningScore = calculatePositioning(positioning);
  
  const totalScore = 
    (ratePolicyScore * weights.ratePolicy) +
    (growthMomentumScore * weights.growthMomentum) +
    (realInterestEdgeScore * weights.realInterestEdge) +
    (riskAppetiteScore * weights.riskAppetite) +
    (positioningScore * 0.05); // 5% weight for positioning
  
  return {
    currency,
    ratePolicy: ratePolicyScore,
    growthMomentum: growthMomentumScore,
    realInterestEdge: realInterestEdgeScore,
    riskAppetite: riskAppetiteScore,
    positioning: positioningScore,
    totalScore
  };
}

/**
 * Calculates trading signal between two currencies
 */
export function calculateTradingSignal(
  currencyAScore: CurrencyScore,
  currencyBScore: CurrencyScore
): {
  pair: string;
  scoreDifferential: number;
  bias: string;
  strength: string;
  confidence: string;
} {
  const scoreDifferential = currencyAScore.totalScore - currencyBScore.totalScore;
  const pair = `${currencyAScore.currency}/${currencyBScore.currency}`;
  
  let bias = 'NEUTRAL';
  let strength = 'NEUTRAL';
  let confidence = 'LOW';
  
  if (Math.abs(scoreDifferential) >= 2.0) {
    strength = 'VERY_STRONG';
    confidence = 'HIGH';
  } else if (Math.abs(scoreDifferential) >= 1.5) {
    strength = 'STRONG';
    confidence = 'MEDIUM_HIGH';
  } else if (Math.abs(scoreDifferential) >= 1.0) {
    strength = 'MODERATE';
    confidence = 'MEDIUM';
  } else if (Math.abs(scoreDifferential) >= 0.5) {
    strength = 'WEAK';
    confidence = 'LOW_MEDIUM';
  }
  
  if (scoreDifferential > 0.5) {
    bias = `BUY_${currencyAScore.currency}_SELL_${currencyBScore.currency}`;
  } else if (scoreDifferential < -0.5) {
    bias = `BUY_${currencyBScore.currency}_SELL_${currencyAScore.currency}`;
  }
  
  return {
    pair,
    scoreDifferential,
    bias,
    strength,
    confidence
  };
}

/**
 * Gets percentile of a value within an array
 */
export function getPercentile(value: number, array: number[]): number {
  const sorted = [...array].sort((a, b) => a - b);
  const index = sorted.findIndex(v => v >= value);
  return index === -1 ? 100 : (index / sorted.length) * 100;
}

/**
 * Helper function to run model tests
 */
export function runModelTests(testData: any): any {
  console.log('Running model tests with data:', testData);
  
  const regime = detectMarketRegime(testData.vix, testData.market, false);
  const weights = getFactorWeights(regime);
  const rateScore = calculateRatePolicy(testData.usd.ratePolicy);
  const growthScore = calculateGrowthMomentum(testData.usd.growthMomentum);
  const realRateScore = calculateRealInterestEdge(testData.usd.realInterestEdge);
  
  return {
    regime,
    weights,
    rateScore,
    growthScore,
    realRateScore
  };
}

// Export all functions for use in other modules
export {
  RATE_SENSITIVITY,
  CURRENCY_RISK_FACTORS,
  EMPLOYMENT_THRESHOLDS
};