import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    sendInvitationEmail(to: string, inviterName: string, eventName: string, eventDate: string, locationName?: string, personalMessage?: string): Promise<boolean>;
    private getInvitationEmailTemplate;
}
