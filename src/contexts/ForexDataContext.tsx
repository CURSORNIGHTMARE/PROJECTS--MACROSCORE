import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  MarketRegime,
  VixData,
  MarketData,
  RatePolicyData,
  GrowthMomentumData,
  RealInterestEdgeData,
  PositioningData,
  CurrencyScore,
  FactorWeights,
  detectMarketRegime,
  getFactorWeights,
  calculateCurrencyScore,
  calculateTradingSignal,
  runModelTests
} from '../lib/modelCalculations';

// Currency data interfaces
interface CurrencyData {
  currency: string;
  ratePolicy: RatePolicyData;
  growthMomentum: GrowthMomentumData;
  realInterestEdge: RealInterestEdgeData;
  positioning: PositioningData;
}

interface ForexDataState {
  // Market data
  vixData: VixData | null;
  marketData: MarketData | null;
  marketRegime: MarketRegime | null;
  factorWeights: FactorWeights | null;
  isCentralBankWeek: boolean;
  
  // Currency data
  currencies: Record<string, CurrencyData>;
  currencyScores: Record<string, CurrencyScore>;
  
  // Trading signals
  tradingSignals: Array<{
    pair: string;
    scoreDifferential: number;
    bias: string;
    strength: string;
    confidence: string;
  }>;
  
  // Loading states
  isLoading: boolean;
  lastUpdated: Date | null;
  
  // Errors
  error: string | null;
}

interface ForexDataContextType extends ForexDataState {
  // Data update functions
  updateVixData: (data: VixData) => void;
  updateMarketData: (data: MarketData) => void;
  updateCurrencyData: (currency: string, data: Partial<CurrencyData>) => void;
  setCentralBankWeek: (isWeek: boolean) => void;
  
  // Calculation functions
  recalculateAll: () => void;
  calculateSignals: () => void;
  
  // Utility functions
  getCurrencyScore: (currency: string) => CurrencyScore | null;
  getTopSignals: (count?: number) => Array<{
    pair: string;
    scoreDifferential: number;
    bias: string;
    strength: string;
    confidence: string;
  }>;
  
  // Test function
  runTests: () => void;
}

const ForexDataContext = createContext<ForexDataContextType | undefined>(undefined);

// Default currency list
const DEFAULT_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF'];

// Sample data for testing
const SAMPLE_VIX_DATA: VixData = {
  current: 22.5,
  last20Days: [18.2, 19.1, 20.3, 21.5, 22.1, 23.0, 24.2, 25.1, 26.0, 24.8, 23.5, 22.7, 21.9, 20.8, 19.6, 18.9, 17.8, 18.4, 19.2, 20.1]
};

const SAMPLE_MARKET_DATA: MarketData = {
  spyReturn: 1.2,
  gldReturn: -0.5,
  spyMA20: 450,
  spyPrice: 455
};

// Default currency data factory
const createDefaultCurrencyData = (currency: string): CurrencyData => ({
  currency,
  ratePolicy: {
    currentRate: 5.0,
    terminalRate: 5.25,
    currency,
    hawkishWords: 2,
    dovishWords: 1
  },
  growthMomentum: {
    employment: { currency, value: 175 },
    pmi: 51.2,
    gdpQoQ: 2.1
  },
  realInterestEdge: {
    currency,
    twoYearYield: 4.5,
    breakeven5Y5Y: 2.2
  },
  positioning: {
    currency,
    percentile: 50
  }
});

export const ForexDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ForexDataState>(() => {
    // Initialize with sample data
    const initialCurrencies: Record<string, CurrencyData> = {};
    DEFAULT_CURRENCIES.forEach(currency => {
      initialCurrencies[currency] = createDefaultCurrencyData(currency);
    });
    
    return {
      vixData: SAMPLE_VIX_DATA,
      marketData: SAMPLE_MARKET_DATA,
      marketRegime: null,
      factorWeights: null,
      isCentralBankWeek: false,
      currencies: initialCurrencies,
      currencyScores: {},
      tradingSignals: [],
      isLoading: false,
      lastUpdated: null,
      error: null
    };
  });

  const updateVixData = (data: VixData) => {
    setState(prev => ({ ...prev, vixData: data }));
  };

  const updateMarketData = (data: MarketData) => {
    setState(prev => ({ ...prev, marketData: data }));
  };

  const updateCurrencyData = (currency: string, data: Partial<CurrencyData>) => {
    setState(prev => ({
      ...prev,
      currencies: {
        ...prev.currencies,
        [currency]: {
          ...prev.currencies[currency],
          ...data
        }
      }
    }));
  };

  const setCentralBankWeek = (isWeek: boolean) => {
    setState(prev => ({ ...prev, isCentralBankWeek: isWeek }));
  };

  const recalculateAll = () => {
    setState(prev => {
      if (!prev.vixData || !prev.marketData) {
        return { ...prev, error: 'Missing market data for calculations' };
      }

      try {
        // Calculate market regime
        const regime = detectMarketRegime(prev.vixData, prev.marketData, prev.isCentralBankWeek);
        const weights = getFactorWeights(regime);

        // Calculate currency scores
        const newScores: Record<string, CurrencyScore> = {};
        Object.values(prev.currencies).forEach(currencyData => {
          const score = calculateCurrencyScore(
            currencyData.currency,
            currencyData.ratePolicy,
            currencyData.growthMomentum,
            currencyData.realInterestEdge,
            prev.vixData!,
            prev.marketData!,
            currencyData.positioning,
            regime
          );
          newScores[currencyData.currency] = score;
        });

        return {
          ...prev,
          marketRegime: regime,
          factorWeights: weights,
          currencyScores: newScores,
          lastUpdated: new Date(),
          error: null
        };
      } catch (error) {
        return {
          ...prev,
          error: error instanceof Error ? error.message : 'Unknown calculation error'
        };
      }
    });
  };

  const calculateSignals = () => {
    setState(prev => {
      const signals = [];
      const currencies = Object.keys(prev.currencyScores);
      
      // Generate all possible pairs
      for (let i = 0; i < currencies.length; i++) {
        for (let j = i + 1; j < currencies.length; j++) {
          const currencyA = currencies[i];
          const currencyB = currencies[j];
          const scoreA = prev.currencyScores[currencyA];
          const scoreB = prev.currencyScores[currencyB];
          
          if (scoreA && scoreB) {
            const signal = calculateTradingSignal(scoreA, scoreB);
            signals.push(signal);
          }
        }
      }
      
      // Sort by absolute score differential (strongest signals first)
      signals.sort((a, b) => Math.abs(b.scoreDifferential) - Math.abs(a.scoreDifferential));
      
      return {
        ...prev,
        tradingSignals: signals
      };
    });
  };

  const getCurrencyScore = (currency: string): CurrencyScore | null => {
    return state.currencyScores[currency] || null;
  };

  const getTopSignals = (count: number = 5) => {
    return state.tradingSignals.slice(0, count);
  };

  const runTests = () => {
    try {
      if (state.vixData && state.marketData) {
        const testData = {
          vix: state.vixData,
          market: state.marketData,
          usd: state.currencies.USD
        };
        
        const results = runModelTests(testData);
        console.log('Model test results:', results);
      }
    } catch (error) {
      console.error('Error running tests:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Test execution error'
      }));
    }
  };

  // Auto-calculate when relevant data changes
  useEffect(() => {
    recalculateAll();
  }, [state.vixData, state.marketData, state.currencies, state.isCentralBankWeek]);

  // Auto-calculate signals when scores change
  useEffect(() => {
    if (Object.keys(state.currencyScores).length > 0) {
      calculateSignals();
    }
  }, [state.currencyScores]);

  const contextValue: ForexDataContextType = {
    ...state,
    updateVixData,
    updateMarketData,
    updateCurrencyData,
    setCentralBankWeek,
    recalculateAll,
    calculateSignals,
    getCurrencyScore,
    getTopSignals,
    runTests
  };

  return (
    <ForexDataContext.Provider value={contextValue}>
      {children}
    </ForexDataContext.Provider>
  );
};

export const useForexData = (): ForexDataContextType => {
  const context = useContext(ForexDataContext);
  if (context === undefined) {
    throw new Error('useForexData must be used within a ForexDataProvider');
  }
  return context;
};

export default ForexDataContext;