export function calculateRisk(event:any, alerts:any[]){
    try{
        let score = 0;
        if(event.severity === "LOW"){
            score += 10;
        }

        if(event.severity === "MEDIUM"){
            score += 30;
        }

        if(event.severity === "HIGH"){
            score += 60;
        }

        if(event.severity === "CRITICAL"){
            score += 90;
        }

        if(alerts.length > 0){
            score += alerts.length * 5;
        }

        if(score > 100){
            score = 100;
        }

        let riskLevel = "LOW";
        if(score >= 80){
            riskLevel = "CRITICAL";
        }
        else if(score >= 60){
            riskLevel = "HIGH";
        }
        else if(score >= 30){
            riskLevel = "MEDIUM";
        }
        return {
            score:score,
            riskLevel:riskLevel,
        };

    }catch(error){
        console.error("RISK ENGINE ERROR:", error);
        throw error;
    }
}