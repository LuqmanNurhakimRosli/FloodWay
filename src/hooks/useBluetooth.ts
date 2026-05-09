import { useState, useCallback, useRef, useEffect } from 'react';

export type IoTStatus = 'SAFE' | 'WARNING' | 'DANGER';

export interface IoTState {
  connected: boolean;
  level: number;
  status: IoTStatus;
  error: string | null;
}

export function useBluetooth() {
  const [state, setState] = useState<IoTState>({
    connected: false,
    level: 0,
    status: 'SAFE',
    error: null,
  });

  // Use any to avoid TS errors for Web Serial API if types are missing
  const portRef = useRef<any>(null);
  const readerRef = useRef<any>(null);

  const handleLine = (text: string) => {
    // Parse "level,status"
    const parts = text.split(',');
    if (parts.length >= 2) {
      const level = parseInt(parts[0], 10);
      const status = parts[1].toUpperCase() as IoTStatus;
      
      setState(prev => ({
        ...prev,
        level: isNaN(level) ? prev.level : level,
        status: ['SAFE', 'WARNING', 'DANGER'].includes(status) ? status : prev.status,
      }));
    } else {
        // fallback if it just sends a number
        const level = parseInt(text, 10);
        if (!isNaN(level)) {
            let status: IoTStatus = 'SAFE';
            if (level >= 80) status = 'DANGER';
            else if (level >= 50) status = 'WARNING';

            setState(prev => ({
                ...prev,
                level,
                status
            }));
        }
    }
  };

  const connect = useCallback(async () => {
    try {
      if (!('serial' in navigator)) {
        throw new Error('Web Serial API is not supported in this browser. Please use Chrome or Edge.');
      }

      setState(prev => ({ ...prev, error: null }));

      // Request a port and open a connection.
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 115200 }); // Common ESP32 baud rate
      
      portRef.current = port;
      setState(prev => ({ ...prev, connected: true }));

      // Setup the reader
      const textDecoder = new TextDecoderStream();
      port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      readerRef.current = reader;

      // Read loop
      let buffer = '';
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            handleDisconnected();
            break;
          }
          
          buffer += value;
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep the incomplete part
          
          for (let line of lines) {
            line = line.trim();
            if (line) handleLine(line);
          }
        }
      } catch (error) {
        // Read error (e.g. device disconnected)
        console.error('Serial read error:', error);
        handleDisconnected();
      } finally {
        reader.releaseLock();
      }

    } catch (error: any) {
      console.error('Serial connection error:', error);
      setState(prev => ({ ...prev, error: error.message, connected: false }));
    }
  }, []);

  const handleDisconnected = () => {
    setState(prev => ({ ...prev, connected: false }));
    portRef.current = null;
    readerRef.current = null;
  }

  const disconnect = useCallback(async () => {
    try {
      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current = null;
      }
      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }
    } catch (e) {
      console.error('Error closing serial port', e);
    } finally {
      handleDisconnected();
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    ...state,
    connect,
    disconnect
  };
}
