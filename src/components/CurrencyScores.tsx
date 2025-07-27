import React from 'react';
import { useForexData } from '../contexts/ForexDataContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const CurrencyScores: React.FC = () => {
  const { currencyScores } = useForexData();

  // Convert scores to array and sort by total score
  const sortedCurrencies = Object.values(currencyScores)
    .sort((a, b) => b.totalScore - a.totalScore);

  const getScoreColor = (score: number) => {
    if (score > 1) return 'text-green-600';
    if (score > 0) return 'text-green-500';
    if (score > -1) return 'text-red-500';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    return score > 0 ? 
      <TrendingUp className="w-4 h-4 text-green-600" /> : 
      <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return <Badge className="bg-yellow-100 text-yellow-800">🥇 1st</Badge>;
    if (index === 1) return <Badge className="bg-gray-100 text-gray-800">🥈 2nd</Badge>;
    if (index === 2) return <Badge className="bg-orange-100 text-orange-800">🥉 3rd</Badge>;
    return <Badge variant="outline">#{index + 1}</Badge>;
  };

  const formatScore = (score: number) => {
    return score >= 0 ? `+${score.toFixed(2)}` : score.toFixed(2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Currency Rankings
          <Badge variant="outline">{sortedCurrencies.length} currencies</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedCurrencies.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No currency scores available</p>
            <p className="text-sm mt-2">Update data to calculate scores</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Currency Rankings */}
            <div className="space-y-3">
              {sortedCurrencies.map((currency, index) => (
                <div
                  key={currency.currency}
                  className="p-4 border rounded-lg hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold">{currency.currency}</div>
                      {getRankBadge(index)}
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        {getScoreIcon(currency.totalScore)}
                        <span className={`text-xl font-bold ${getScoreColor(currency.totalScore)}`}>
                          {formatScore(currency.totalScore)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">Total Score</div>
                    </div>
                  </div>

                  {/* Factor Breakdown */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                    <div className="text-center">
                      <div className={`font-semibold ${getScoreColor(currency.ratePolicy)}`}>
                        {formatScore(currency.ratePolicy)}
                      </div>
                      <div className="text-gray-500">Rate Policy</div>
                    </div>
                    
                    <div className="text-center">
                      <div className={`font-semibold ${getScoreColor(currency.growthMomentum)}`}>
                        {formatScore(currency.growthMomentum)}
                      </div>
                      <div className="text-gray-500">Growth</div>
                    </div>
                    
                    <div className="text-center">
                      <div className={`font-semibold ${getScoreColor(currency.realInterestEdge)}`}>
                        {formatScore(currency.realInterestEdge)}
                      </div>
                      <div className="text-gray-500">Real Rates</div>
                    </div>
                    
                    <div className="text-center">
                      <div className={`font-semibold ${getScoreColor(currency.riskAppetite)}`}>
                        {formatScore(currency.riskAppetite)}
                      </div>
                      <div className="text-gray-500">Risk</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Interpretation Guide */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">How to Read Scores</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• <strong>Positive scores:</strong> Currency strength factors</p>
                <p>• <strong>Negative scores:</strong> Currency weakness factors</p>
                <p>• <strong>Higher rank:</strong> Better for "buy" side of pairs</p>
                <p>• <strong>Lower rank:</strong> Better for "sell" side of pairs</p>
              </div>
            </div>

            {/* Quick Trading Ideas */}
            {sortedCurrencies.length >= 2 && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">Quick Ideas</h4>
                <div className="text-sm text-green-800 space-y-1">
                  <p>• <strong>Strongest:</strong> {sortedCurrencies[0].currency} (Score: {formatScore(sortedCurrencies[0].totalScore)})</p>
                  <p>• <strong>Weakest:</strong> {sortedCurrencies[sortedCurrencies.length - 1].currency} (Score: {formatScore(sortedCurrencies[sortedCurrencies.length - 1].totalScore)})</p>
                  <p>• <strong>Best Pair:</strong> Buy {sortedCurrencies[0].currency}/{sortedCurrencies[sortedCurrencies.length - 1].currency}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrencyScores;