import { useEffect, useState } from 'react';
import { useMountedState } from './useMountedState';

export function useAppVisible() {
  const [visible, setVisible] = useState(() => {
    try {
      return logseq?.isMainUIVisible || false;
    } catch {
      return false;
    }
  });
  const isMounted = useMountedState();
  
  useEffect(() => {
    if (!logseq?.on || !logseq?.off) return;
    
    const eventName = 'ui:visible:changed';
    const handler = async ({ visible }: { visible: boolean }) => {
      try {
        if (isMounted()) {
          setVisible(visible);
        }
      } catch (error) {
        console.error('Error in visibility handler:', error);
      }
    };
    
    logseq.on(eventName, handler);
    return () => {
      try {
        logseq.off(eventName, handler);
      } catch (error) {
        console.error('Error removing event listener:', error);
      }
    };
  }, [isMounted]);
  
  return visible;
}
