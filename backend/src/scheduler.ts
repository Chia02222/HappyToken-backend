import * as cron from 'node-cron';
import { CorporateService } from './modules/corporate/corporate.service';

const corporateService = new CorporateService();

export function initializeScheduler() {
  // Run daily at 1 AM
  cron.schedule('0 1 * * *', async () => {
    console.log('🕐 Running daily corporate expiration check...');
    try {
      await corporateService.expireStaleCorporatesDaily();
      console.log('✅ Daily corporate expiration check completed');
    } catch (error) {
      console.error('❌ Error in daily corporate expiration check:', error);
    }
  });
  
  console.log('📅 Scheduler initialized - daily corporate expiration check scheduled for 1 AM');
}

