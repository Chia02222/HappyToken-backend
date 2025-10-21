import { SeedService } from './seed.service';
export declare class SeedController {
    private readonly seedService;
    constructor(seedService: SeedService);
    seedDatabase(): Promise<{
        message: string;
    }>;
}
