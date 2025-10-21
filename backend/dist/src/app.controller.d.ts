import { AppService } from './app.service';
import { DatabaseService } from './database/database.service';
export declare class AppController {
    private readonly appService;
    private readonly dbService;
    constructor(appService: AppService, dbService: DatabaseService);
    getHello(): string;
    getHealth(): Promise<{
        status: string;
        database: string;
        timestamp: string;
        error?: undefined;
    } | {
        status: string;
        database: string;
        error: any;
        timestamp: string;
    }>;
}
