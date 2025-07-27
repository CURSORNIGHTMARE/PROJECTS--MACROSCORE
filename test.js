import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { runModelTests } from './src/lib/modelCalculations.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Run tests
console.log('=== V07 MODEL VALIDATION ===\n');

try {
  const result = runModelTests();
  console.log('✅ All tests completed successfully!');
  console.log('Results:', result);
} catch (error) {
  console.error('❌ Error running tests:', error.message);
  console.error(error);
} 