import React, { useState } from 'react';
import { useForexData } from '../contexts/ForexDataContext';
import MarketOverview from './MarketOverview';
import CurrencyScores from './CurrencyScores';
import TradingSignals from './TradingSignals';
import DataInputPanel from './DataInputPanel';
import FactorBreakdown from './FactorBreakdown';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AlertCircle, RefreshCw, Settings, TrendingUp, BarChart3, Activity } from 'lucide-react';

const ForexDashboard: React.FC = () => {
  const {
    marketRegime,
    factorWeights,
    lastUpdated,
    error,
    isLoading,
    recalculateAll,
    runTests
  } = useForexData();

  const [activeTab, setActiveTab] = useState('overview');

  const getRegimeColor = (regime: string | null) => {
    switch (regime) {
      case 'RISK_OFF': return 'bg-red-100 text-red-800';
      case 'RISK_ON': return 'bg-green-100 text-green-800';
      case 'CENTRAL_BANK_WEEK': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatTime = (date: Date | null) => {
    return date ? date.toLocaleTimeString() : 'Never';
  };

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Market Regime:</span>
                <Badge className={getRegimeColor(marketRegime)}>
                  {marketRegime || 'Calculating...'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Last Updated:</span>
                <span className="font-mono">{formatTime(lastUpdated)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={recalculateAll}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Recalculate
              </Button>
              
              <Button
                onClick={runTests}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Run Tests
              </Button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="currencies" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Currencies
          </TabsTrigger>
          <TabsTrigger value="signals" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Signals
          </TabsTrigger>
          <TabsTrigger value="factors" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Factors
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Data Input
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MarketOverview />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Factor Weights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {factorWeights ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Rate Policy</span>
                      <span className="font-semibold">{(factorWeights.ratePolicy * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${factorWeights.ratePolicy * 100}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Growth Momentum</span>
                      <span className="font-semibold">{(factorWeights.growthMomentum * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${factorWeights.growthMomentum * 100}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Real Interest Edge</span>
                      <span className="font-semibold">{(factorWeights.realInterestEdge * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${factorWeights.realInterestEdge * 100}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Risk Appetite</span>
                      <span className="font-semibold">{(factorWeights.riskAppetite * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full"
                        style={{ width: `${factorWeights.riskAppetite * 100}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No factor weights calculated yet
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <TradingSignals />
        </TabsContent>

        <TabsContent value="currencies">
          <CurrencyScores />
        </TabsContent>

        <TabsContent value="signals">
          <TradingSignals />
        </TabsContent>

        <TabsContent value="factors">
          <FactorBreakdown />
        </TabsContent>

        <TabsContent value="settings">
          <DataInputPanel />
        </TabsContent>
      </Tabs>

      {/* Quick Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">25-Minute Sunday Routine</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">1. Market Mood (4 min)</h4>
              <p>Check VIX percentile and SPY vs GLD performance</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">2. Interest Rates (7 min)</h4>
              <p>Update policy rates and terminal rate expectations</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">3. Real Returns (6 min)</h4>
              <p>Get 2-year yields and inflation expectations</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">4. Growth & Risk (8 min)</h4>
              <p>Review employment, PMI, and risk sentiment</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForexDashboard;