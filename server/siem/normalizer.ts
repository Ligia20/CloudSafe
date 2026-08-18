export function normalizeEvent(eventData:any){

    try{
        const {
            asset,
            source_ip,
            event,
            severity,
            action,
        } = eventData;

        const normalizedEvent = {
            asset: asset || "Unknown",
            source_ip: source_ip || null,
            event: event || "Unknown Event",
            severity: severity?.toUpperCase() || "LOW",
            action: action || null,
            category: detectCategory(event),
            raw_data: eventData,
        };
        return normalizedEvent;

    }catch(error){
        console.error("NORMALIZER ERROR:", error);
        throw error;
    }
}


function detectCategory(event:string){
    const message =
        event?.toLowerCase() || "";

    if(message.includes("login"))
    {
        return "Authentication";
    }
    if(message.includes("malware"))
    {
        return "Malware";
    }
    if(message.includes("port"))
    {
        return "Network";
    }
    if(message.includes("access"))
    {
        return "Access Control";
    }

    return "System";
}