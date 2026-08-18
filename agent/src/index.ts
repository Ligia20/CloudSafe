import "dotenv/config";
import os from "os";
import {collectSystem} from "./collector/system.js";

const API_URL=process.env.CLOUDSAFE_API_URL;
const ENROLLMENT_TOKEN=process.env.CLOUDSAFE_ENROLLMENT_TOKEN;
const AGENT_VERSION="1.0.0";

if(!API_URL||!ENROLLMENT_TOKEN){
    console.error(
        "CLOUDSAFE_API_URL and CLOUDSAFE_ENROLLMENT_TOKEN are required"
    );
    process.exit(1);
}

function getLocalIp(){
    const interfaces=os.networkInterfaces();

    for(const name of Object.keys(interfaces)){
        for(const network of interfaces[name]||[]){
            if(network.family==="IPv4"&&!network.internal){
                return network.address;
            }
        }
    }

    return "127.0.0.1";
}

function getHeaders(){
    return {
        "Content-Type":"application/json",
        "x-enrollment-token":ENROLLMENT_TOKEN!,
    };
}

async function heartbeat(){
    try{
        const response=await fetch(
            `${API_URL}/api/v1/agent/heartbeat`,
            {
                method:"POST",
                headers:getHeaders(),
                body:JSON.stringify({
                    hostname:os.hostname(),
                    ipAddress:getLocalIp(),
                }),
            }
        );

        const data=await response.json().catch(()=>null);

        if(!response.ok){
            console.error(
                "HEARTBEAT FAILED:",
                response.status,
                data
            );
            return;
        }

        console.log("HEARTBEAT RECEIVED:",data);
    }catch(error){
        console.error("HEARTBEAT ERROR:",error);
    }
}

async function sendEvent(){
    try{
        const response=await fetch(
            `${API_URL}/api/v1/agent/events`,
            {
                method:"POST",
                headers:getHeaders(),
                body:JSON.stringify({
                    eventType:"AGENT_HEARTBEAT",
                    message:`CloudSafe agent online: ${os.hostname()}`,
                    severity:"LOW",
                    sourceIp:getLocalIp(),
                }),
            }
        );

        const data=await response.json().catch(()=>null);

        if(!response.ok){
            console.error(
                "EVENT SEND FAILED:",
                response.status,
                data
            );
            return;
        }

        console.log("EVENT SENT:",data);
    }catch(error){
        console.error("EVENT ERROR:",error);
    }
}

async function sendInventory(){
    try{
        const system=collectSystem();

        const response=await fetch(
            `${API_URL}/api/v1/agent/inventory`,
            {
                method:"POST",
                headers:getHeaders(),
                body:JSON.stringify({
                    os:`${system.platform} ${system.architecture}`,
                    cpuCount:system.cpuCount,
                    totalMemory:system.totalMemory,
                    agentVersion:AGENT_VERSION,
                }),
            }
        );

        const data=await response.json().catch(()=>null);

        if(!response.ok){
            console.error(
                "INVENTORY FAILED:",
                response.status,
                data
            );
            return;
        }

        console.log("INVENTORY RECEIVED:",data);
    }catch(error){
        console.error("INVENTORY ERROR:",error);
    }
}

console.log("CloudSafe agent starting...");
console.log("Hostname:",os.hostname());

heartbeat();
sendEvent();
sendInventory();

setInterval(heartbeat,30000);
setInterval(sendEvent,60000);
setInterval(sendInventory,3600000);