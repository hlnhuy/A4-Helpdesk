import { useCallback, useEffect, useState } from 'react';
import { subscribeToData } from '../services/demoDataService.js';

export default function useDemoData(readData) {
  const [data, setData] = useState(readData);
  const refresh = useCallback(() => setData(readData()), [readData]);

  useEffect(() => subscribeToData(refresh), [refresh]);

  return [data, refresh];
}
