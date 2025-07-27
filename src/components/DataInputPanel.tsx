import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Settings } from 'lucide-react';

const DataInputPanel: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Data Input Panel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center text-gray-500 py-8">
          <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Manual data input interface</p>
          <p className="text-sm mt-2">Coming soon - update VIX, rates, and economic data</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataInputPanel;