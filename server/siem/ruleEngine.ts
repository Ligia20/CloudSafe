export function checkRules(event:any){
    try{

        const alerts = [];

        const eventText = `${event.event} ${event.action}`
            .toLowerCase();


        if(
            eventText.includes("login_failed") ||
            eventText.includes("failed login") ||
            eventText.includes("invalid password")
        ){
            alerts.push({
                name:"Brute Force Attempt",
                severity:"HIGH",
            });
        }


        if(eventText.includes("malware")){
            alerts.push({
                name:"Malware Detection",
                severity:"CRITICAL",
            });
        }


        if(eventText.includes("port scan")){
            alerts.push({
                name:"Port Scan Detected",
                severity:"MEDIUM",
            });
        }


        if(eventText.includes("unauthorized")){
            alerts.push({
                name:"Unauthorized Access",
                severity:"HIGH",
            });
        }


        return alerts;

    }catch(error){

        console.error("RULE ENGINE ERROR:",error);
        throw error;
    }
}