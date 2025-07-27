import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BarChart3 } from 'lucide-react';

const FactorBreakdown: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Factor Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-gray-500 py-8">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Detailed factor analysis</p>
          <p className="text-sm mt-2">Coming soon - factor-by-factor breakdown</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FactorBreakdown;