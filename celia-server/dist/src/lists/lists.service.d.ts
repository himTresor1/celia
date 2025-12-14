import { PrismaService } from '../prisma/prisma.service';
export declare class ListsService {
    private prisma;
    constructor(prisma: PrismaService);
    getSavedUsers(userId: string, page?: number, limit?: number): Promise<any>;
    addToSaved(userId: string, savedUserId: string, context?: string, notes?: string): Promise<any>;
    removeFromSaved(userId: string, savedUserId: string): Promise<void>;
    isUserSaved(userId: string, targetUserId: string): Promise<boolean>;
    getInvitees(userId: string, page?: number, limit?: number): Promise<any>;
    bulkInvite(hostId: string, eventId: string, userIds: string[], personalMessage?: string): Promise<any>;
    private updateInviteeHistory;
    searchSavedUsers(userId: string, query: string, page?: number, limit?: number): Promise<any>;
}
