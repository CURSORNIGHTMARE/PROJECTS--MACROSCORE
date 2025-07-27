import React from 'react';
import { useForexData } from '../contexts/ForexDataContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { getFactorWeights } from '../lib/modelCalculations';

export default function Analytics() {
  const { marketRegime, currencyScores, currencyData } = useForexData();
  
  const weights = getFactorWeights(marketRegime);
  const currencies = Object.keys(currencyScores);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Model Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Detailed breakdown of V07 model calculations and factor analysis
        </p>
      </div>

      {/* Factor Weights */}
      <Card>
        <CardHeader>
          <CardTitle>Current Factor Weights</CardTitle>
          <CardDescription>
            Dynamic weights based on {marketRegime.replace('_', ' ')} market regime
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {(weights.ratePolicy * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">Rate Policy</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {(weights.growthMomentum * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">Growth Momentum</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {(weights.realInterestEdge * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">Real Interest Edge</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {(weights.riskAppetite * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">Risk Appetite</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {(weights.positioning * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">Positioning</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Currency Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {currencies.map((currency) => {
          const score = currencyScores[currency];
          const data = currencyData[currency];
          
          return (
            <Card key={currency}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{currency}</span>
                  <Badge variant={score.totalScore > 0 ? 'success' : 'danger'}>
                    {score.totalScore.toFixed(3)}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Comprehensive factor analysis and calculations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Rate Policy */}
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-blue-600">Rate Policy</span>
                    <span className="font-mono text-sm">{score.ratePolicy.toFixed(3)}</span>
                  </div>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Current Rate:</span>
                      <span>{data.ratePolicy.currentRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Terminal Rate:</span>
                      <span>{data.ratePolicy.terminalRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hawkish Words:</span>
                      <span>{data.ratePolicy.hawkishWords}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dovish Words:</span>
                      <span>{data.ratePolicy.dovishWords}</span>
                    </div>
                  </div>
                </div>

                {/* Growth Momentum */}
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-green-600">Growth Momentum</span>
                    <span className="font-mono text-sm">{score.growthMomentum.toFixed(3)}</span>
                  </div>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Employment Metric:</span>
                      <span>{data.growthMomentum.employment.value}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>PMI:</span>
                      <span>{data.growthMomentum.pmi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GDP QoQ:</span>
                      <span>{data.growthMomentum.gdpQoQ}%</span>
                    </div>
                  </div>
                </div>

                {/* Real Interest Edge */}
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-purple-600">Real Interest Edge</span>
                    <span className="font-mono text-sm">{score.realInterestEdge.toFixed(3)}</span>
                  </div>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <div className="flex justify-between">
                      <span>2Y Yield:</span>
                      <span>{data.realInterestEdge.twoYearYield}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>5Y5Y Breakeven:</span>
                      <span>{data.realInterestEdge.breakeven5Y5Y}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Real Rate:</span>
                      <span>{(data.realInterestEdge.twoYearYield - data.realInterestEdge.breakeven5Y5Y).toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                {/* Risk Appetite */}
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-orange-600">Risk Appetite</span>
                    <span className="font-mono text-sm">{score.riskAppetite.toFixed(3)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Impact based on currency risk classification and current market sentiment
                  </div>
                </div>

                {/* Positioning */}
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-red-600">Positioning</span>
                    <span className="font-mono text-sm">{score.positioning.toFixed(3)}</span>
                  </div>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Net Position:</span>
                      <span>{data.positioning.netPosition.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>52W Percentile:</span>
                      <span>{data.positioning.percentile52Week}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Model Methodology */}
      <Card>
        <CardHeader>
          <CardTitle>V07 Model Methodology</CardTitle>
          <CardDescription>
            Key improvements and calculation methodology
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">📊 Regime Detection</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Dynamic VIX percentile thresholds (20-day rolling)</li>
                <li>• SPY vs GLD performance comparison</li>
                <li>• Central bank week adjustments</li>
                <li>• Factor weight adaptation by regime</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">🏦 Rate Policy (35%)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Market terminal rates vs current policy (80%)</li>
                <li>• Central bank tone analysis (20%)</li>
                <li>• Currency-specific rate sensitivity</li>
                <li>• OIS-based market expectations</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">📈 Growth Momentum (25%)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Employment metrics by currency (40%)</li>
                <li>• Manufacturing PMI analysis (30%)</li>
                <li>• GDP quarter-over-quarter (30%)</li>
                <li>• Country-specific thresholds</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">💰 Real Interest Edge (30%)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 2-year government yields</li>
                <li>• 5Y5Y breakeven inflation rates</li>
                <li>• Real rate differentials</li>
                <li>• Market-based inflation expectations</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">🌊 Risk Appetite (10%)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• VIX percentile scoring (60%)</li>
                <li>• SPY vs GLD performance (40%)</li>
                <li>• Currency risk classification</li>
                <li>• Safe haven vs risk-on beneficiaries</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">💸 Positioning (5%)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• COT large speculator data</li>
                <li>• 52-week percentile rankings</li>
                <li>• Extreme positioning identification</li>
                <li>• Weekly commitment reports</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}