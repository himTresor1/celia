import { ListsService } from './lists.service';
import { AddToSavedDto } from './dto/add-to-saved.dto';
import { BulkInviteDto } from './dto/bulk-invite.dto';
export declare class ListsController {
    private readonly listsService;
    constructor(listsService: ListsService);
    getSavedUsers(user: any, page?: string, limit?: string): Promise<any>;
    addToSaved(user: any, dto: AddToSavedDto): Promise<any>;
    removeFromSaved(user: any, userId: string): Promise<{
        message: string;
    }>;
    checkIfSaved(user: any, userId: string): Promise<{
        isSaved: boolean;
    }>;
    getInvitees(user: any, page?: string, limit?: string): Promise<any>;
    bulkInvite(user: any, dto: BulkInviteDto): Promise<any>;
    searchSavedUsers(user: any, query: string, page?: string, limit?: string): Promise<any>;
}
