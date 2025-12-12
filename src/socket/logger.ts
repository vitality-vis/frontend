import { debounce } from "lodash";
import socket from "./initsocket"
import { isLoggingEnabled } from "../utils/loggingConfig";

// Enhanced logging utility for comprehensive UI interaction tracking
// Integrates with existing logEvent system to maintain userId, studyId, sessionId tracking
// Logging can be globally disabled for standalone mode via loggingConfig

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
    // Check if logging is enabled (disabled in standalone mode)
    if (!isLoggingEnabled()) {
        return; // Skip logging entirely
    }

    const userId = localStorage.getItem('userId')
    const studyId = localStorage.getItem('studyId')

  // unifying structure to emit events with userid etc and the specific event
  socket.emit("log_event", {
    userId,
    studyId,
    sessionId: getCreateSessionId(),
    timestamp: Date.now(), // Add timestamp in ms since epoch
    eventName,
    eventData,
  })

}

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
