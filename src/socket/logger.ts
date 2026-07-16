import { debounce } from "lodash";
import socket from "./initsocket"
import { isLoggingEnabled } from "../utils/loggingConfig";

// Enhanced logging utility with retry mechanism and acknowledgment
// Integrates with existing logEvent system to maintain userId, studyId, sessionId tracking
// Logging can be globally disabled for standalone mode via loggingConfig

// Event queue for failed events
interface QueuedEvent {
    eventName: string;
    eventData: any;
    userId: string | null;
    studyId: string | null;
    sessionId: string;
    timestamp: number;
    retryCount: number;
}

const eventQueue: QueuedEvent[] = [];
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // 2 seconds
const MAX_QUEUE_SIZE = 1000; // Prevent memory issues

const getCreateSessionId = ():string => {
    let id = localStorage.getItem('sessionId');
    if (!id) { //create new random id if not exist
        id = typeof crypto?.randomUUID === "function"
        ? crypto.randomUUID(): String(Date.now());
        localStorage.setItem("sessionId", id);
    }
    return id;
}

// Process queued events when connection is restored
function processQueue() {
    if (!socket.connected || eventQueue.length === 0) {
        return;
    }

    console.log(`📤 Processing ${eventQueue.length} queued events...`);

    // Process in batches to avoid overwhelming the connection
    const batch = eventQueue.splice(0, 10);
    batch.forEach(event => {
        sendEventWithRetry(event);
    });

    // Continue processing if queue still has items
    if (eventQueue.length > 0) {
        setTimeout(processQueue, 500);
    }
}

// Send event with acknowledgment and retry logic
function sendEventWithRetry(event: QueuedEvent) {
    if (!socket.connected) {
        // Add back to queue if not connected
        if (event.retryCount < MAX_RETRY_ATTEMPTS) {
            eventQueue.push(event);
        } else {
            console.warn(`⚠️ Event dropped after ${MAX_RETRY_ATTEMPTS} retries:`, event.eventName);
        }
        return;
    }

    let acknowledged = false;

    // Emit with acknowledgment callback
    socket.emit("log_event", {
        userId: event.userId,
        studyId: event.studyId,
        sessionId: event.sessionId,
        timestamp: event.timestamp,
        eventName: event.eventName,
        eventData: event.eventData,
    }, (ack: any) => {
        // Acknowledgment received from server
        acknowledged = true;
        if (ack?.status === 'error') {
            console.error(`❌ Server rejected event: ${event.eventName}`, ack.message);
            // Retry if server error
            retryEvent(event);
        }
        // Success - no action needed
    });

    // Set timeout for acknowledgment
    setTimeout(() => {
        // If we reach here and event wasn't acknowledged, retry
        if (!acknowledged) {
            console.warn(`⏱️ No acknowledgment received for: ${event.eventName}`);
            retryEvent(event);
        }
    }, 5000); // 5 second timeout
}

function retryEvent(event: QueuedEvent) {
    if (event.retryCount < MAX_RETRY_ATTEMPTS) {
        event.retryCount++;
        console.log(`🔄 Retrying event (${event.retryCount}/${MAX_RETRY_ATTEMPTS}):`, event.eventName);

        setTimeout(() => {
            sendEventWithRetry(event);
        }, RETRY_DELAY * event.retryCount); // Exponential backoff
    } else {
        console.warn(`⚠️ Event dropped after ${MAX_RETRY_ATTEMPTS} retries:`, event.eventName);
    }
}

export function logEvent(eventName:string, eventData: any) {
    // Check if logging is enabled (disabled in standalone mode)
    if (!isLoggingEnabled()) {
        return; // Skip logging entirely
    }

    const userId = localStorage.getItem('userId')
    const studyId = localStorage.getItem('studyId')

    const event: QueuedEvent = {
        userId,
        studyId,
        sessionId: getCreateSessionId(),
        timestamp: Date.now(),
        eventName,
        eventData,
        retryCount: 0
    };

    // If not connected, queue the event
    if (!socket.connected) {
        if (eventQueue.length < MAX_QUEUE_SIZE) {
            eventQueue.push(event);
            console.log(`📝 Event queued (offline): ${eventName} [Queue: ${eventQueue.length}]`);
        } else {
            console.warn(`⚠️ Queue full, dropping event: ${eventName}`);
        }
        return;
    }

    // Send immediately if connected
    sendEventWithRetry(event);
}

// Connection event handlers
socket.on('connect', () => {
    console.log('✅ Socket connected - processing queued events');
    processQueue();
});

socket.on('disconnect', () => {
    console.log('❌ Socket disconnected - events will be queued');
});

socket.on('connect_error', (error) => {
    console.error('⚠️ Socket connection error:', error.message);
});

// eventdata depends on what kind of interaction user performs
interface BaseEventData {
  timestamp?: number;
  component: string;
  action: string;
  [key: string]: any;
}

interface TableEventData extends BaseEventData {
  tableType?: string;
  rowId?: string | number;
  columnId?: string;
  filterValue?: any;
  sortDirection?: string;
  paperId?: string | number;
  paperTitle?: string;
  currentFilter?: string;
  visibleRows?: number;
}

interface VisualizationEventData extends BaseEventData {
  pointId?: string | number;
  selectedPoints?: (string | number)[];
  coordinates?: { x: number; y: number };
  embeddingType?: string;
  zoomLevel?: number;
  selectionType?: string;
}

interface LLMEventData extends BaseEventData {
  query?: string;
  prompt?: string;
  responseLength?: number;
  paperId?: string | number;
  paperCount?: number;
  chatHistory?: any[];
  model?: string;
}

interface UIEventData extends BaseEventData {
  elementId?: string;
  value?: any;
  previousValue?: any;
  modalName?: string;
  panelName?: string;
  isOpen?: boolean;
}

// Debounced logging functions for high-frequency events
const debouncedHoverLog = debounce((eventName: string, eventData: any) => {
  logEvent(eventName, eventData);
}, 500); // 500ms debounce for hover events

const debouncedFilterLog = debounce((eventName: string, eventData: any) => {
  logEvent(eventName, eventData);
}, 1500); // 1.5s debounce for filter changes

const debouncedScrollLog = debounce((eventName: string, eventData: any) => {
  logEvent(eventName, eventData);
}, 1000); // 1s debounce for scroll events

// Logging functions
export const Logger = {
  
  // Table interactions
  logTableInteraction: (data: TableEventData) => {
    const eventData = {
      ...data
    };

    // Use debouncing for filter changes, scroll events, and searches
    if (data.action.includes('filter') || data.action.includes('search')) {
      debouncedFilterLog(`table_${data.action}`, eventData);
    } else if (data.action.includes('scroll')) {
      debouncedScrollLog(`table_${data.action}`, eventData);
    } else {
      logEvent(`table_${data.action}`, eventData);
    }
  },

  // Visualization interactions
  logVisualizationInteraction: (data: VisualizationEventData) => {
    const eventData = {
      ...data
    };
    
    // Use debouncing for hover events
    if (data.action === 'hover') {
      debouncedHoverLog(`visualization_${data.action}`, eventData);
    } else {
      logEvent(`visualization_${data.action}`, eventData);
    }
  },

  // LLM interactions  
  logLLMInteraction: (data: LLMEventData) => {
    const eventData = {
      ...data
    };
    logEvent(`llm_${data.action}`, eventData);
  },

  // UI interactions (buttons, dropdowns, modals, etc)
  logUIInteraction: (data: UIEventData) => {
    const eventData = {
      ...data
    };
    logEvent(`ui_${data.action}`, eventData);
  },


  // Study-specific logging for questionnaires, tasks, and research flow
  logStudyEvent: (data: BaseEventData & { response?: string; stepNumber?: number; secondsSpent?: number, minutesSpent?: number, interactionName: string}) => {
    const eventData = {
      ...data
    };
    logEvent(`study_${data.interactionName}`, eventData);
  },

  // Text editor logging for research notes and literature review
  logTextEditorEvent: (data: BaseEventData & { 
    content?: string; 
    contentLength?: number; 
    writingSessionId?: string;
    timeSpent?: number;
    actionType?: string;
  }) => {
    const eventData = {
      ...data
    };
    logEvent(`text_editor_${data.actionType || 'interaction'}`, eventData);
  }
};


export default Logger;
