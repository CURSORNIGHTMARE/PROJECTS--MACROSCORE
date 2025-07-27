import React from 'react';
import { useForexData } from '../contexts/ForexDataContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, Activity, Eye } from 'lucide-react';

const MarketOverview: React.FC = () => {
  const { vixData, marketData, marketRegime } = useForexData();

  const getVixPercentile = () => {
    if (!vixData) return 0;
    const sortedVix = [...vixData.last20Days].sort((a, b) => a - b);
    return (sortedVix.filter(v => v <= vixData.current).length / sortedVix.length) * 100;
  };

  const getRiskSentiment = () => {
    if (!marketData) return { score: 0, label: 'Unknown' };
    const riskScore = (marketData.spyReturn - marketData.gldReturn) * 2;
    
    if (riskScore > 1) return { score: riskScore, label: 'Very Risk-On' };
    if (riskScore > 0.5) return { score: riskScore, label: 'Risk-On' };
    if (riskScore > -0.5) return { score: riskScore, label: 'Neutral' };
    if (riskScore > -1) return { score: riskScore, label: 'Risk-Off' };
    return { score: riskScore, label: 'Very Risk-Off' };
  };

  const getRegimeEmoji = (regime: string | null) => {
    switch (regime) {
      case 'RISK_OFF': return '🔴';
      case 'RISK_ON': return '🟢';
      case 'CENTRAL_BANK_WEEK': return '🏦';
      default: return '🟡';
    }
  };

  const vixPercentile = getVixPercentile();
  const riskSentiment = getRiskSentiment();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Market Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Market Regime */}
        <div className="text-center">
          <div className="text-4xl mb-2">
            {getRegimeEmoji(marketRegime)}
          </div>
          <Badge className={
            marketRegime === 'RISK_OFF' ? 'bg-red-100 text-red-800' :
            marketRegime === 'RISK_ON' ? 'bg-green-100 text-green-800' :
            marketRegime === 'CENTRAL_BANK_WEEK' ? 'bg-blue-100 text-blue-800' :
            'bg-yellow-100 text-yellow-800'
          }>
            {marketRegime || 'Calculating...'}
          </Badge>
        </div>

        {/* VIX Data */}
        {vixData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span className="font-medium">VIX Level</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{vixData.current.toFixed(1)}</div>
                <div className="text-sm text-gray-500">
                  {vixPercentile.toFixed(0)}th percentile
                </div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${
                  vixPercentile > 80 ? 'bg-red-500' :
                  vixPercentile > 60 ? 'bg-orange-500' :
                  vixPercentile > 40 ? 'bg-yellow-500' :
                  vixPercentile > 20 ? 'bg-green-400' :
                  'bg-green-500'
                }`}
                style={{ width: `${vixPercentile}%` }}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
              <span>Low (20%)</span>
              <span className="text-center">Medium</span>
              <span className="text-right">High (80%)</span>
            </div>
          </div>
        )}

        {/* Market Performance */}
        {marketData && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Weekly Performance</h4>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>SPY (Stocks)</span>
              </div>
              <div className={`text-right font-semibold ${
                marketData.spyReturn >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {marketData.spyReturn >= 0 ? '+' : ''}{marketData.spyReturn.toFixed(1)}%
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-yellow-600" />
                <span>GLD (Gold)</span>
              </div>
              <div className={`text-right font-semibold ${
                marketData.gldReturn >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {marketData.gldReturn >= 0 ? '+' : ''}{marketData.gldReturn.toFixed(1)}%
              </div>
            </div>
            
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="font-medium">Risk Sentiment</span>
                <Badge className={
                  riskSentiment.score > 0.5 ? 'bg-green-100 text-green-800' :
                  riskSentiment.score > -0.5 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }>
                  {riskSentiment.label}
                </Badge>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Score: {riskSentiment.score.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800">
          <div className="font-medium mb-1">How to Update:</div>
          <ul className="text-xs space-y-1">
            <li>• Check VIX on TradingView</li>
            <li>• Get SPY & GLD weekly returns</li>
            <li>• Update in Data Input tab</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketOverview;