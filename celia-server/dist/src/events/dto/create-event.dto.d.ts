export declare class CreateEventDto {
    name: string;
    description?: string;
    categoryId?: string;
    locationName?: string;
    locationLat?: number;
    locationLng?: number;
    eventDate?: string;
    startTime?: string;
    endTime?: string;
    photoUrls?: string[];
    interestTags?: string[];
    capacityLimit?: number;
    isPublic?: boolean;
    status?: string;
    externalLink?: string;
    externalLinkType?: string;
}
