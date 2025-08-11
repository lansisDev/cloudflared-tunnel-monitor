import axios from 'axios';
import { TunnelStatus } from './types';
import logger from './logger';

export class TunnelMonitor {
  constructor(
    private tunnelUrl: string,
    private timeoutMs: number = 10000
  ) {}

  async checkStatus(): Promise<TunnelStatus> {
    const startTime = Date.now();
    
    try {
      logger.info(`Checking tunnel status: ${this.tunnelUrl}`);
      
      const response = await axios.get(this.tunnelUrl, {
        timeout: this.timeoutMs,
        validateStatus: (status: number) => status < 500 // Accept any status code < 500
      });

      const responseTime = Date.now() - startTime;
      const isOnline = response.status >= 200 && response.status < 400;

      logger.info(`Tunnel check completed. Status: ${response.status}, Response time: ${responseTime}ms`);

      return {
        isOnline,
        responseTime,
        checkedAt: new Date()
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error(`Tunnel check failed: ${errorMessage}`);

      return {
        isOnline: false,
        responseTime,
        error: errorMessage,
        checkedAt: new Date()
      };
    }
  }
}
