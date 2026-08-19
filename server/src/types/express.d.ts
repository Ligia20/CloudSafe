declare global {
    namespace Express {
        interface Request {
            user?: {
                id:string;
                organizationId:string;
            };

            asset?: {
                id:string;
                name:string;
                type:string;
                ipAddress:string;
                status:string;
                hostname:string | null;
                enrollmentToken:string;
                lastSeen:Date | null;
                os:string | null;
                cpuCount:number | null;
                totalMemory:bigint | null;
                agentVersion:string | null;
                lastInventory:Date | null;
                createdAt:Date;
                userId:string;
                organizationId:string;
            };
        }
    }
}

export {};