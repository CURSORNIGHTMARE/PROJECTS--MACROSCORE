import React from 'react';
import { useForexData } from '../contexts/ForexDataContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, Target } from 'lucide-react';

const TradingSignals: React.FC = () => {
  const { tradingSignals, getTopSignals } = useForexData();

  const getSignalIcon = (bias: string) => {
    if (bias.includes('BUY')) return <TrendingUp className="w-4 h-4" />;
    if (bias.includes('SELL')) return <TrendingDown className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const getSignalColor = (strength: string) => {
    switch (strength) {
      case 'VERY_STRONG': return 'bg-green-100 text-green-800 border-green-200';
      case 'STRONG': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'MODERATE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'WEAK': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'HIGH': return 'text-green-600';
      case 'MEDIUM_HIGH': return 'text-blue-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'LOW_MEDIUM': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const formatPair = (pair: string) => {
    const [base, quote] = pair.split('/');
    return { base, quote };
  };

  const formatBias = (bias: string) => {
    if (bias === 'NEUTRAL') return 'Hold';
    
    const parts = bias.split('_');
    if (parts.length >= 4) {
      const action = parts[0]; // BUY or SELL
      const currency1 = parts[1];
      const direction = parts[2]; // SELL
      const currency2 = parts[3];
      
      return `${action} ${currency1}/${currency2}`;
    }
    
    return bias.replace(/_/g, ' ');
  };

  const topSignals = getTopSignals(10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Trading Signals
          <Badge variant="outline">{tradingSignals.length} pairs analyzed</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topSignals.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No trading signals available</p>
            <p className="text-sm mt-2">Update market data to generate signals</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Signal Strength Legend */}
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge className="bg-green-100 text-green-800">Very Strong (&gt;2.0)</Badge>
              <Badge className="bg-blue-100 text-blue-800">Strong (1.5-2.0)</Badge>
              <Badge className="bg-yellow-100 text-yellow-800">Moderate (1.0-1.5)</Badge>
              <Badge className="bg-gray-100 text-gray-800">Weak (0.5-1.0)</Badge>
            </div>

            {/* Top Signals */}
            <div className="space-y-3">
              {topSignals.map((signal, index) => {
                const { base, quote } = formatPair(signal.pair);
                const isPositive = signal.scoreDifferential > 0;
                
                return (
                  <div
                    key={signal.pair}
                    className={`p-4 rounded-lg border-2 ${getSignalColor(signal.strength)} transition-all hover:shadow-md`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <span className="text-lg font-bold">{base}</span>
                          <span className="text-gray-400">/</span>
                          <span className="text-lg font-bold">{quote}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {getSignalIcon(signal.bias)}
                          <span className="font-medium">{formatBias(signal.bias)}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          isPositive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {isPositive ? '+' : ''}{signal.scoreDifferential.toFixed(2)}
                        </div>
                        <div className={`text-xs ${getConfidenceColor(signal.confidence)}`}>
                          {signal.confidence.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant="outline" className="text-xs">
                        {signal.strength.replace('_', ' ')} Signal
                      </Badge>
                      
                      <div className="text-gray-600">
                        Rank #{index + 1}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trading Guidelines */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Trading Guidelines</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• <strong>Very Strong (&gt;2.0):</strong> Trade immediately</p>
                <p>• <strong>Strong (1.5-2.0):</strong> Wait for small pullback</p>
                <p>• <strong>Moderate (1.0-1.5):</strong> Wait for clear setup</p>
                <p>• <strong>Weak (&lt;1.0):</strong> Only if perfect technical setup</p>
              </div>
            </div>

            {/* Risk Warning */}
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-semibold">Risk Warning</span>
              </div>
              <p className="text-sm text-amber-700 mt-1">
                These signals are based on macro analysis. Always confirm with technical analysis 
                and proper risk management before trading.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TradingSignals;