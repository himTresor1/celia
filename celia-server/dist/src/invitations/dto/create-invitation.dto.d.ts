export declare class CreateInvitationDto {
    eventId: string;
    inviteeId: string;
    personalMessage?: string;
}
export declare class BulkInviteDto {
    eventId: string;
    inviteeIds: string[];
    personalMessage?: string;
}
