import React from 'react';
import { useForexData } from '../contexts/ForexDataContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

function getSignalStrengthColor(strength: string): string {
  switch (strength) {
    case 'VERY_STRONG': return 'success';
    case 'STRONG': return 'success';
    case 'MODERATE': return 'warning';
    case 'WEAK': return 'warning';
    default: return 'secondary';
  }
}

function getRegimeColor(regime: string): string {
  switch (regime) {
    case 'RISK_OFF': return 'danger';
    case 'RISK_ON': return 'success';
    case 'CENTRAL_BANK_WEEK': return 'warning';
    default: return 'secondary';
  }
}

function getRegimeIcon(regime: string) {
  switch (regime) {
    case 'RISK_OFF': return TrendingDown;
    case 'RISK_ON': return TrendingUp;
    case 'CENTRAL_BANK_WEEK': return AlertTriangle;
    default: return Activity;
  }
}

export default function Dashboard() {
  const { 
    marketRegime, 
    currencyScores, 
    getTradingSignal, 
    runTests,
    vixData,
    marketData
  } = useForexData();

  const currencies = Object.keys(currencyScores);
  const sortedCurrencies = currencies.sort((a, b) => 
    currencyScores[b].totalScore - currencyScores[a].totalScore
  );

  const majorPairs = [
    { base: 'EUR', quote: 'USD', name: 'EUR/USD' },
    { base: 'GBP', quote: 'USD', name: 'GBP/USD' },
    { base: 'USD', quote: 'JPY', name: 'USD/JPY' },
    { base: 'AUD', quote: 'USD', name: 'AUD/USD' },
    { base: 'USD', quote: 'CAD', name: 'USD/CAD' },
  ];

  const RegimeIcon = getRegimeIcon(marketRegime);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Forex Model Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            V07 Perfect Retail Forex Macro Scoring Model
          </p>
        </div>
        <Button onClick={runTests} variant="outline">
          Run Model Tests
        </Button>
      </div>

      {/* Market Regime */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <RegimeIcon className="h-5 w-5" />
            <CardTitle>Market Regime</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge variant={getRegimeColor(marketRegime) as any} className="text-sm px-3 py-1">
                {marketRegime.replace('_', ' ')}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">
                VIX: {vixData.current} | SPY: {marketData.spyReturn}% | GLD: {marketData.gldReturn}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Currency Strength Rankings */}
      <Card>
        <CardHeader>
          <CardTitle>Currency Strength Rankings</CardTitle>
          <CardDescription>
            Based on comprehensive macro analysis including rates, growth, real yields, and positioning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedCurrencies.map((currency, index) => {
              const score = currencyScores[currency];
              const isPositive = score.totalScore > 0;
              
              return (
                <div key={currency} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">{currency}</span>
                      <span className="text-sm text-muted-foreground">#{index + 1}</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      <span className="font-mono text-sm">
                        {score.totalScore.toFixed(3)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Rate Policy:</span>
                      <span className="font-mono">{score.ratePolicy.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Growth:</span>
                      <span className="font-mono">{score.growthMomentum.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Real Yield:</span>
                      <span className="font-mono">{score.realInterestEdge.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Risk Appetite:</span>
                      <span className="font-mono">{score.riskAppetite.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Trading Signals */}
      <Card>
        <CardHeader>
          <CardTitle>Major Currency Pair Signals</CardTitle>
          <CardDescription>
            Trading recommendations based on currency score differentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {majorPairs.map((pair) => {
              const signal = getTradingSignal(pair.base, pair.quote);
              if (!signal) return null;

              const signalColor = getSignalStrengthColor(signal.signalStrength);
              const isLong = signal.differential > 0;
              
              return (
                <div key={pair.name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="font-bold text-lg">{pair.name}</span>
                    <Badge variant={signalColor as any}>
                      {signal.signalStrength}
                    </Badge>
                  </div>
                  
                  <div className="text-right">
                    <div className={`flex items-center space-x-2 ${isLong ? 'text-green-600' : 'text-red-600'}`}>
                      {isLong ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      <span className="font-mono">
                        {signal.differential.toFixed(3)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {signal.recommendation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Strongest Currency</p>
                <p className="text-2xl font-bold">{sortedCurrencies[0]}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Market Volatility</p>
                <p className="text-2xl font-bold">{vixData.current}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Signals</p>
                <p className="text-2xl font-bold">
                  {majorPairs.filter(pair => {
                    const signal = getTradingSignal(pair.base, pair.quote);
                    return signal && ['VERY_STRONG', 'STRONG'].includes(signal.signalStrength);
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}