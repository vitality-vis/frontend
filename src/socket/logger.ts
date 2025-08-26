import { get } from "lodash";
import socket from "./initsocket"


// commonalities: userid, studyid, sessionid

const getCreateSessionId = ():string => {
    let id = localStorage.getItem('sessionId');
    if (!id) { //create new random id if not exist
        id = typeof crypto?.randomUUID === "function"
        ? crypto.randomUUID(): String(Date.now());
        localStorage.setItem("sessionId", id);
    }
    return id;
}

export function logEvent(eventName:string, eventData: any) {
    const userId = localStorage.getItem('userId')
    const studyId = localStorage.getItem('studyId')

    // unifying structure to emit events with userid etc and the specific event
    socket.emit("log_event", {
        userId,
        studyId,
        sessionId: getCreateSessionId(),
        eventName,
        eventData,
        timestamp: Date.now()
    })

}
