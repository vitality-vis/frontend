import * as React from "react";
// import {hot} from "react-hot-loader";
import "./../assets/scss/App.scss";
import PaperScatter from "./PaperScatter";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Tabs, Tab, Button, Nav} from 'react-bootstrap'; // <-- Add this line
import 'bootstrap/dist/css/bootstrap.min.css'; // <-- Ensure this line is already present for Bootstrap styles
import { Logger, logEvent } from "../socket/logger";

import {
    faCaretDown,
    faCaretUp,
    faTimes,
    faTrash,
    faPlus,
    faPlusCircle,
    faSearch,
    faExternalLinkAlt,
    faClipboardList,
    faEyeSlash,
    faFileExport,
    faKey,
    faHandPointer,
    faKeyboard,
    faMouse,
    faGraduationCap,
    faMapMarkerAlt,
    faQuestionCircle,
    faCheckCircle,
    faArrowAltCircleRight,
    faExpand,
    faMinus,
    faRocket
} from '@fortawesome/free-solid-svg-icons';
import {
    Callout,
    CommandBar,
    DefaultButton,
    DelayedRender,
    Dropdown,
    ICommandBarItemProps,
    Icon,
    IconButton,
    IDropdownOption,
    IPivotItemProps,
    Label, Modal,
    Panel,
    PanelType,
    Pivot,
    PivotItem,
    PivotLinkFormat,
    PivotLinkSize,
    PrimaryButton,
    registerIcons,
    Stack,
    Text,
    TextField
} from "@fluentui/react";
import SmartTable, {SmartTableProps} from "./SmartTable";
import LoadingOverlay from 'react-loading-overlay';
import Split from 'react-split';
import Markdown from 'react-markdown'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {initializeIcons} from '@uifabric/icons';
import logo from './../assets/img/vitality-logo-2.png';
import gtLogo from './../assets/img/gt-logo.png';
import northwesternLogo from './../assets/img/northwestern-logo.png';
import unccLogo from './../assets/img/uncc-logo.png';
import emoryLogo from './../assets/img/emory-logo.png';

import visConferenceLogo from './../assets/img/ieeevis2021-logo.png';
import {Dialog} from "./Dialog";
import {MetaTable} from "./MetaTable";
import { NotImpactedSolidIcon } from "@fluentui/react-icons";
import { API_BASE_URL } from '../config';

export const baseUrl = `${API_BASE_URL}/`;

initializeIcons();
registerIcons({
    icons: {
        Rocket: <FontAwesomeIcon icon={faRocket}/>,
        Link: <FontAwesomeIcon icon={faExternalLinkAlt}/>,
        GraduationCap: <FontAwesomeIcon icon={faGraduationCap}/>,
        CaretUp: <FontAwesomeIcon icon={faCaretUp}/>,
        CaretDown: <FontAwesomeIcon icon={faCaretDown}/>,
        Check: <FontAwesomeIcon icon={faCheckCircle}/>,
        Times: <FontAwesomeIcon icon={faTimes}/>,
        ArrowRight: <FontAwesomeIcon icon={faArrowAltCircleRight}/>,
        Delete: <FontAwesomeIcon icon={faTrash}/>,
        Plus: <FontAwesomeIcon icon={faPlus}/>,
        PlusCircle: <FontAwesomeIcon icon={faPlusCircle}/>,
        Search: <FontAwesomeIcon icon={faSearch}/>,
        ExternalLink: <FontAwesomeIcon icon={faExternalLinkAlt}/>,
        ClipboardList: <FontAwesomeIcon icon={faClipboardList}/>,
        EyeSlash: <FontAwesomeIcon icon={faEyeSlash}/>,
        FileExport: <FontAwesomeIcon icon={faFileExport}/>,
        Locate: <FontAwesomeIcon icon={faMapMarkerAlt}/>,
        Key: <FontAwesomeIcon icon={faKey}/>,
        HandPointer: <FontAwesomeIcon icon={faHandPointer}/>,
        Mouse: <FontAwesomeIcon icon={faMouse}/>,
        Keyboard: <FontAwesomeIcon icon={faKeyboard}/>,
        Question: <FontAwesomeIcon icon={faQuestionCircle}/>,
        Expand: <FontAwesomeIcon icon={faExpand}/>,
        Minus: <FontAwesomeIcon icon={faMinus}/>
    }
});

interface TableTypes {
    all: any;
    saved: any;
    similar: any;
    similarPayload: any;
    keyword: any;
    author: any;
    source: any;
    year: any;
}

interface AppState {
    // Will change
    minYear: number | null;
    maxYear: number | null;
    minCitationCounts: number | null;
    maxCitationCounts: number | null;
    metadataInitialized: boolean;
    eventOrigin: string;
    spinner: boolean;
    loadingText: string;
    globalFilterValue: TableTypes;
    columnsVisible: TableTypes;
    columnSortByValues: TableTypes;
    columnFilterValues: TableTypes;
    columns: TableTypes;
    dataFiltered: TableTypes;
    similarityType: IDropdownOption;
    maxSimilarPapers: IDropdownOption;
    embeddingType: IDropdownOption;
    paperNoEmbeddings: Object;
    isPanelOpen: boolean;
    dataAuthors: Array<any>;
    dataSources: Array<any>;
    dataKeywords: Array<any>;
    dataYears: Array<any>;
    dataTitles: Array<any>;
    dataAll: Array<any>;
    authorsSummary: Array<{ _id: string; count: number }>; // Summary of authors with counts
    sourcesSummary: Array<{ _id: string; count: number }>; // Summary of sources with counts
    keywordsSummary: Array<{ _id: string; count: number }>; // Summary of keywords with counts
    yearsSummary: Array<{ _id: number; count: number }>; // Summary of years with counts
    pointsAll: Array<any>;
    metaData: {};
    dataSimilarPayload: Array<any>;
    dataSimilar: Array<any>;
    dataSaved: Array<any>;
    dataSavedID: Array<any>;
    dataFilteredID: Array<any>;
    dataSimilarPayloadID: Array<any>;
    dataSimilarID: Array<any>;
    similarityPanelSelectedKey: String;
    similarMinScore: number;
    similarMaxScore: number;
    selectNodeIDs: Array<any>;
    searchTitle: string;
    searchAbstract: string;
    searchByAbstractLimit: IDropdownOption;
    checkoutLinkRef: any;
    scrollToPaperID: number;
    isCiteUsCalloutVisible: boolean;
    // Will not change
    columnWidths: {};
    columnFilterTypes: {};
    chatText: string;
    chatResponse: string;
    chatResponsing: boolean;
    chatDoc: Array<any>;
    summarizeResponse: string;
    chatHistory: Array<any>;
    tabs: TabType[];
    activeKey: string;
    dialogStates: { [key: string]: any };
    nextTabId: number; // Counter for generating unique tab IDs
    chatSelectedPaper: string;
    offset: number;
    hasMoreData: boolean;
    totalPaperCount: number | null;
    dataLoaded: boolean;
    isMetaTableModalOpen: boolean;
    allDataLoaded: boolean;
    notesContent: string;
    // Text editor tracking
    writingSessionId: string;
    lastWritingActivity: number;
    writingStartTime: number;
    isCurrentlyWriting: boolean;
}

interface TabType {
    id: string;
    title: string;
}

interface ChatComponentProps {
    chatId: string;
}

const embeddingTypeDropdownOptions = [
    {key: 'specter', text: 'Specter'},
    {key: 'glove', text: 'Glove'},
    {key: 'ada', text: 'Ada'}
];

const similarityTypeDropdownOptions = [
    {key: 'nD', text: 'nD'},
    {key: '2D', text: '2D'}
];

const maxSimilarPapersDropdownOptions = [
    {key: '25', text: '25'},
    {key: '50', text: '50'},
    {key: '100', text: '100'},
    {key: '250', text: '250'},
    {key: '-1', text: 'All'},
];
const areQueryConditionsUndefined = (queryPayload) => {
    const {title, author, source, keyword, min_year, max_year, abstract, min_citation_counts, max_citation_counts} = queryPayload;

    return (
        title === undefined &&
        (!author || author.length === 0) &&
        (!source || source.length === 0) &&
        (!keyword || keyword.length === 0) &&
        min_year === undefined &&
        max_year === undefined &&
        abstract === undefined &&
        min_citation_counts === undefined &&
        max_citation_counts === undefined
    );
};


const preprocessMetadata = (metadata, keyColumn = "Keyword", valueColumn = "Count") => {
    if (!metadata) return [];
    return metadata.map(({_id, count}) => ({
        [keyColumn]: _id, // Dynamically assign the keyColumn name
        [valueColumn]: count, // Dynamically assign the valueColumn name
    }));
};


interface AppProps {
    onMetadataLoaded?: () => void;
    onLoadingProgress?: (progress: number) => void;
    isPractice?: boolean;
    onPracticeTaskComplete?: (taskId: string) => void;
}

class App extends React.Component<AppProps, AppState> {
    writingPauseTimeout: ReturnType<typeof setTimeout> | null = null;
    practiceTasksCompleted: Set<string> = new Set();
    contentChangeTimer: ReturnType<typeof setTimeout> | null = null;
    periodicLogTimer: ReturnType<typeof setInterval> | null = null;

    constructor(props: any) {
        super(props);
        this.state = {
            dataLoaded: false,
            minYear: null,
            maxYear: null,
            minCitationCounts: null,
            maxCitationCounts: null,
            metadataInitialized: false,
            spinner: true,
            loadingText: 'loading meta data...',
            isCiteUsCalloutVisible: false,
            columnFilterTypes: {
                "ID": "default",
                "Title": "default",
                "Authors": "multiselect-tokens",
                "Source": "multiselect",
                "Year": "range",
                "Abstract": "default",
                "Keywords": "multiselect-tokens",
                "Sim": "range",
                "Distance": "range",
                "Sim_Rank": "range",
                "CitationCounts": "range",
                "Keyword": "multiselect",
                "KeywordCount": "range",
                "Author": "multiselect",
                "AuthorCount": "range",
                "SourceCount": "range",
                "YearCount": "range"
            },
            columnWidths: {
                "ID": {maxWidth: 50},
                "Title": {minWidth: 100},
                "Authors": {minWidth: 100},
                "Source": {maxWidth: 200},
                "Year": {maxWidth: 45},
                "Abstract": {minWidth: 100},
                "Keywords": {minWidth: 100},
                "Sim": {maxWidth: 50},
                "Distance": {maxWidth: 50},
                "Sim_Rank": {maxWidth: 50},
                "CitationCounts": {maxWidth: 50},
                "Keyword": {minWidth: 100},
                "KeywordCount": {maxWidth: 125},
                "Author": {minWidth: 100},
                "AuthorCount": {maxWidth: 125},
                "SourceCount": {maxWidth: 125},
                "YearCount": {maxWidth: 125},
            },
            columns: {
                all: ["ID", "Title", "Authors", "Source", "Year", "Abstract", "Keywords", "CitationCounts"],
                saved: ["ID", "Title", "Authors", "Source", "Year", "Abstract", "Keywords", "CitationCounts"],
                similar: ["ID", "Title", "Authors", "Source", "Year", "Abstract", "Keywords", "CitationCounts", "Sim", "Distance", "Sim_Rank"],
                similarPayload: ["ID", "Title", "Authors", "Source", "Year", "Abstract", "Keywords", "CitationCounts"],
                keyword: ["Keyword", "KeywordCount"],
                author: ["Author", "AuthorCount"],
                source: ["Source", "SourceCount"],
                year: ["Year", "YearCount"]
            },
            columnsVisible: {
                all: ["Title", "Authors", "Source", "Year"],
                saved: ["Title", "Authors", "Source", "Year"],
                similar: ["Title", "Sim"],
                similarPayload: ["Title"],
                keyword: ["Keyword", "KeywordCount"],
                author: ["Author", "AuthorCount"],
                source: ["Source", "SourceCount"],
                year: ["Year", "YearCount"]
            },
            columnSortByValues: {
                all: [{id: 'Year', desc: true}],
                saved: [{id: 'Year', desc: true}],
                similar: [{id: 'Sim_Rank', asc: true}],
                similarPayload: [{id: 'Year', desc: true}],
                keyword: [{id: 'KeywordCount', desc: true}],
                author: [{id: 'AuthorCount', desc: true}],
                source: [{id: 'SourceCount', desc: true}],
                year: [{id: 'YearCount', desc: true}]
            },
            dataFiltered: {
                all: [],
                saved: [],
                similar: [],
                similarPayload: [],
                keyword: [],
                author: [],
                source: [],
                year: []
            },
            columnFilterValues: {
                all: [],
                saved: [],
                similar: [],
                similarPayload: [],
                keyword: [],
                author: [],
                source: [],
                year: []
            },
            globalFilterValue: {
                all: [],
                saved: [],
                similar: [],
                similarPayload: [],
                keyword: [],
                author: [],
                source: [],
                year: []
            },
            dataKeywords: [],
            dataAuthors: [],
            dataSources: [],
            dataYears: [],
            dataTitles: [],
            dataAll: [],
            pointsAll: [],
            authorsSummary: [], // For authors with counts
            sourcesSummary: [], // For sources with counts
            keywordsSummary: [], // For keywords with counts
            yearsSummary: [],
            metaData: {},
            dataSimilarPayload: [],
            dataSimilarPayloadID: [],
            dataSimilar: [],
            dataSimilarID: [],
            dataSaved: [],
            dataSavedID: [],
            dataFilteredID: [],
            similarityType: similarityTypeDropdownOptions[0],
            maxSimilarPapers: maxSimilarPapersDropdownOptions[0],
            embeddingType: embeddingTypeDropdownOptions[0],
            isPanelOpen: false,
            similarityPanelSelectedKey: String(0),
            selectNodeIDs: [],
            eventOrigin: "table",
            searchAbstract: "",
            searchTitle: "",
            searchByAbstractLimit: maxSimilarPapersDropdownOptions[0],
            checkoutLinkRef: React.createRef(),
            scrollToPaperID: 0,
            paperNoEmbeddings: {},
            chatText: '',
            chatResponse: '',
            chatResponsing: false,
            chatDoc: [],
            summarizeResponse: '',
            chatHistory: [],
            chatSelectedPaper: '',
            tabs: [{id: '1', title: 'Chat 1'}], // Initial state with one default tab
            activeKey: '1', // Track the active tab
            nextTabId: 2, // Next available tab ID
            dialogStates: {
                '1': {
                    chatText: '',
                    chatHistory: [],
                    chatResponse: '',
                    chatSelectedPaper: '',
                    displayMessages: [],
                    chatSessionId: `chat_${Date.now()}_1`  // Unique persistent ID for first tab
                }
            },
            offset: 0,
            hasMoreData: true,
            totalPaperCount: null,
            allDataLoaded: false,
            isMetaTableModalOpen: false,
            similarMaxScore: 0,
            similarMinScore: 0,
            notesContent: '',
            // Text editor tracking
            writingSessionId: '',
            lastWritingActivity: 0,
            writingStartTime: 0,
            isCurrentlyWriting: false,
        }
        this.setSpinner = this.setSpinner.bind(this);
    }

    setSpinner(isSpinnerActive: boolean, loadingText: string = 'Loading...') {
        this.setState({
            spinner: isSpinnerActive,
            loadingText: loadingText,
        });
    }


    handleNotesChange = (content: string) => {
        const plainText = content.replace(/<[^>]+>/g, '').trim();
        const contentLength = plainText.length;

        this.setState({
            notesContent: content,
            lastWritingActivity: Date.now()
        }, () => {
            // Practice task: Complete note task if user has written at least 10 characters
            if (this.props.isPractice && contentLength >= 10) {
                this.completePracticeTask('note');
            }
        });

        try {
            localStorage.setItem('research_notes', content)
        }
        catch(error) {
            console.warn('Error with saving the research notes', error)
        }

        // Log content change with debouncing
        if (this.contentChangeTimer) {
            clearTimeout(this.contentChangeTimer);
        }

        this.contentChangeTimer = setTimeout(() => {
            Logger.logTextEditorEvent({
                component: 'App_ResearchNotes',
                action: 'content_change',
                actionType: 'typing',
                content: content,
                contentLength: contentLength,
                writingSessionId: this.state.writingSessionId,
                timeSpent: this.state.writingStartTime ? Date.now() - this.state.writingStartTime : 0
            });
        }, 2000); // Log after 2 seconds of inactivity
    };

    handleQuillFocus = () => {
        const sessionId = `session_${Date.now()}`;
        const startTime = Date.now();

        this.setState({
            isCurrentlyWriting: true,
            writingSessionId: sessionId,
            writingStartTime: startTime,
            lastWritingActivity: startTime
        });

        Logger.logTextEditorEvent({
            component: 'App_ResearchNotes',
            action: 'focus',
            actionType: 'start_writing',
            writingSessionId: sessionId
        });

        // Start periodic logging every 30 seconds while editor is focused
        this.periodicLogTimer = setInterval(() => {
            if (this.state.isCurrentlyWriting) {
                const plainText = this.state.notesContent.replace(/<[^>]+>/g, '').trim();
                Logger.logTextEditorEvent({
                    component: 'App_ResearchNotes',
                    action: 'periodic_update',
                    actionType: 'writing_progress',
                    contentLength: plainText.length,
                    writingSessionId: this.state.writingSessionId,
                    timeSpent: Date.now() - this.state.writingStartTime
                });
            }
        }, 30000); // Log every 30 seconds
    };

    handleQuillBlur = () => {
        const plainText = this.state.notesContent.replace(/<[^>]+>/g, '').trim();
        const timeSpent = this.state.writingStartTime ? Date.now() - this.state.writingStartTime : 0;

        this.setState({
            isCurrentlyWriting: false
        });

        Logger.logTextEditorEvent({
            component: 'App_ResearchNotes',
            action: 'blur',
            actionType: 'pause_writing',
            contentLength: plainText.length,
            writingSessionId: this.state.writingSessionId,
            timeSpent: timeSpent
        });

        // Clear periodic logging timer
        if (this.periodicLogTimer) {
            clearInterval(this.periodicLogTimer);
            this.periodicLogTimer = null;
        }
    };

    logQuillContent = () => {
        const plainText = this.state.notesContent.replace(/<[^>]+>/g, '').trim();
        Logger.logTextEditorEvent({
            component: 'App_ResearchNotes',
            action: 'next',
            actionType: 'finish_writing',
            content: this.state.notesContent,
            contentLength: plainText.length,
            writingSessionId: this.state.writingSessionId,
            timeSpent: this.state.writingStartTime ? Date.now() - this.state.writingStartTime : 0
        })
    }

    // Helper method to complete practice tasks
    completePracticeTask = (taskId: string) => {
        if (this.props.isPractice && this.props.onPracticeTaskComplete && !this.practiceTasksCompleted.has(taskId)) {
            this.practiceTasksCompleted.add(taskId);
            this.props.onPracticeTaskComplete(taskId);
        }
    }

    setMetaTableModalState = (isOpen: boolean) => {
        this.setState({isMetaTableModalOpen: isOpen});
    };

    // Format LLM response to make citations more readable
    formatLLMResponse = (text: string): string => {
        if (!text) return text;

        let formatted = text;

        // Step 1: Format citations in parentheses
        const citationPattern = /\s*\(\s*([^)]+?)\s*\)\s*\./g;
        formatted = formatted.replace(citationPattern, (match, citations) => {
            const citationList = citations
                .split(';')
                .map((c: string) => c.trim())
                .filter((c: string) => c.length > 0);

            if (citationList.length > 0) {
                const formattedCitations = citationList
                    .map((c: string) => `  - ${c}`)
                    .join('\n');
                return `\n\n**References:**\n${formattedCitations}\n\n`;
            }
            return match;
        });

        // Step 2: Bold paper titles and add paragraph spacing
        // Pattern matches: "Title text. — " or "Title text — "
        // Captures everything before the em dash as the title
        const titlePattern = /^(.+?)\.?\s*—\s*/gm;
        formatted = formatted.replace(titlePattern, (match, title) => {
            // Clean up the title
            const cleanTitle = title.trim().replace(/\.\s*$/, '');
            // Check if this looks like a paper title (not a section header)
            // Section headers are usually shorter and end with specific keywords
            if (cleanTitle.length > 15 || cleanTitle.includes(':')) {
                return `\n\n**${cleanTitle}** —\n\n`;
            }
            return match;
        });

        // Step 3: Add spacing around standalone section headers
        // (text ending with colon at start of line or after double newline)
        formatted = formatted.replace(/\n([A-Z][^:\n]{5,50}:)\s*\n/g, '\n\n**$1**\n\n');

        // Also handle section headers at the very beginning
        formatted = formatted.replace(/^([A-Z][^:\n]{5,50}:)\s*\n/g, '**$1**\n\n');

        // Step 4: Ensure paragraphs between different paper summaries
        // Add extra line break before paper titles (identified by bold + em dash)
        formatted = formatted.replace(/([.!?])\s+(\n\n\*\*)/g, '$1\n$2');

        return formatted;
    };

    loadMoreData = async () => {
        const {
            offset,
            hasMoreData,
            globalFilterValue,
            columnFilterValues,
        } = this.state;
        const limit = 1000; // Load 1000 papers at a time
        console.log("loadMoreData");
        if (hasMoreData) {
            this.setState({spinner: true, loadingText: 'Loading More Data...'});
            try {
                console.log('columnFilterValues["all"]', columnFilterValues["all"]);
                const author = columnFilterValues["all"]
                    .find(f => f.id === 'Authors')?.value?.flat() || []; // Flatten any nested array
                // console.log('Processed authors:', author);
                const source = columnFilterValues["all"].find(f => f.id === 'Source')?.value;
                const keyword = columnFilterValues["all"]
                    .find(f => f.id === 'Keywords')?.value?.flat() || [];
                // console.log('Processed keywords:', keyword);
                const yearFilter = columnFilterValues["all"].find(f => f.id === 'Year');
                const citationFilter = columnFilterValues["all"].find(f => f.id === 'CitationCounts');
                console.log('citationFilter', citationFilter);
                // console.log('yearFilter',yearFilter)
                let minYear = yearFilter ? yearFilter.value[0] : undefined;
                // console.log('minYear',minYear)
                let maxYear = yearFilter ? yearFilter.value[1] : undefined;
                // Reset to undefined only if BOTH are at defaults (full range = no filter)
                if (minYear === this.state.minYear && maxYear === this.state.maxYear) {
                    minYear = undefined;
                    maxYear = undefined;
                }
                let minCitationCounts = citationFilter ? citationFilter.value[0] : undefined;
                let maxCitationCounts = citationFilter ? citationFilter.value[1] : undefined;
                // Reset to undefined only if BOTH are at defaults (full range = no filter)
                if (minCitationCounts === this.state.minCitationCounts && maxCitationCounts === this.state.maxCitationCounts) {
                    minCitationCounts = undefined;
                    maxCitationCounts = undefined;
                }

                const searchText = columnFilterValues["all"]
                    .filter(f => f.id === 'Title') // Filter for entries with id 'Title'
                    .map(f => f.value) // Extract the value for each entry
                    .join(' ');
                // Extract CitationCounts (assuming it is a range with [min, max])
                const abstract = columnFilterValues["all"]
                    .find(f => f.id === 'Abstract')?.value || undefined;

                // Extract ID
                const idValue = columnFilterValues["all"].find(f => f.id === 'ID')?.value;
                let idList;
                if (idValue) {
                    idList = [idValue]; // Wrap in an array if it's not already
                } else {
                    idList = undefined; // Keep it undefined if there is no value
                }

                const queryPayload = {
                    offset,
                    limit,
                    title: searchText && searchText.length > 0 ? searchText : undefined,
                    author: author?.length ? author : undefined,
                    source: source?.length ? source : undefined,
                    keyword: keyword?.length ? keyword : undefined,
                    min_year: minYear || undefined,
                    max_year: maxYear || undefined,
                    abstract: abstract || undefined,
                    min_citation_counts: minCitationCounts || undefined,
                    max_citation_counts: maxCitationCounts || undefined,
                    id_list: idList || undefined,
                };
                console.log('==== LOAD MORE ====');
                console.log('Current offset:', this.state.offset);
                console.log('Current dataAll length:', this.state.dataAll.length);
                console.log('Query Payload:', queryPayload);
                const response = await fetch(`${baseUrl}getPapers`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(queryPayload),
                });
                const responseData = await response.json();
                const newData = responseData.papers || responseData;
                const totalFromServer = responseData.total !== undefined ? responseData.total : null;

                console.log('Received from server:', newData.length, 'papers, total:', totalFromServer);

                const combinedData = [...this.state.dataAll, ...newData];
                console.log('Combined data (before dedup):', combinedData.length);

                const uniqueData = Array.from(new Set(combinedData.map(item => item.ID))).map(
                    id => combinedData.find(item => item.ID === id)
                );
                console.log('Unique data (after dedup):', uniqueData.length);

                const dataFilteredIDs = uniqueData.map(item => item.ID);

                this.setState((prevState) => {
                    const totalCount = totalFromServer !== null ? totalFromServer : prevState.totalPaperCount;

                    const newState = {
                        dataAll: uniqueData,
                        dataFiltered: {
                            ...prevState.dataFiltered,
                            all: uniqueData
                        },
                        dataFilteredID: dataFilteredIDs,
                        offset: prevState.offset + newData.length,
                        totalPaperCount: totalCount,
                        // hasMoreData: we have less data loaded than the total available
                        hasMoreData: totalCount !== null ? uniqueData.length < totalCount : newData.length > 0,
                        spinner: false,
                        loadingText: 'Loading Meta Data...',
                    };
                    console.log('New state - loaded:', newState.dataAll.length, 'total:', newState.totalPaperCount, 'hasMoreData:', newState.hasMoreData);
                    return newState;
                });
            } catch (error) {
                console.error("Error loading more data:", error);
                this.setState({spinner: false});
                this.setState({loadingText: 'Loading...'});
            }
        }
    };
    loadAllData = async () => {
        const {
            globalFilterValue,
            hasMoreData,
            columnFilterValues,
            offset,
            totalPaperCount,
        } = this.state;

        // Warn user if trying to load a large dataset
        if (totalPaperCount !== null && totalPaperCount > 5000) {
            const confirmed = window.confirm(
                `This will load all ${totalPaperCount.toLocaleString()} papers, which may take some time and slow down your browser. Continue?`
            );
            if (!confirmed) {
                return;
            }
        }

        if (hasMoreData) {
            this.setState({spinner: true, loadingText: 'Loading All Data...'});
            try {
                const limit = -1;  // Indicates to fetch all records at once
                const offset = 0;
                const author = columnFilterValues["all"]
                    .find(f => f.id === 'Authors')?.value?.flat() || [];
                const source = columnFilterValues["all"].find(f => f.id === 'Source')?.value;
                const keyword = columnFilterValues["all"]
                    .find(f => f.id === 'Keywords')?.value?.flat() || [];
                const yearFilter = columnFilterValues["all"].find(f => f.id === 'Year');
                let minYear = yearFilter ? yearFilter.value[0] : undefined;
                // console.log('minYear',minYear)
                let maxYear = yearFilter ? yearFilter.value[1] : undefined;
                // Reset to undefined if minYear is 1974 or maxYear is 2023
                minYear = minYear === 1974 ? undefined : minYear;
                maxYear = maxYear === 2023 ? undefined : maxYear;
                const citationFilter = columnFilterValues["all"].find(f => f.id === 'CitationCounts');
                let minCitationCounts = citationFilter ? citationFilter.value[0] : undefined;
                let maxCitationCounts = citationFilter ? citationFilter.value[1] : undefined;
                // Reset to undefined if minCitationCounts is 1 or maxCitationCounts is 1611
                minCitationCounts = minCitationCounts === 0 ? undefined : minCitationCounts;
                maxCitationCounts = maxCitationCounts === 1611 ? undefined : maxCitationCounts;
                const searchText = columnFilterValues["all"]
                    .filter(f => f.id === 'Title')
                    .map(f => f.value)
                    .join(' ');
                const abstract = columnFilterValues["all"]
                    .find(f => f.id === 'Abstract')?.value || undefined;

                // Extract ID (same as loadMoreData)
                const idValue = columnFilterValues["all"].find(f => f.id === 'ID')?.value;
                let idList;
                if (idValue) {
                    idList = [idValue]; // Wrap in an array if it's not already
                } else {
                    idList = undefined; // Keep it undefined if there is no value
                }

                const queryPayload = {
                    offset,
                    limit,
                    title: searchText && searchText.length > 0 ? searchText : undefined,
                    author: author?.length ? author : undefined,
                    source: source?.length ? source : undefined,
                    keyword: keyword?.length ? keyword : undefined,
                    min_year: minYear || undefined,
                    max_year: maxYear || undefined,
                    abstract: abstract || undefined,
                    min_citation_counts: minCitationCounts || undefined,
                    max_citation_counts: maxCitationCounts || undefined,
                    id_list: idList || undefined,
                };

                console.log('==== LOAD ALL ====');
                console.log('Current dataAll length:', this.state.dataAll.length);
                console.log('Query Payload:', queryPayload);

                const response = await fetch(`${baseUrl}getPapers`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(queryPayload),
                });

                const responseData = await response.json();
                const allData = responseData.papers || responseData;
                const totalFromServer = responseData.total !== undefined ? responseData.total : null;

                console.log('Received from server:', allData.length, 'papers, total:', totalFromServer);
                const dataFilteredIDs = allData.map(item => item.ID);

                // Determine if we should set totalPaperCount (only when no filters are applied)
                const isUnfiltered = areQueryConditionsUndefined(queryPayload);
                console.log('Is unfiltered query:', isUnfiltered);

                this.setState((prevState) => {
                    const newState = {
                        dataAll: allData,
                        offset: allData.length,
                        hasMoreData: false,
                        spinner: false,
                        loadingText: 'Loading...',
                        dataFiltered: {
                            ...prevState.dataFiltered,
                            all: allData,
                        },
                        dataFilteredID: dataFilteredIDs,
                        allDataLoaded: isUnfiltered,
                        totalPaperCount: totalFromServer !== null ? totalFromServer : (isUnfiltered ? allData.length : prevState.totalPaperCount),
                    };
                    console.log('New state - loaded:', newState.dataAll.length, 'total:', newState.totalPaperCount);
                    return newState;
                }, () => {
                    // Practice task: Complete search task if user performed a search/filter
                    if (this.props.isPractice && !isUnfiltered) {
                        this.completePracticeTask('search');
                    }
                });

            } catch (error) {
                console.error("Error loading all data:", error);
                this.setState({spinner: false});
                this.setState({loadingText: 'Loading...'});
            }
        }

    };

    applyLocalFilters = (data, columnFilters, globalFilter = null) => {
        if (!columnFilters || columnFilters.length === 0) {
            return data; // No filters applied, return all data
        }


        const filteredData = data.filter((row) => {
            // Apply column filters
            const columnFilterPass = columnFilters.every((filter) => {
                const {id, value} = filter;


                // Skip null filters
                if (!id || value === undefined || value === null) {
                    return true; // Skip invalid filters
                }
                const columnValue = row[id];
                if (columnValue === null) {
                    return false; // Exclude rows with null array values
                }
                // if (columnValue === null || columnValue === undefined) {
                //     return false; // Exclude rows with null/undefined values for this column
                // }


                // Exact match filters (e.g., Keywords, Authors)
                if (Array.isArray(columnValue)) {
                    if (columnValue === null) {
                        return false; // Exclude rows with null array values
                    }
                    // Handle array fields like `Authors` or `Keywords`
                    if (Array.isArray(value)) {
                        // Match if any filter value exists in the column's array
                        return value.some((filterVal) => columnValue.includes(filterVal));
                    }
                    return columnValue.includes(value); // Single value match
                } else if (typeof columnValue === 'string') {
                    // Handle string fields like `Title`, `Source`, and `Abstract`
                    if (Array.isArray(value)) {
                        // Match if any filter value exists in the string (case-insensitive)
                        return value.some((filterVal) =>
                            columnValue.toLowerCase() === filterVal.toLowerCase() // Exact match
                        );
                    }
                    if (typeof value === 'string') {
                        // Match if the string contains the filter value (case-insensitive)
                        return columnValue.toLowerCase().includes(value.toLowerCase());
                    }
                    return false;
                } else if (typeof columnValue === 'number') {
                    // Handle numeric fields like `Year` and `CitationCounts`
                    if (Array.isArray(value) && value.length === 2) {
                        const [min, max] = value;
                        return columnValue >= min && columnValue <= max; // Range match
                    }
                    return columnValue === value; // Exact match
                }

                return true;
            });

            // Apply global filter
            const globalFilterPass = globalFilter
                ? Object.values(row).some((value) =>
                    String(value).toLowerCase().includes(globalFilter.toLowerCase())
                )
                : true;

            return columnFilterPass && globalFilterPass;
        });
        return filteredData;
    };


    addNewTab = () => {
        const newId = this.state.nextTabId.toString(); // Use counter for unique ID
        const newTabNumber = this.state.tabs.length + 1; // Display number based on position

        this.setState((prevState) => ({
            tabs: [...prevState.tabs, {id: newId, title: `Chat ${newTabNumber}`}],
            activeKey: newId,
            nextTabId: prevState.nextTabId + 1, // Increment counter
            dialogStates: {
                ...prevState.dialogStates,
                [newId]: {
                    chatText: "",
                    chatHistory: [],
                    chatResponse: "",
                    chatSelectedPaper: "",
                    displayMessages: [],
                    chatSessionId: `chat_${Date.now()}_${newId}` // Unique persistent ID per tab
                }
            }
        }));

        // New tab creation
        Logger.logUIInteraction({
            component: 'App',
            action: 'chat_tab_create',
            elementId: 'addNewTabButton',
            value: newId,
            totalTabs: this.state.tabs.length + 1
        });
    };
    removeTab = (id: string) => {
        // Store current scroll position before state change
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;
        
        const tabToRemove = this.state.tabs.find(tab => tab.id === id);
        let newTabs = this.state.tabs.filter((tab) => tab.id !== id);

        // Renumber remaining tabs based on their position
        newTabs = newTabs.map((tab, index) => ({
            ...tab,
            title: `Chat ${index + 1}`
        }));

        const newActiveKey = newTabs.length > 0 ? newTabs[0].id : "";
        const newDialogStates = {...this.state.dialogStates};
        delete newDialogStates[id]; // Remove the dialog state for the closed tab

        this.setState({
            tabs: newTabs,
            activeKey: newActiveKey,
            dialogStates: newDialogStates
        }, () => {
            // Restore scroll position after state update
            window.scrollTo(scrollX, scrollY);
        });

        // Tab removal
        Logger.logUIInteraction({
            component: 'App',
            action: 'chat_tab_remove',
            elementId: `removeTab_${id}`,
            value: id,
            tabTitle: tabToRemove?.title,
            remainingTabs: newTabs.length,
            newActiveTab: newActiveKey
        });
    };

    setActiveKey = (key: string | null) => {
        if (key !== null) {
            const previousKey = this.state.activeKey;
            this.setState({activeKey: key});
            
            // Tab switch
            Logger.logUIInteraction({
                component: 'App',
                action: 'chat_tab_switch',
                value: key,
                totalTabs: this.state.tabs.length
            });
        }
    };
    updateDialogState = (tabId: string, updater: any) => {         
        this.setState(prev => {
        const prevDialog = prev.dialogStates[tabId] || {};
        const patch =
            typeof updater === "function" ? updater(prevDialog) : updater;
        return {
            dialogStates: {
            ...prev.dialogStates,
            [tabId]: { ...prevDialog, ...patch },
            },
        };
        });
    };

    updateStateProp = (_what, _with, _where) => {
        var _property = {...this.state[_what]};
        _property[_where] = _with;
        let stateObj = {};
        stateObj[_what] = _property;
        this.setState(stateObj);
    }


    getData = () => {
        this.setState({spinner: true});
        let parent = this;

        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ limit: 1000, offset: 0 })
        };
        fetch(baseUrl + 'getPapers', requestOptions)
            .then(function (response) {
                // The response is a Response instance.
                // You parse the data into a useable format using `.json()`
                return response.text();
            }).then(function (data) {
            // `data` is the parsed version of the JSON returned from the above endpoint.
            const parsedData = JSON.parse(data);
            const _dataAll = parsedData.papers || parsedData;
            const totalFromServer = parsedData.total !== undefined ? parsedData.total : null;
            const _paperNoEmbeddings = {
                "specter": [],
                "glove": [],
                "ada": []
            }
            _dataAll.forEach(_d => {
                if (!("specter_umap" in _d && Array.isArray(_d["specter_umap"]) && _d["specter_umap"].length == 2)) {
                    _paperNoEmbeddings["specter"].push(_d["ID"]);
                }
                if (!("glove_umap" in _d && Array.isArray(_d["glove_umap"]) && _d["glove_umap"].length == 2)) {
                    _paperNoEmbeddings["glove"].push(_d["ID"]);
                }
                if (!("ada_umap" in _d && Array.isArray(_d["ada_umap"]) && _d["ada_umap"].length == 2)) {
                    _paperNoEmbeddings["ada"].push(_d["ID"]);
                }
            });

            parent.updateStateProp("paperNoEmbeddings", _paperNoEmbeddings["glove"], "glove");
            parent.updateStateProp("paperNoEmbeddings", _paperNoEmbeddings["specter"], "specter");
            parent.updateStateProp("paperNoEmbeddings", _paperNoEmbeddings["ada"], "ada");
            console.log('Initial data loaded:', _dataAll.length, 'papers, total:', totalFromServer);
            const filteredIDs = _dataAll.map((paper) => paper.ID);
            parent.setState((prevState) => ({
                dataAll: _dataAll,
                spinner: false,
                dataFiltered: {
                    ...prevState.dataFiltered, // Retain existing keys in dataFiltered, if any
                    all: _dataAll, // Update or set the "all" key
                },
                dataFilteredID: filteredIDs,
                dataLoaded: true,
                offset: _dataAll.length,
                totalPaperCount: totalFromServer,
                // hasMoreData: check if we have less loaded than total
                hasMoreData: totalFromServer !== null ? _dataAll.length < totalFromServer : true,
            }));
        });
    }

    getUmapPoints = () => {
        this.setState({spinner: true});
        let parent = this;

        const requestOptions = {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        };
        fetch(baseUrl + 'getUmapPoints', requestOptions)
            .then(function (response) {
                return response.text();
            }).then(function (data) {
            const _pointsAll = JSON.parse(data);
            const _paperNoEmbeddings = {
                "specter": [],
                "glove": [],
                "ada": []
            }
            _pointsAll.forEach(_d => {
                if (!("specter_umap" in _d && Array.isArray(_d["specter_umap"]) && _d["specter_umap"].length == 2)) {
                    _paperNoEmbeddings["specter"].push(_d["ID"]);
                }
                if (!("glove_umap" in _d && Array.isArray(_d["glove_umap"]) && _d["glove_umap"].length == 2)) {
                    _paperNoEmbeddings["glove"].push(_d["ID"]);
                }
                if (!("ada_umap" in _d && Array.isArray(_d["ada_umap"]) && _d["ada_umap"].length == 2)) {
                    _paperNoEmbeddings["ada"].push(_d["ID"]);
                }
            });

            parent.updateStateProp("paperNoEmbeddings", _paperNoEmbeddings["glove"], "glove");
            parent.updateStateProp("paperNoEmbeddings", _paperNoEmbeddings["specter"], "specter");
            parent.updateStateProp("paperNoEmbeddings", _paperNoEmbeddings["ada"], "ada");
            parent.setState({
                "pointsAll": _pointsAll,
                "spinner": false
            });
        });
    }

    getMetaData = async () => {
        if (this.state.metadataInitialized) return;

        this.setState({spinner: true});

        try {
            const response = await fetch(baseUrl + 'getMetaData', {
                method: 'GET',
                headers: {'Content-Type': 'application/json'},
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // console.log("Fetched Metadata:", data);

            // Safeguards and data processing
            let authorsSummary = data.authors_summary || [];
            const authors = authorsSummary.map(item => item._id);
            
            // DEBUG: Check what authors we received
            console.log(`DEBUG App.tsx: Received ${authors.length} authors from backend`);
            const arpitAuthors = authors.filter(a => a && a.toLowerCase().includes('arpit'));
            console.log(`DEBUG App.tsx: Authors containing 'arpit':`, arpitAuthors);
            const emilyAuthors = authors.filter(a => a && a.toLowerCase().includes('emily wall'));
            console.log(`DEBUG App.tsx: Authors containing 'emily wall':`, emilyAuthors);
            
            authorsSummary = (authorsSummary || []).sort((a, b) => b.count - a.count);

            let sourcesSummary = data.sources_summary || [];
            const sources = sourcesSummary.map(item => item._id);
            sourcesSummary = (sourcesSummary || []).sort((a, b) => b.count - a.count);

            let keywordsSummary = data.keywords_summary || [];
            const keywords = keywordsSummary.map(item => item._id);
            // console.log('keywordsSummary',keywordsSummary);
            keywordsSummary = (keywordsSummary || []).sort((a, b) => b.count - a.count);

            let yearsSummary = data.years_summary || [];
            const years = yearsSummary.map(item => item._id);
            yearsSummary = (yearsSummary || []).sort((a, b) => b.count - a.count);

            const titles = data.titles || [];
            const citationCounts = data.citation_counts || [];

            const minYear = years.length > 0 ? Math.min(...years) : 1975;
            const maxYear = years.length > 0 ? Math.max(...years) : 2025;
            const minCitationCounts = citationCounts.length > 0 ? Math.min(...citationCounts) : -1;
            const maxCitationCounts = citationCounts.length > 0 ? Math.max(...citationCounts) : 1000;

            this.setState({
                metaData: data,
                dataAuthors: authors,
                authorsSummary,  // Keep the counts for display
                dataSources: sources,
                sourcesSummary,
                dataKeywords: keywords,
                keywordsSummary,
                dataYears: years,
                yearsSummary,
                dataTitles: titles,
                minYear,
                maxYear,
                minCitationCounts,
                maxCitationCounts,
                metadataInitialized: true,
                spinner: false,
                loadingText: 'Loading...',
            });

            // Call the callback if provided to notify that metadata has loaded

            if (this.props.onMetadataLoaded) {
                setTimeout(()=> {
                    this.props.onMetadataLoaded!()
                }, 1000)
            }
        } catch (error) {
            console.error("Error fetching metadata:", error);
            this.setState({spinner: false});
        }
    };
    loadSavedPapers = () => {
        try {
            const raw = localStorage.getItem("saved_papers");
            if (raw) {
            const papers = JSON.parse(raw);
            this.setState({
                dataSaved: papers,
                dataSavedID: papers.map((p: any) => p.ID),
            });
            }
        } catch (e) {
            console.warn("Failed to load saved papers from localStorage:", e);
        }
        };


    componentDidMount() {
        this.loadInitialData();
        this.loadSavedNotes();
        this.loadSavedPapers();
    }

    componentWillUnmount() {
        // Clean up timers
        if (this.contentChangeTimer) {
            clearTimeout(this.contentChangeTimer);
        }
        if (this.periodicLogTimer) {
            clearInterval(this.periodicLogTimer);
        }
        if (this.writingPauseTimeout) {
            clearTimeout(this.writingPauseTimeout);
        }
    }

    loadSavedNotes = () => {
        try {
            const savedContent = localStorage.getItem('research_notes')
            if (savedContent) {
                this.setState({notesContent:savedContent})
            }
        } catch (error) {
            console.warn('Failed to load notes from localStorage:', error);
        }
    };

    loadInitialData = async () => {
        const { onLoadingProgress } = this.props;
        
        try {
            // Report initial progress
            if (onLoadingProgress) onLoadingProgress(0.1);
            
            // Load metadata first (this is usually the slowest)
            await this.getMetaData();
            if (onLoadingProgress) onLoadingProgress(0.5);
            
            // Load papers data
            await this.getData();
            if (onLoadingProgress) onLoadingProgress(0.8);
            
            // Load UMAP points
            await this.getUmapPoints();
            if (onLoadingProgress) onLoadingProgress(1.0);
            
        } catch (error) {
            console.error("Error loading initial data:", error);
            this.setState({dataLoaded: false});
        }
    };

    // componentDidUpdate(prevProps, prevState) {
    //     if (prevState.dataAuthors !== this.state.dataAuthors) {
    //         console.log("dataAuthors updated:", this.state.dataAuthors);
    //     }
    //     if (prevState.dataSources !== this.state.dataSources) {
    //         console.log("dataSources updated:", this.state.dataSources);
    //     }
    //     if (prevState.dataKeywords !== this.state.dataKeywords) {
    //         console.log("dataKeywords updated:", this.state.dataKeywords);
    //     }
    // }

    public render() {


        const {dataLoaded} = this.state;
        const toggleIsCiteUsCalloutVisible = () => {
            this.setState({
                isCiteUsCalloutVisible: !this.state.isCiteUsCalloutVisible
            });
        }


        const openGScholar = (title) => {
            // Inferring+Cognitive+Models+from+Data+using+Approximate+Bayesian+Computation
            const url = "https://scholar.google.com/scholar?hl=en&q=" + encodeURI(title);
            window.open(url, "_blank");
        }

        const hasEmbeddings = (ID) => {
            const embeddingData = this.state.paperNoEmbeddings[this.state.embeddingType.key as string];
            return embeddingData ? embeddingData.indexOf(ID) === -1 : false;
        };

        const isInSimilarInputPapers = (row) => {
            if (Array.isArray(row)) {
                let _numSimilar = 0;
                row.forEach((r) => {
                    try {
                        if (this.state.dataSimilarPayloadID.includes(r["ID"])) {
                            _numSimilar += 1;
                        }
                    } catch (err) {
                        // continue
                    }
                });
                return _numSimilar == row.length;
            } else {
                try {
                    return this.state.dataSimilarPayloadID.includes(row["ID"]);
                } catch (err) {
                    return false;
                }
            }
        }

        const isInSimilarPapers = (row) => {
            if (Array.isArray(row)) {
                let _numSimilar = 0;
                row.forEach((r) => {
                    try {
                        if (this.state.dataSimilarID.includes(r["ID"])) {
                            _numSimilar += 1;
                        }
                    } catch (err) {
                        // continue
                    }
                });
                return _numSimilar == row.length;
            } else {
                try {
                    return this.state.dataSimilarID.includes(row["ID"]);
                } catch (err) {
                    return false;
                }
            }
        }

        const updateFilteredPaperIDs = (_filteredPapers) => {
            const _filteredPaperID = _filteredPapers.map((row) => {
                return row["ID"];
            });
            this.setState({
                dataFilteredID: _filteredPaperID
            })
        }

        const updateSimilarPaperIDs = (_similarPapers) => {
            const _similarPapersID = _similarPapers.map((row) => {
                return row["ID"];
            });
            this.setState({
                dataSimilarID: _similarPapersID
            })
        }

        const isInFilteredPapers = (row) => {
            if (Array.isArray(row)) {
                let _numFiltered = 0;
                row.forEach((r) => {
                    try {
                        if (this.state.dataFilteredID.includes(r["ID"])) {
                            _numFiltered += 1;
                        }
                    } catch (err) {
                        // continue
                    }
                });
                return _numFiltered == row.length;
            } else {
                try {
                    return this.state.dataFilteredID.includes(row["ID"]);
                } catch (err) {
                    return false;
                }
            }
        }

        const isInSelectedNodeIDs = (id) => {
            return this.state.selectNodeIDs.indexOf(id) !== -1;
        }

        const isInSavedPapers = (row) => {
            if (Array.isArray(row)) {
                let _numSaved = 0;
                row.forEach((r) => {
                    try {
                        if (this.state.dataSavedID.includes(r["ID"])) {
                            _numSaved += 1;
                        }
                    } catch (err) {
                        // continue
                    }
                });
                return _numSaved == row.length;
            } else {
                try {
                    return this.state.dataSavedID.includes(row["ID"]);
                } catch (err) {
                    return false;
                }
            }
        }

        const addToSimilarInputPapers = (row: any) => {
            const _papers = [...this.state.dataSimilarPayload]
            let _similarInputPapers = [...this.state.dataSimilarPayloadID];
            if (Array.isArray(row)) {
                row.forEach((r) => {
                    if (_papers.indexOf(r) === -1) {
                        _papers.push(r);
                        _similarInputPapers.push(r["ID"]);
                    }
                });
            } else {
                if (_papers.indexOf(row) === -1) {
                    _papers.push(row);
                    _similarInputPapers.push(row["ID"])
                }
            }
            this.setState({
                dataSimilarPayload: _papers,
                dataSimilarPayloadID: _similarInputPapers
            });
        }

        const addToSavedPapers = (row: any) => {
            let _papers = [...this.state.dataSaved];
            let _savedPaperIDs = [...this.state.dataSavedID];
            if (Array.isArray(row)) {
                row.forEach((r) => {
                    if (_papers.indexOf(r) === -1) {
                        _papers.push(r);
                    }
                    if (_savedPaperIDs.indexOf(r["ID"]) === -1) {
                        _savedPaperIDs.push(r["ID"]);
                    }
                });
            } else {
                if (_papers.indexOf(row) === -1) {
                    _papers.push(row);
                }
                if (_savedPaperIDs.indexOf(row["ID"]) === -1) {
                    _savedPaperIDs.push(row["ID"]);
                }
            }
            this.setState({
                dataSaved: _papers,
                dataSavedID: _savedPaperIDs
            }, () => {
                // Save to localStorage for persistence across steps
                try {
                    localStorage.setItem('saved_papers', JSON.stringify(_papers));
                } catch (e) {
                    console.warn('Failed to save papers to localStorage:', e);
                }

                // Practice task: Check if user has saved at least 2 papers
                if (this.props.isPractice && _savedPaperIDs.length >= 2) {
                    this.completePracticeTask('save');
                }
            });
        }

        const getSimilarPapersByAbstract = () => {
            this.setState({spinner: true});
            
            // Abstract similarity search start
            Logger.logLLMInteraction({
                component: 'App',
                action: 'similarity_search_by_abstract_start',
                query: this.state.searchAbstract,
                title: this.state.searchTitle,
                embeddingType: this.state.embeddingType.key,
                limit: this.state.searchByAbstractLimit.key,
                abstractLength: this.state.searchAbstract?.length || 0
            });
            
            let parent = this;
            const requestOptions = {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    "embedding": this.state.embeddingType.key,
                    "input_data": {
                        "title": this.state.searchTitle,
                        "abstract": this.state.searchAbstract
                    },
                    "limit": this.state.searchByAbstractLimit.key == '-1' ? this.state.dataAll.length : this.state.searchByAbstractLimit.key
                })
            };
            fetch(baseUrl + "getSimilarPapersByAbstract", requestOptions)
                .then(response => response.json())
                .then((data) => {
                    updateSimilarPaperIDs(data);
                    const scores = data.length > 0 ? data.map(d => d.score || 0) : [0]; // in case some docs have no score or empty data
                    const minScore = Math.min(...scores);
                    const maxScore = Math.max(...scores);
                    // Reset filters for similarity results to prevent stale filters from previous searches
                    const resetColumnFilterValues = {...parent.state.columnFilterValues};
                    resetColumnFilterValues["similar"] = [];
                    const resetGlobalFilterValue = {...parent.state.globalFilterValue};
                    resetGlobalFilterValue["similar"] = "";
                    parent.setState({
                        "dataSimilar": data,
                        "spinner": false,
                        "similarityPanelSelectedKey": String(2), // Redirect to the `Output Similar` tab.
                        similarMinScore: minScore,
                        similarMaxScore: maxScore,
                        columnFilterValues: resetColumnFilterValues,
                        globalFilterValue: resetGlobalFilterValue
                    }, () => {
                        console.log("Updated State (By Abstract):", this.state.dataSimilar); // Log updated state

                        // Abstract similarity search completion
                        Logger.logLLMInteraction({
                            component: 'App',
                            action: 'similarity_search_by_abstract_complete',
                            resultsCount: data?.length || 0,
                            minScore: minScore,
                            maxScore: maxScore,
                            embeddingType: parent.state.embeddingType.key
                        });
                    });
                });
        }

        const getSimilarPapers = () => {
            this.setState({spinner: true});
            
            // Similarity search by papers
            Logger.logLLMInteraction({
                component: 'App',
                action: 'similarity_search_by_papers_start',
                inputPapersCount: this.state.dataSimilarPayload.length,
                embeddingType: this.state.embeddingType.key,
                dimensions: this.state.similarityType.key,
                limit: this.state.maxSimilarPapers.key,
                inputPaperIds: this.state.dataSimilarPayload.map(item => item["ID"])
            });
            
            let parent = this;
            const requestOptions = {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    "input_data": this.state.dataSimilarPayload.map((item) => {
                        return item["ID"]
                    }),
                    "input_type": "ID",
                    "limit": this.state.maxSimilarPapers.key == '-1' ? this.state.dataAll.length : this.state.maxSimilarPapers.key,
                    "embedding": this.state.embeddingType.key,
                    "dimensions": this.state.similarityType.key
                })
            };
            console.log("requestOptions", requestOptions)
            fetch(baseUrl + "getSimilarPapers", requestOptions)
                .then(response => response.json())
                .then((data) => {
                    updateSimilarPaperIDs(data);
                    const scores = data.length > 0 ? data.map(d => d.score || 0) : [0]; // in case some docs have no score or empty data
                    const minScore = Math.min(...scores);
                    const maxScore = Math.max(...scores);
                    // Reset filters for similarity results to prevent stale filters from previous searches
                    const resetColumnFilterValues = {...parent.state.columnFilterValues};
                    resetColumnFilterValues["similar"] = [];
                    const resetGlobalFilterValue = {...parent.state.globalFilterValue};
                    resetGlobalFilterValue["similar"] = "";
                    parent.setState({
                        dataSimilar: data,
                        spinner: false,
                        similarityPanelSelectedKey: String(2), // Redirect to the `Output Similar` tab
                        similarMinScore: minScore,
                        similarMaxScore: maxScore,
                        columnFilterValues: resetColumnFilterValues,
                        globalFilterValue: resetGlobalFilterValue
                    }, () => {
                        console.log("Updated State:", this.state.dataSimilar); // Log updated state

                        // Similarity search completion
                        Logger.logLLMInteraction({
                            component: 'App',
                            action: 'similarity_search_by_papers_complete',
                            resultsCount: data?.length || 0,
                            minScore: minScore,
                            maxScore: maxScore,
                            embeddingType: parent.state.embeddingType.key
                        });
                    });
                });
        }

        const summarizePapers = (prompt) => {
            // Summarization start
            Logger.logLLMInteraction({
                component: 'App',
                action: 'summarize_papers_start',
                query: prompt,
                paperCount: this.state.dataSavedID.length,
                paperIds: this.state.dataSavedID
            });
            
            this.setState({summarizeResponse: 'SUMMARIZING ... ...'})
            const startTime = Date.now();
            
            fetch(`${baseUrl}summarize`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ids: this.state.dataSavedID, prompt: prompt})
            }).then(response => {
                const reader = response.body.getReader()
                const decoder = new TextDecoder('utf-8')
                let partial = ''
                this.setState({summarizeResponse: ''})

                const readChunk = ({done, value}) => {
                    if (done) {
                        if (partial) {
                            this.setState({summarizeResponse: `${partial}`})
                        }
                        
                        // Summarization completion
                        Logger.logLLMInteraction({
                            component: 'App',
                            action: 'summarize_papers_complete',
                            responseLength: partial?.length || 0,
                            duration: Date.now() - startTime,
                            paperCount: this.state.dataSavedID.length
                        });
                        return
                    }
                    partial += decoder.decode(value)
                    this.setState({summarizeResponse: `${partial}`})
                    reader.read().then(readChunk)
                }
                reader.read().then(readChunk)
            })
        }

        const literatureReviewPapers = (prompt) => {
            // Literature review start
            Logger.logLLMInteraction({
                component: 'App',
                action: 'literature_review_start',
                query: prompt,
                paperCount: this.state.dataSavedID.length,
                paperIds: this.state.dataSavedID
            });
            
            this.setState({summarizeResponse: 'LITERATURE REVIEW ... ...'})
            const startTime = Date.now();
            
            fetch(`${baseUrl}literatureReview`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ids: this.state.dataSavedID, prompt: prompt})
            }).then(response => {
                const reader = response.body.getReader()
                const decoder = new TextDecoder('utf-8')
                let partial = ''
                this.setState({summarizeResponse: ''})

                const readChunk = ({done, value}) => {
                    if (done) {
                        if (partial) {
                            this.setState({summarizeResponse: `${partial}`})
                        }
                        
                        // Literature review completion
                        Logger.logLLMInteraction({
                            component: 'App',
                            action: 'literature_review_complete',
                            responseLength: partial?.length || 0,
                            duration: Date.now() - startTime,
                            paperCount: this.state.dataSavedID.length
                        });
                        return
                    }
                    partial += decoder.decode(value)
                    this.setState({summarizeResponse: `${partial}`})
                    reader.read().then(readChunk)
                }
                reader.read().then(readChunk)
            })
        }

        const yearTableProps: SmartTableProps = {
            tableType: "year",
            embeddingType: this.state.embeddingType.key as string,
            hasEmbeddings: hasEmbeddings,
            tableData: {
                all: preprocessMetadata(this.state.yearsSummary, "Year"), // Use yearsSummary here
                saved: [],
                similar: [],
                similarPayload: [],
                keyword: [],
                author: [],
                source: [],
                year: [],
            },
            columnsVisible: ["Year", "Count"],
            updateVisibleColumns: (columnId) => {
                updateVisibleColumns(columnId, "year");
            },
            columnSortByValues: this.state.columnSortByValues["Count"],
            updateColumnSortByValues: (sortBy) => {
                this.updateStateProp("columnSortByValues", sortBy, "Count");
            },
            columnFilterValues: this.state.columnFilterValues["year"],
            updateColumnFilterValues: (filter) => {
                this.updateStateProp("columnFilterValues", filter, "year");
            },
            globalFilterValue: this.state.globalFilterValue["year"],
            updateGlobalFilterValue: (filter) => {
                this.updateStateProp("globalFilterValue", filter, "year");
            },
            columnFilterTypes: {
                ...this.state.columnFilterTypes, // Use the existing filter types from state
                Count: "range", // Override the Count column to be of type "range"
            },
            setFilteredPapers: (dataFiltered) => {
                this.updateStateProp("dataFiltered", dataFiltered, "year")
            },
            dataFiltered: this.state.dataFiltered["year"],
            columnWidths: this.state.columnWidths,
            tableControls: [],
            columnIds: ["Year", "Count"], // Define specific columns for Year
        };

        const sourceTableProps: SmartTableProps = {
            tableType: "source",
            embeddingType: this.state.embeddingType.key as string,
            hasEmbeddings: hasEmbeddings,
            tableData: {
                all: preprocessMetadata(this.state.sourcesSummary, "Source"), // Use sourcesSummary here
                saved: [],
                similar: [],
                similarPayload: [],
                keyword: [],
                author: [],
                source: [],
                year: [],
            },
            columnsVisible: ["Source", "Count"],
            updateVisibleColumns: (columnId) => {
                updateVisibleColumns(columnId, "source");
            },
            columnSortByValues: this.state.columnSortByValues["Count"],
            updateColumnSortByValues: (sortBy) => {
                this.updateStateProp("columnSortByValues", sortBy, "Count");
            },
            columnFilterValues: this.state.columnFilterValues["source"],
            updateColumnFilterValues: (filter) => {
                this.updateStateProp("columnFilterValues", filter, "source");
            },
            globalFilterValue: this.state.globalFilterValue["source"],
            updateGlobalFilterValue: (filter) => {
                this.updateStateProp("globalFilterValue", filter, "source");
            },
            columnFilterTypes: {
                ...this.state.columnFilterTypes, // Use the existing filter types from state
                Count: "range", // Override the Count column to be of type "range"
            },
            setFilteredPapers: (dataFiltered) => {
                this.updateStateProp("dataFiltered", dataFiltered, "source")
            },
            dataFiltered: this.state.dataFiltered["source"],
            columnWidths: this.state.columnWidths,
            tableControls: [],
            columnIds: ["Source", "Count"], // Define specific columns for Source
        };

        const authorTableProps: SmartTableProps = {
            tableType: "author",
            embeddingType: this.state.embeddingType.key as string,
            hasEmbeddings: hasEmbeddings,
            tableData: {
                all: preprocessMetadata(this.state.authorsSummary, 'Author'), // Use authorsSummary here
                saved: [],
                similar: [],
                similarPayload: [],
                keyword: [],
                author: [],
                source: [],
                year: [],
            },
            columnsVisible: ["Author", "Count"],
            updateVisibleColumns: (columnId) => {
                updateVisibleColumns(columnId, "author");
            },
            columnSortByValues: this.state.columnSortByValues["Count"],
            updateColumnSortByValues: (sortBy) => {
                this.updateStateProp("columnSortByValues", sortBy, "Count");
            },
            columnFilterValues: this.state.columnFilterValues["author"],
            updateColumnFilterValues: (filter) => {
                this.updateStateProp("columnFilterValues", filter, "author");
            },
            globalFilterValue: this.state.globalFilterValue["author"],
            updateGlobalFilterValue: (filter) => {
                this.updateStateProp("globalFilterValue", filter, "author");
            },
            columnFilterTypes: {
                ...this.state.columnFilterTypes, // Use the existing filter types from state
                Count: "range", // Override the Count column to be of type "range"
            },
            setFilteredPapers: (dataFiltered) => {
                this.updateStateProp("dataFiltered", dataFiltered, "author")
            },
            dataFiltered: this.state.dataFiltered["author"],
            columnWidths: this.state.columnWidths,
            tableControls: [],
            columnIds: ["Author", "Count"], // Define specific columns for Author
        };
        const keywordTableProps: SmartTableProps = {
            tableType: "keyword",
            embeddingType: this.state.embeddingType.key as string,
            hasEmbeddings: hasEmbeddings,
            tableData: {
                all: preprocessMetadata(this.state.keywordsSummary, 'Keyword'), // Use preprocessed metadata here
                saved: [],
                similar: [],
                similarPayload: [],
                keyword: [],
                author: [],
                source: [],
                year: [],
            },
            columnsVisible: ["Keyword", "Count"], // Ensure columns match metadata
            updateVisibleColumns: (columnId) => {
                updateVisibleColumns(columnId, "keyword");
            },
            columnSortByValues: this.state.columnSortByValues["Count"],
            // columnSortByValues:[],
            updateColumnSortByValues: (sortBy) => {
                this.updateStateProp("columnSortByValues", sortBy, "Count");
            },
            columnFilterValues: this.state.columnFilterValues["keyword"],
            updateColumnFilterValues: (filter) => {
                this.updateStateProp("columnFilterValues", filter, "keyword");
            },
            globalFilterValue: this.state.globalFilterValue["keyword"],
            updateGlobalFilterValue: (filter) => {
                this.updateStateProp("globalFilterValue", filter, "keyword");
            },
            columnFilterTypes: {
                ...this.state.columnFilterTypes, // Use the existing filter types from state
                Count: "range", // Override the Count column to be of type "range"
            },
            setFilteredPapers: (dataFiltered) => {
                this.updateStateProp("dataFiltered", dataFiltered, "keyword");
            },
            dataFiltered: this.state.dataFiltered["keyword"],
            columnWidths: this.state.columnWidths,
            tableControls: [],
            columnIds: ["Keyword", "Count"], // Define metadata columns
        };


        const addToSelectNodeIDs = (IDs, _eventOrigin) => {
            if (IDs.length == 0) {
                this.setState({
                    eventOrigin: _eventOrigin,
                    selectNodeIDs: [],
                });
            } else {
                let _selectNodeIDs = [];
                _selectNodeIDs = [...this.state.selectNodeIDs];
                IDs.forEach((id) => {
                    let _idx = _selectNodeIDs.indexOf(id);
                    if (_idx === -1) {
                        _selectNodeIDs.push(id);
                    } else {
                        _selectNodeIDs.splice(_idx, 1);
                    }
                });

                this.setState({
                    eventOrigin: _eventOrigin,
                    selectNodeIDs: _selectNodeIDs
                }, () => {
                    // Practice task: Complete explore task when user interacts with visualization
                    if (this.props.isPractice && _selectNodeIDs.length > 0) {
                        this.completePracticeTask('explore');
                    }
                });
            }
        }

        const checkoutPapers = () => {
            this.setState({spinner: true});
            let parent = this;

            const requestOptions = {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    "input_data": this.state.dataSavedID,
                    "input_type": "ID"
                })
            };
            fetch(baseUrl + 'checkoutPapers', requestOptions)
                .then(function (response) {
                    // The response is a Response instance.
                    // You parse the data into a useable format using `.json()`
                    return response.blob();
                }).then(function (blob) {

                const href = window.URL.createObjectURL(blob);
                const a = parent.state.checkoutLinkRef.current;
                a.download = 'checkedOutPapers.bibtex';
                a.href = href;
                a.click();
                a.href = '';

                parent.setState({
                    "spinner": false
                });
            });
        }


        const allPapersTableProps: SmartTableProps = {
            loadMoreData: this.loadMoreData,
            loadAllData: this.loadAllData,
            hasMoreData: this.state.hasMoreData,
            totalPaperCount: this.state.totalPaperCount,
            tableType: "all",
            embeddingType: this.state.embeddingType.key as string,
            hasEmbeddings: hasEmbeddings,
            tableData: {
                all: this.state.dataAll,
                saved: this.state.dataSaved,
                similar: this.state.dataSimilar,
                similarPayload: this.state.dataSimilarPayload,
                keyword: this.state.dataKeywords,
                author: this.state.dataAuthors,
                source: this.state.dataSources,
                year: this.state.dataYears,
            },
            columnsVisible: this.state.columnsVisible["all"],
            updateVisibleColumns: (columnId) => {
                updateVisibleColumns(columnId, "all");
            },
            columnSortByValues: this.state.columnSortByValues["all"],
            updateColumnSortByValues: (sortBy) => {
                this.updateStateProp("columnSortByValues", sortBy, "all");
            },
            columnFilterValues: this.state.columnFilterValues["all"],
            updateColumnFilterValues: (filter) => {
                const {allDataLoaded, columnFilterValues} = this.state;

                // Practice task: Check if user applied any filter (search task)
                if (this.props.isPractice && filter && filter.length > 0) {
                    this.completePracticeTask('search');
                }

                if (JSON.stringify(columnFilterValues["all"]) === JSON.stringify(filter)) {
                    return;
                }
                if (!allDataLoaded) {
                    // Only show spinner when loading from server
                    this.setState({spinner: true, loadingText: 'Loading Data...'});
                    this.setState(
                        {
                            dataAll: [],
                            offset: 0,
                            hasMoreData: true,
                        },
                        () => {
                            this.loadMoreData(); // Load more data from the server
                        }
                    );
                    // Update the column filter values
                    this.updateStateProp("columnFilterValues", filter, "all");
                } else {
                    // Client-side filtering - no spinner needed
                    // Update column filter values without resetting data or calling loadMoreData
                    this.updateStateProp("columnFilterValues", filter, "all");

                    // Apply filters locally to existing data
                    const filteredData = this.applyLocalFilters(this.state.dataAll, filter);

                    // console.log("filteredData", filteredData);
                    this.setState((prevState) => {
                        // Combine the existing IDs with the new ones, avoiding duplicates
                        const newFilteredIDs = filteredData.map((paper) => paper.ID);
                        const concatenatedFilteredIDs = Array.from(new Set([...prevState.dataFilteredID, ...newFilteredIDs]));
                        return {
                            dataFiltered: {
                                ...prevState.dataFiltered,
                                all: filteredData,
                            },
                            dataFilteredID: concatenatedFilteredIDs,
                        };
                    });
                }
            },
            globalFilterValue: this.state.globalFilterValue["all"],
            updateGlobalFilterValue: (filter) => {
                const {allDataLoaded, columnFilterValues} = this.state;

                // Practice task: Check if user used global search (search task)
                if (this.props.isPractice && filter && filter.length > 0) {
                    this.completePracticeTask('search');
                }

                if (JSON.stringify(columnFilterValues["all"]) === JSON.stringify(filter)) {
                    return;
                }
                if (!allDataLoaded) {
                    // Only show spinner when loading from server
                    this.setState({spinner: true, loadingText: 'Loading Data...'});
                    this.setState(
                        {
                            dataAll: [],
                            offset: 0,
                            hasMoreData: true,
                        },
                        () => {
                            this.loadMoreData(); // Load more data from the server
                        }
                    );
                    // Update the column filter values
                    this.updateStateProp("columnFilterValues", filter, "all");
                } else {
                    // Client-side filtering - no spinner needed
                    // Update column filter values without resetting data or calling loadMoreData
                    this.updateStateProp("columnFilterValues", filter, "all");

                    // Apply filters locally to existing data
                    const filteredData = this.applyLocalFilters(this.state.dataAll, filter);
                    // console.log("filteredData", filteredData);
                    this.setState((prevState) => ({
                        dataFiltered: {
                            ...prevState.dataFiltered,
                            all: filteredData,
                        },
                        dataFilteredID: filteredData.map((paper) => paper.ID),
                    }));
                }
            },
            columnFilterTypes: this.state.columnFilterTypes,

            setFilteredPapers: (dataFiltered) => {
                // updateKeywordCounts(dataFiltered);
                // updateAuthorCounts(dataFiltered);
                // updateSourcesCounts(dataFiltered);
                // updateYearsCounts(dataFiltered);
                // updateFilteredPaperIDs(dataFiltered);
                // this.updateStateProp("dataFiltered", dataFiltered, "all");
            },
            scrollToPaperID: this.state.scrollToPaperID,
            dataFiltered: this.state.dataFiltered["all"],
            columnWidths: this.state.columnWidths,
            tableControls: ["add", "save", "info", "locate"],
            columnIds: this.state.columns["all"],
            addToSavedPapers: addToSavedPapers,
            addToSimilarInputPapers: addToSimilarInputPapers,
            addToSelectNodeIDs: addToSelectNodeIDs,
            isInSimilarInputPapers: isInSimilarInputPapers,
            isInSavedPapers: isInSavedPapers,
            openGScholar: openGScholar,
            isInSelectedNodeIDs: isInSelectedNodeIDs,
            dataAuthors: this.state.dataAuthors,
            dataSources: this.state.dataSources,
            dataKeywords: this.state.dataKeywords,
            staticMinYear: this.state.minYear,   // Pass minYear to SmartTable
            staticMaxYear: this.state.maxYear,
            staticMinCitationCounts: this.state.minCitationCounts,   // Pass minYear to SmartTable
            staticMaxCitationCounts: this.state.maxCitationCounts,
            applyLocalFilters: this.applyLocalFilters,
        }


        const setScrollToPaperID = (_ID) => {
            this.setState({
                scrollToPaperID: _ID
            });
        }

        const deleteRows = (data, rowID) => {
            let _property = [...this.state[data]];
            if (Array.isArray(rowID)) {
                rowID.forEach((r) => {
                    _property.splice(r, 1);
                });
            } else {
                _property.splice(rowID, 1);
            }
            let obj = {};
            obj[data] = _property;
            this.setState(obj, () => {
                // Save to localStorage if we're deleting from saved papers
                if (data === 'dataSaved') {
                    try {
                        localStorage.setItem('saved_papers', JSON.stringify(_property));
                    } catch (e) {
                        console.warn('Failed to update saved papers in localStorage:', e);
                    }
                }
            });
        }

        const savedPapersTableProps: SmartTableProps = {
            tableType: "saved",
            embeddingType: this.state.embeddingType.key as string,
            hasEmbeddings: hasEmbeddings,
            tableData: {
                all: this.state.dataAll,
                saved: this.state.dataSaved,
                similar: this.state.dataSimilar,
                similarPayload: this.state.dataSimilarPayload,
                keyword: this.state.dataKeywords,
                author: this.state.dataAuthors,
                source: this.state.dataSources,
                year: this.state.dataYears,
            },
            columnsVisible: this.state.columnsVisible["saved"],
            updateVisibleColumns: (columnId) => {
                updateVisibleColumns(columnId, "saved");
            },
            columnSortByValues: this.state.columnSortByValues["saved"],
            updateColumnSortByValues: (sortBy) => {
                this.updateStateProp("columnSortByValues", sortBy, "saved");
            },
            columnFilterValues: this.state.columnFilterValues["saved"],
            updateColumnFilterValues: (filter) => {
                this.updateStateProp("columnFilterValues", filter, "saved");
            },
            globalFilterValue: this.state.globalFilterValue["saved"],
            updateGlobalFilterValue: (filter) => {
                this.updateStateProp("globalFilterValue", filter, "saved");
            },
            columnFilterTypes: this.state.columnFilterTypes,
            setFilteredPapers: (dataFiltered) => {
                this.updateStateProp("dataFiltered", dataFiltered, "saved")
            },
            dataFiltered: this.state.dataFiltered["saved"],
            columnWidths: this.state.columnWidths,
            tableControls: ["add", "delete", "info", "locate", "summarize", "literatureReview", "export"],
            columnIds: this.state.columns["saved"],
            deleteRow: (rowId) => {
                deleteRows("dataSaved", rowId);
                deleteRows("dataSavedID", rowId);
            },
            addToSimilarInputPapers: addToSimilarInputPapers,
            addToSelectNodeIDs: addToSelectNodeIDs,
            isInSimilarInputPapers: isInSimilarInputPapers,
            isInSavedPapers: isInSavedPapers,
            checkoutPapers: checkoutPapers,
            summarizePapers: summarizePapers,
            literatureReviewPapers: literatureReviewPapers,
            openGScholar: openGScholar,
            isInSelectedNodeIDs: isInSelectedNodeIDs,
        }


        const onChangeSearchTitle = (ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newText: string): void => {
            this.setState({searchTitle: newText})
        };

        const onChangeSearchAbstract = (ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newText: string): void => {
            this.setState({searchAbstract: newText})
        };

        const onChangeChatText = (ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newText: string): void => {
            this.setState({chatText: newText})
        };

        const updateYearsCounts = (papers) => {
            let _countsObj = {};
            papers.forEach((paper) => {
                if (!(paper["Year"] in _countsObj)) {
                    _countsObj[paper["Year"]] = 0;
                }
                _countsObj[paper["Year"]]++;
            });
            let _countsArr = [];
            Object.keys(_countsObj).forEach(function (key) {
                _countsArr.push({"Year": key, "YearCount": _countsObj[key]})
            });
            this.setState({
                dataYears: _countsArr
            });
        }

        const updateSourcesCounts = (papers) => {
            let _countsObj = {};
            papers.forEach((paper) => {
                if (!(paper["Source"] in _countsObj)) {
                    _countsObj[paper["Source"]] = 0;
                }
                _countsObj[paper["Source"]]++;
            });
            let _countsArr = [];
            Object.keys(_countsObj).forEach(function (key) {
                _countsArr.push({"Source": key, "SourceCount": _countsObj[key]})
            });
            this.setState({
                dataSources: _countsArr
            });
        }

        const updateAuthorCounts = (papers) => {
            let _countsObj = {};
            papers.forEach((paper) => {
                if (Array.isArray(paper["Authors"])) {
                    paper["Authors"].forEach((author) => {
                        if (!(author in _countsObj)) {
                            _countsObj[author] = 0;
                        }
                        _countsObj[author]++;
                    });
                }
            });

            let _countsArr = [];
            Object.keys(_countsObj).forEach(function (key) {
                _countsArr.push({"Author": key, "AuthorCount": _countsObj[key]})
            });
            this.setState({
                dataAuthors: _countsArr
            });
        }

        const updateKeywordCounts = (papers) => {
            let _countsObj = {};
            papers.forEach((paper) => {
                if (Array.isArray(paper["Keywords"])) {
                    paper["Keywords"].forEach((keyword) => {
                        if (!(keyword in _countsObj)) {
                            _countsObj[keyword] = 0;
                        }
                        _countsObj[keyword]++;
                    });
                }
            });

            let _countsArr = [];
            Object.keys(_countsObj).forEach(function (key) {
                _countsArr.push({"Keyword": key, "KeywordCount": _countsObj[key]})
            });
            this.setState({
                dataKeywords: _countsArr
            });
        }

        const updateVisibleColumns = (columnId, tableType) => {
            var _property = {...this.state.columnsVisible};
            const idx = _property[tableType].indexOf(columnId);
            if (idx === -1) {
                _property[tableType].push(columnId);
            } else {
                _property[tableType].splice(idx, 1);
            }
            this.setState({columnsVisible: _property});
        }

        const similarPapersTableProps: SmartTableProps = {
            tableType: "similar",
            embeddingType: this.state.embeddingType.key as string,
            hasEmbeddings: hasEmbeddings,
            tableData: {
                all: this.state.dataAll,
                saved: this.state.dataSaved,
                similar: this.state.dataSimilar,
                similarPayload: this.state.dataSimilarPayload,
                keyword: this.state.dataKeywords,
                author: this.state.dataAuthors,
                source: this.state.dataSources,
                year: this.state.dataYears,
            },
            columnsVisible: this.state.columnsVisible["similar"],
            updateVisibleColumns: (columnId) => {
                updateVisibleColumns(columnId, "similar");
            },
            columnSortByValues: this.state.columnSortByValues["similar"],
            updateColumnSortByValues: (sortBy) => {
                this.updateStateProp("columnSortByValues", sortBy, "similar");
            },
            columnFilterValues: this.state.columnFilterValues["similar"],
            updateColumnFilterValues: (filter) => {
                this.updateStateProp("columnFilterValues", filter, "similar");
            },
            globalFilterValue: this.state.globalFilterValue["similar"],
            updateGlobalFilterValue: (filter) => {
                this.updateStateProp("globalFilterValue", filter, "similar");
            },
            columnFilterTypes: this.state.columnFilterTypes,
            setFilteredPapers: (dataFiltered) => {
                this.updateStateProp("dataFiltered", dataFiltered, "similar")
            },
            dataFiltered: this.state.dataFiltered["similar"],
            columnWidths: this.state.columnWidths,
            tableControls: ["save", "add", "info", "locate"],
            columnIds: this.state.columns["similar"],
            addToSavedPapers: addToSavedPapers,
            addToSimilarInputPapers: addToSimilarInputPapers,
            addToSelectNodeIDs: addToSelectNodeIDs,
            isInSimilarInputPapers: isInSimilarInputPapers,
            isInSavedPapers: isInSavedPapers,
            openGScholar: openGScholar,
            isInSelectedNodeIDs: isInSelectedNodeIDs,
            similarMinScore: this.state.similarMinScore,
            similarMaxScore: this.state.similarMaxScore,
        }

        const similarPapersPayloadTableProps: SmartTableProps = {
            tableType: "similarPayload",
            embeddingType: this.state.embeddingType.key as string,
            hasEmbeddings: hasEmbeddings,
            tableData: {
                all: this.state.dataAll,
                saved: this.state.dataSaved,
                similar: this.state.dataSimilar,
                similarPayload: this.state.dataSimilarPayload,
                keyword: this.state.dataKeywords,
                author: this.state.dataAuthors,
                source: this.state.dataSources,
                year: this.state.dataYears,
            },
            columnsVisible: this.state.columnsVisible["similarPayload"],
            updateVisibleColumns: (columnId) => {
                updateVisibleColumns(columnId, "similarPayload");
            },
            columnSortByValues: this.state.columnSortByValues["similarPayload"],
            updateColumnSortByValues: (sortBy) => {
                this.updateStateProp("columnSortByValues", sortBy, "similarPayload");
            },
            columnFilterValues: this.state.columnFilterValues["similarPayload"],
            updateColumnFilterValues: (filter) => {
                this.updateStateProp("columnFilterValues", filter, "similarPayload");
            },
            globalFilterValue: this.state.globalFilterValue["similarPayload"],
            updateGlobalFilterValue: (filter) => {
                this.updateStateProp("globalFilterValue", filter, "similarPayload");
            },
            columnFilterTypes: this.state.columnFilterTypes,
            setFilteredPapers: (dataFiltered) => {
                this.updateStateProp("dataFiltered", dataFiltered, "similarPayload")
            },
            dataFiltered: this.state.dataFiltered["similarPayload"],
            columnWidths: this.state.columnWidths,
            tableControls: ["save", "delete", "info", "locate"],
            columnIds: this.state.columns["similarPayload"],
            deleteRow: (rowId) => {
                deleteRows("dataSimilarPayload", rowId);
                deleteRows("dataSimilarPayloadID", rowId);
            },
            addToSavedPapers: addToSavedPapers,
            addToSimilarInputPapers: addToSimilarInputPapers,
            addToSelectNodeIDs: addToSelectNodeIDs,
            isInSimilarInputPapers: isInSimilarInputPapers,
            isInSavedPapers: isInSavedPapers,
            openGScholar: openGScholar,
            isInSelectedNodeIDs: isInSelectedNodeIDs,
        }

        const dialogProps = {
            'addToSelectNodeIDs': addToSelectNodeIDs,
            'addToSimilarInputPapers': addToSimilarInputPapers,
            'addToSavedPapers': addToSavedPapers,
        }

        const _items: ICommandBarItemProps[] = [
            {
                key: 'brand',
                commandBarButtonAs: () => (
                    <div style={{color: "white"}}>
                        {/* <Text variant="xLarge">vitaLITy</Text> */}
                        <img height="30" title="VitaLITy Logo" src={logo} alt="VitaLITy Logo"/>
                    </div>
                )
            },
            {
                key: 'description',
                commandBarButtonAs: () => (
                    <div style={{color: "white", marginLeft: 16, maxWidth: 280}}>
                        <Text variant="small">VitaLITy 2: Reviewing Academic Literature using Large Language
                            Models</Text>
                    </div>
                )
            },
            // {
            //   key: 'conferencebrand',
            //   commandBarButtonAs: () => (
            //     <div style={{ color: "white" }}>
            //       <img height="30" title="IEEE VIS Logo" src={visConferenceLogo} alt="IEEE VIS Logo" />
            //     </div>
            //   )
            // },
            // {
            //   key: 'citeus',
            //   commandBarButtonAs: () => (
            //     <div style={{ color: "white", marginLeft: 16, paddingLeft: 4, paddingRight: 4 }}>
            //       <DefaultButton id={"citationBtnId"} onClick={toggleIsCiteUsCalloutVisible} text={'Cite Us!'}></DefaultButton>
            //       {this.state.isCiteUsCalloutVisible && (
            //         <Callout
            //           style={{
            //             padding: '16px 16px',
            //             width: 450
            //           }}
            //           target={`#citationBtnId`}
            //           onDismiss={toggleIsCiteUsCalloutVisible}
            //           role="status"
            //           aria-live="assertive"
            //         >
            //           <DelayedRender>
            //             <div>
            //               <Text variant="medium">
            //                 A. Narechania, A. Karduni, R. Wesslen and E. Wall, <strong>"vitaLITy: Promoting Serendipitous Discovery of Academic Literature with Transformers &amp; Visual Analytics,"</strong> <i>in IEEE Transactions on Visualization and Computer Graphics</i>, vol. 28, no. 1, pp. 486-496, Jan. 2022, doi: 10.1109/TVCG.2021.3114820.
            //               </Text>
            //               <br /><br />
            //               <DefaultButton
            //                 style={{ marginLeft: 4, marginRight: 4 }}
            //                 onClick={() => {
            //                   const citation = `@ARTICLE{9552447,  author={Narechania, Arpit and Karduni, Alireza and Wesslen, Ryan and Wall, Emily},  journal={IEEE Transactions on Visualization and Computer Graphics},   title={VITALITY: Promoting Serendipitous Discovery of Academic Literature with Transformers  amp; Visual Analytics},   year={2022},  volume={28},  number={1},  pages={486-496},  doi={10.1109/TVCG.2021.3114820}}`
            //                   navigator.clipboard.writeText(citation);
            //                 }}
            //                 text={'Copy .BibTex'}>
            //               </DefaultButton>
            //               <DefaultButton
            //                 style={{ marginLeft: 4, marginRight: 4 }}
            //                 href="https://doi.org/10.1109/TVCG.2021.3114820"
            //                 target="_blank"
            //                 text="Other formats from IEEE TVCG'21"
            //                 title="Other formats from IEEE TVCG'21"></DefaultButton>
            //               <br />
            //             </div>
            //           </DelayedRender>
            //         </Callout>
            //       )}
            //     </div>
            //   )
            // },
            // {
            //   key: 'affiliationbrands',
            //   commandBarButtonAs: () => (
            //     <div style={{ color: "white", marginLeft: 16, paddingLeft: 4, paddingRight: 4 }}>
            //       <img height="30" src={gtLogo} title="Georgia Tech Logo" alt="Georgia Tech Logo" />
            //       &nbsp;&nbsp;
            //       <img height="30" src={northwesternLogo} title="Northwestern University Logo" alt="Northwestern University Logo" />
            //       &nbsp;&nbsp;
            //       <img height="30" src={unccLogo} title="University of North Carolina Charlotte Logo" alt="University of North Carolina Charlotte Logo" />
            //       &nbsp;&nbsp;
            //       <img height="30" src={emoryLogo} title="Emory University Logo" alt="Emory University Logo" />
            //     </div>
            //   )
            // }
        ];

        const _farItems: ICommandBarItemProps[] = [
            {
                key: 'metaTableButton',
                commandBarButtonAs: () => (
                    <DefaultButton
                        id = "metaTableButton"
                        text="Metadata"
                        iconProps={{iconName: "Table"}}
                        onClick={() => {
                            const wasOpen = this.state.isMetaTableModalOpen;
                            this.setState({isMetaTableModalOpen: !this.state.isMetaTableModalOpen});
                            
                            // Meta table interaction
                            Logger.logUIInteraction({
                                component: 'App',
                                action: 'meta_table_modal_toggle',
                                elementId: 'metaTableButton',
                                value: !wasOpen,
                                modalName: 'metaTable'
                            });
                        }

                        }
                        // style={{marginLeft: 8}}
                        
                    />
                ),
            },
            {
                key: 'embedding',
                commandBarButtonAs: () => (
                    <>
                        <Dropdown
                            id="embeddingDropdownButton"
                            label=""
                            selectedKey={this.state.embeddingType.key}
                            // eslint-disable-next-line react/jsx-no-bind
                            onChange={(event: React.FormEvent<HTMLDivElement>, item: IDropdownOption) => {
                                const previousValue = this.state.embeddingType.key;
                                this.setState({embeddingType: item});

                                // Embedding type change
                                Logger.logUIInteraction({
                                    component: 'App',
                                    action: 'embedding_type_change',
                                    elementId: 'embeddingDropdownButton',
                                    value: item?.key,
                                });
                            }}
                            // disabled={true}
                            options={embeddingTypeDropdownOptions}
                            styles={{root: {zIndex: 2, paddingLeft: 4, paddingRight: 4, minWidth: 120}}}

                        />
                    </>
                )
            },
            {
                key: 'save',
                commandBarButtonAs: () => (<DefaultButton id = "savedPapersButton" iconProps={{iconName: "ClipboardList"}} style={{
                    float: "right",
                    zIndex: 99,
                    paddingLeft: 4,
                    paddingRight: 4,
                    
                    borderRadius: 8
                }}
                 text={"Saved Papers (" + this.state.dataSaved.length + ")"}
                 onClick={() => {
                     this.setState({isPanelOpen: true});
                     
                     // Saved papers panel opening
                     Logger.logUIInteraction({
                         component: 'App',
                         action: 'saved_papers_panel_open',
                         elementId: 'savedPapersButton',
                         panelName: 'savedPapers',
                         savedPapersCount: this.state.dataSaved.length
                     });
                 }}/>)
            },
        ];

        const {tabs, activeKey, dialogStates} = this.state;


        function _inputButtonRenderer(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element): JSX.Element {
            return (
                <div>
                    &nbsp;&nbsp;{defaultRenderer(link)}&nbsp;&nbsp;<Icon iconName="ArrowRight"
                                                                         style={{color: "#3498db"}}></Icon>&nbsp;&nbsp;
                </div>
            );
        }

        function _outputButtonRenderer(link: IPivotItemProps, defaultRenderer: (link: IPivotItemProps) => JSX.Element): JSX.Element {
            return (
                <div>
                    &nbsp;&nbsp;<Icon iconName="Check"
                                      style={{color: "#27ae60"}}></Icon>&nbsp;&nbsp;{defaultRenderer(link)}&nbsp;&nbsp;
                </div>
            );
        }

        const {metadataInitialized, spinner, loadingText} = this.state;
        if (!metadataInitialized) {
            return (
                <LoadingOverlay
                    active={spinner}
                    spinner
                    text={loadingText}
                    styles={{
                        wrapper: {},
                        overlay: (base) => ({...base, background: 'rgba(0, 0, 0, 0.5)'}),
                        content: (base) => ({...base, color: 'rgba(255, 255, 255, 1)'})
                    }}
                >
                    {/* You can customize this as needed */}
                    {/*<div>Loading, please wait...</div>*/}
                </LoadingOverlay>
            );
        }
        return (
            <>
                <LoadingOverlay
                    active={this.state.spinner}
                    spinner
                    text={'Loading data'}
                    styles={{
                        wrapper: {},
                        overlay: (base) => ({...base, background: 'rgba(0, 0, 0, 0.5)'}),
                        content: (base) => ({...base, color: 'rgba(255, 255, 255, 1)'})
                    }}
                >
                    <CommandBar
                        items={_items}
                        farItems={_farItems}
                        styles={{
                            root: {
                                background: "rgba(0, 0, 0, 0.39)",
                                padding: 8,
                                paddingBottom: 0,
                                marginTop: -7,
                                borderBottom: "1px solid #ededed",
                                height: 60,
                                display: 'flex',
                                alignItems: 'center',
                            },
                        }}
                    />
                    <Modal
                        styles={{
                            main: {
                                maxWidth: "600px",
                                padding: "20px",
                                borderRadius: "8px",
                            },
                        }}
                        isOpen={this.state.isMetaTableModalOpen}
                        onDismiss={() => {
                            this.setState({isMetaTableModalOpen: false});
                            
                            // Modal dismiss
                            Logger.logUIInteraction({
                                component: 'App',
                                action: 'modal_dismiss',
                                modalName: 'metaTable',
                                dismissMethod: 'overlay_click'
                            });
                        }}
                        isBlocking={false}
                    >
                        <div className="p-lg">
                            <h2 className="p-0 m-0">
                                Metadata
                                <IconButton
                                    className="float-right"
                                    iconProps={{iconName: "Times"}}
                                    ariaLabel="Close metadata modal"
                                    onClick={() => {
                                        this.setState({isMetaTableModalOpen: false});
                                        
                                        // Modal close button
                                        Logger.logUIInteraction({
                                            component: 'App',
                                            action: 'modal_close',
                                            modalName: 'metaTable',
                                            dismissMethod: 'close_button'
                                        });
                                    }}
                                />
                            </h2>
                            <div style={{marginTop: "20px"}}>
                                <Pivot linkSize={PivotLinkSize.normal} linkFormat={PivotLinkFormat.links}>
                                    <PivotItem headerText="Keywords">
                                        <div className="m-t-lg"></div>
                                        <MetaTable props={keywordTableProps}></MetaTable>
                                    </PivotItem>
                                    <PivotItem headerText="Authors">
                                        <div className="m-t-lg"></div>
                                        <MetaTable props={authorTableProps}></MetaTable>
                                    </PivotItem>
                                    <PivotItem headerText="Source">
                                        <div className="m-t-lg"></div>
                                        <MetaTable props={sourceTableProps}></MetaTable>
                                    </PivotItem>
                                    <PivotItem headerText="Year">
                                        <div className="m-t-lg"></div>
                                        <MetaTable props={yearTableProps}></MetaTable>
                                    </PivotItem>
                                </Pivot>
                            </div>
                        </div>
                    </Modal>
                    <Panel
                        headerText="Saved Papers"
                        isOpen={this.state.isPanelOpen}
                        onDismiss={() => {
                            this.setState({isPanelOpen: false});
                            
                            // Panel dismiss
                            Logger.logUIInteraction({
                                component: 'App',
                                action: 'saved_papers_panel_dismiss',
                                panelName: 'savedPapers',
                                savedPapersCount: this.state.dataSaved.length
                            });
                            // Logger.logTextEditorEvent({
                            //     component: 'App',
                            //     action: 'step_completion',
                            //     actionType: 'finish_writing',
                            //     response: this.state.notesContent,
                            //     content: this.state.notesContent,
                            //     contentLength: this.state.notesContent.length
                            // })
                        }}
                        type={PanelType.large}
                        closeButtonAriaLabel="Close"
                    >
                        <br/>
                        <a ref={this.state.checkoutLinkRef}></a>
                        <div id="savedPapersPanel">
                            <div id="savedPapersSmartTable">
                                <SmartTable props={savedPapersTableProps} setSpinner={this.setSpinner}></SmartTable>
                            </div>



                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '20px',
                                marginTop: '20px',
                                }}>
                                {/* LLM Output */}
                                <div id="savedPapersLLMOutput" style={{
                                flex: 1,
                                padding: '16px',
                                backgroundColor: '#ffffffba',
                                border: '1px solid #878686ff',
                                borderRadius: '4px',
                                fontSize: '1.25em',
                                lineHeight: '1.25em',
                                minWidth: 0, // for flexbox overflow handling
                                display: 'flex',
                                flexDirection: 'column',
                                }}>
                                <h3
                                style={{
                                    margin: '0 0 12px 0',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    color: '#323130',
                                }}
                                >
                                LLM Output
                                </h3>
                                <div style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    minHeight: '200px',
                                    maxHeight: '400px',
                                }}>
                                    <div style={{
                                        flex: 1,
                                        overflow: 'auto',
                                        border: '1px solid #d1d1d1',
                                        borderRadius: '4px',
                                        padding: '12px',
                                        backgroundColor: '#ffffff',
                                        minHeight: 300
                                    }}>
                                        <Markdown
                                            components={{
                                                // Disable hyperlinks - render as plain text
                                                a: ({node, children, ...props}) => <span>{children}</span>,
                                                // Keep bold text working
                                                strong: ({node, children, ...props}) => <strong>{children}</strong>
                                            }}
                                        >
                                            {this.formatLLMResponse(this.state.summarizeResponse)}
                                        </Markdown>
                                    </div>
                                </div>
                            </div>

                            {/* Research Notes */}
                            <div id="savedPapersResearchNotes" style={{
                                flex: 1,
                                padding: '16px',
                                backgroundColor: '#ffffffba',
                                border: '1px solid #878686ff',
                                borderRadius: '4px',
                                minWidth: 0, // for flexbox overflow handling
                                display: 'flex',
                                flexDirection: 'column',
                            }}>
                                <h3 style={{
                                    margin: '0 0 12px 0',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    color: '#323130'
                                }}>
                                Research Notes
                                </h3>
                                <div style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    minHeight: '200px',
                                    maxHeight: '400px',
                                }}>
                                    <div style={{
                                        flex: 1,
                                        overflow: 'auto',
                                        border: '1px solid #d1d1d1',
                                        borderRadius: '4px',
                                        padding: 0,
                                        backgroundColor: '#ffffff',
                                        minHeight: 300,
                                    }}>
                                        <ReactQuill
                                            value={this.state.notesContent}
                                            onChange={this.handleNotesChange}
                                            onFocus={this.handleQuillFocus}
                                            onBlur={this.handleQuillBlur}
                                            placeholder="Write your preliminary literature review here..."
                                            style={{
                                                height: '100%',
                                                flex: 1,
                                                border: 'none',
                                            }}
                                            modules={{
                                                toolbar: [
                                                    [{ 'header': [1, 2, false] }],
                                                    ['bold', 'italic', 'underline'],
                                                    ['link'],
                                                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                                ],
                                            }}
                                        />
                                    </div>
                                    {this.props.isPractice && (() => {
                                        const plainText = this.state.notesContent.replace(/<[^>]+>/g, '').trim();
                                        const charCount = plainText.length;
                                        const minChars = 10;
                                        const isComplete = charCount >= minChars;
                                        return (
                                            <div style={{
                                                marginTop: '8px',
                                                padding: '8px 12px',
                                                backgroundColor: isComplete ? '#d4edda' : '#fff3cd',
                                                border: `1px solid ${isComplete ? '#28a745' : '#ffc107'}`,
                                                borderRadius: '4px',
                                                fontSize: '13px',
                                                color: isComplete ? '#155724' : '#856404',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                <span style={{ fontWeight: 600 }}>
                                                    {isComplete ? '✓' : '⚠️'}
                                                </span>
                                                <span>
                                                    {isComplete
                                                        ? `Great! You've written ${charCount} characters.`
                                                        : `Write at least ${minChars} characters to complete the note task (${charCount}/${minChars})`
                                                    }
                                                </span>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>


                        </div>
                        </div>

                    </Panel>

                    <div className="m-t-md p-md" style={{ 
                        borderBottom: 'none', 
                        overflow: 'hidden',
                        border: 'none'
                    }}>
                        <div style={{ 
                            borderBottom: 'none',
                            border: 'none'
                        }}>
                            <SmartTable props={allPapersTableProps} setSpinner={this.setSpinner}></SmartTable>
                        </div>
                    </div>
                    <Split
                        sizes={[33, 39, 28]}
                        direction="horizontal"
                        expandToMin={false}
                        gutterSize={0}
                        gutterAlign="center"
                        cursor="col-resize"
                    >
                        <div className="split p-md p-b-0" id="similaritySearchPanel" >
                            <Stack horizontal horizontalAlign="space-between" verticalAlign="center"
                                   tokens={{childrenGap: 8}}>
                                <Label style={{fontSize: "1.2rem"}}>Similarity Search</Label>
                            </Stack>
                            <div className="similarityPanelPivot">
                                <Pivot linkSize={PivotLinkSize.normal} linkFormat={PivotLinkFormat.links}
                                       selectedKey={String(this.state.similarityPanelSelectedKey)}
                                       onLinkClick={(pivotItem: PivotItem) => this.setState({similarityPanelSelectedKey: pivotItem["key"].split(".")[1]})}>
                                    <PivotItem onRenderItemLink={_inputButtonRenderer} headerText={"By Papers"}
                                               itemCount={this.state.dataSimilarPayload.length}>
                                        <div className="m-t-lg"></div>
                                        <React.Fragment>
                                            <Stack horizontal verticalAlign="center" horizontalAlign="start" wrap={false}
                                                   tokens={{childrenGap: 6}} styles={{root: {flexWrap: 'nowrap'}}}>
                                                <Label styles={{root: {minWidth: 'auto'}}}>Dimensions</Label>
                                                <Dropdown
                                                    label=""
                                                    selectedKey={this.state.similarityType.key}
                                                    // eslint-disable-next-line react/jsx-no-bind
                                                    onChange={(event: React.FormEvent<HTMLDivElement>, item: IDropdownOption) => {
                                                        this.setState({similarityType: item})
                                                    }}
                                                    options={similarityTypeDropdownOptions}
                                                    styles={{root: {zIndex: 2, minWidth: 80}}}
                                                />
                                                <Label styles={{root: {minWidth: 'auto'}}}>Count</Label>
                                                <Dropdown
                                                    label=""
                                                    selectedKey={this.state.maxSimilarPapers.key}
                                                    // eslint-disable-next-line react/jsx-no-bind
                                                    onChange={(event: React.FormEvent<HTMLDivElement>, item: IDropdownOption) => {
                                                        this.setState({maxSimilarPapers: item})
                                                    }}
                                                    options={maxSimilarPapersDropdownOptions}
                                                    styles={{root: {minWidth: 90}}}
                                                />
                                                {
                                                    this.state.dataSimilarPayload.length > 0 ?
                                                        <PrimaryButton text="Find Similar Papers"
                                                                       onClick={getSimilarPapers} allowDisabledFocus
                                                                       styles={{root: {minWidth: 'auto'}}}/> :
                                                        <PrimaryButton text="Find Similar Papers"
                                                                       onClick={getSimilarPapers} allowDisabledFocus
                                                                       disabled styles={{root: {minWidth: 'auto'}}}/>
                                                }
                                            </Stack>
                                        </React.Fragment>
                                        <div className="m-t-md"></div>
                                        <SmartTable props={similarPapersPayloadTableProps}
                                                    setSpinner={this.setSpinner}></SmartTable>
                                    </PivotItem>
                                    <PivotItem onRenderItemLink={_inputButtonRenderer} headerText="By Abstract">
                                        <div className="m-t-lg"></div>
                                        <Stack horizontal tokens={{childrenGap: 8}}>
                                            <Label>Count</Label>
                                            <Dropdown
                                                label=""
                                                selectedKey={this.state.searchByAbstractLimit.key}
                                                // eslint-disable-next-line react/jsx-no-bind
                                                onChange={(event: React.FormEvent<HTMLDivElement>, item: IDropdownOption) => {
                                                    this.setState({searchByAbstractLimit: item})
                                                }}
                                                options={maxSimilarPapersDropdownOptions}
                                                styles={{root: {minWidth: 90}}}
                                            />
                                            <PrimaryButton style={{zIndex: 2}} text="Find Similar Papers"
                                                           onClick={getSimilarPapersByAbstract} allowDisabledFocus
                                                           disabled={(!this.state.searchAbstract || this.state.searchAbstract.trim().length === 0) && (!this.state.searchTitle || this.state.searchTitle.trim().length === 0)}/>
                                        </Stack>
                                        <div className="m-t-md"></div>
                                        {/* Do not show title when switch to 'ada' embedding */}
                                        {this.state.embeddingType.key == 'ada' ||
                                            <TextField value={this.state.searchTitle || ''}
                                                       placeholder="Enter your own title here"
                                                       onChange={onChangeSearchTitle} defaultValue={""}/>}
                                        <div className="m-t-md"></div>
                                        <TextField value={this.state.searchAbstract || ''}
                                                   placeholder="Enter your own abstract here" multiline rows={15}
                                                   onChange={onChangeSearchAbstract} defaultValue={""}/>
                                        <div className="m-t-md"></div>
                                    </PivotItem>
                                    <PivotItem onRenderItemLink={_outputButtonRenderer} headerText={"Output Similar"}
                                               itemCount={this.state.dataSimilar.length}>
                                        <div className="m-t-lg"></div>
                                        <SmartTable props={similarPapersTableProps}
                                                    setSpinner={this.setSpinner}></SmartTable>
                                    </PivotItem>
                                </Pivot>
                            </div>
                        </div>
                        <div className="split p-md p-b-0">
                            {this.state.dataFiltered["all"].length > 0 && this.state.dataAll.length > 0
                                ?
                                <PaperScatter props={
                                    {
                                        setScrollToPaperID: setScrollToPaperID,
                                        addToSavedPapers: addToSavedPapers,
                                        addToSimilarInputPapers: addToSimilarInputPapers,
                                        isInSavedPapers: isInSavedPapers,
                                        isInSimilarInputPapers: isInSimilarInputPapers,
                                        isInFilteredPapers: isInFilteredPapers,
                                        isInSimilarPapers: isInSimilarPapers,
                                        dataFiltered: this.state.dataFiltered["all"],
                                        dataSaved: this.state.dataSaved,
                                        dataSimilarPayload: this.state.dataSimilarPayload,
                                        dataSimilar: this.state.dataSimilar,
                                        // data: this.state.dataAll,
                                        data: this.state.pointsAll,
                                        selectNodeIDs: this.state.selectNodeIDs,
                                        addToSelectNodeIDs: addToSelectNodeIDs,
                                        embeddingType: this.state.embeddingType.key as string,
                                        openGScholar: openGScholar,
                                        eventOrigin: this.state.eventOrigin,
                                    }
                                }
                                ></PaperScatter>
                                : null
                            }
                        </div>
                        {/*<div className="split p-md p-b-0">*/}
                        {/*    <Stack horizontal horizontalAlign="space-between" verticalAlign="center"*/}
                        {/*           tokens={{childrenGap: 8}}>*/}
                        {/*        <Label style={{fontSize: "1.2rem"}}>Meta</Label>*/}
                        {/*    </Stack>*/}
                        {/*    <Pivot linkSize={PivotLinkSize.normal} linkFormat={PivotLinkFormat.links}>*/}
                        {/*        <PivotItem headerText={"Keywords"}>*/}
                        {/*            <div className="m-t-lg"></div>*/}
                        {/*            <SmartTable props={keywordTableProps}></SmartTable>*/}
                        {/*        </PivotItem>*/}
                        {/*        <PivotItem headerText={"Authors"}>*/}
                        {/*            <div className="m-t-lg"></div>*/}
                        {/*            <SmartTable props={authorTableProps}></SmartTable>*/}
                        {/*        </PivotItem>*/}
                        {/*        <PivotItem headerText={"Source"}>*/}
                        {/*            <div className="m-t-lg"></div>*/}
                        {/*            <SmartTable props={sourceTableProps}></SmartTable>*/}
                        {/*        </PivotItem>*/}
                        {/*        <PivotItem headerText={"Year"}>*/}
                        {/*            <div className="m-t-lg"></div>*/}
                        {/*            <SmartTable props={yearTableProps}></SmartTable>*/}
                        {/*        </PivotItem>*/}
                        {/*    </Pivot>*/}
                        {/*</div>*/}
                        <div id = "chatWindowsPanel" className="split p-md p-b-0" >
                            <div>
                                <label style={{fontSize: "1.2rem"}}>Chat Windows</label>
                            </div>
                            <Nav variant="tabs" activeKey={activeKey} onSelect={(k) => this.setActiveKey(k)}>
                                {tabs.map((tab) => (
                                    <Nav.Item key={tab.id}>
                                        <Nav.Link
                                            eventKey={tab.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                paddingRight: '8px'
                                            }}
                                        >
                                            <span>{tab.title}</span>
                                            <Button
                                                variant="link"
                                                className="p-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    this.removeTab(tab.id);
                                                }}
                                                aria-label="Close tab"
                                                style={{
                                                    minWidth: 'auto',
                                                    padding: '0 4px',
                                                    marginLeft: '0'
                                                }}
                                            >
                                                <FontAwesomeIcon
                                                    icon={faTimes}
                                                    style={{
                                                        color: "grey",
                                                        fontSize: "0.9rem"
                                                    }}
                                                />
                                            </Button>
                                        </Nav.Link>
                                    </Nav.Item>
                                ))}
                                {/* Add button next to the last tab */}
                                <Nav.Item>
                                    <Button
                                        variant="link"
                                        className="add-button"
                                        onClick={this.addNewTab}
                                        aria-label="Add new tab"
                                    >
                                        {/* Larger "+" sign */}
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="28px"
                                            height="28px"
                                            viewBox="0 0 24 24"
                                            className="add-icon"
                                        >
                                            <line x1="6" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                            <line x1="12" y1="6" x2="12" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                        </svg>
                                    </Button>
                                </Nav.Item>
                            </Nav>
                            {/*<div className="tab-content mt-3">*/}
                            <div className="dialog-container">
                                {tabs.map((tab) => (
                                    <Tab.Content key={tab.id}>
                                        {activeKey === tab.id && (
                                            <div className="dialog-content">
                                                <Dialog
                                                    props={{
                                                        ...dialogStates[tab.id],
                                                        updateDialogState: (updatedState) =>
                                                            this.updateDialogState(tab.id, updatedState),
                                                        addToSelectNodeIDs: addToSelectNodeIDs,
                                                        addToSimilarInputPapers: addToSimilarInputPapers,
                                                        addToSavedPapers: addToSavedPapers,
                                                        isInSimilarInputPapers: isInSimilarInputPapers,
                                                        isInSavedPapers: isInSavedPapers,
                                                        isInSelectedNodeIDs: isInSelectedNodeIDs,
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </Tab.Content>
                                ))}
                            </div>

                            {/*</div>*/}
                        </div>
                    </Split>
                    {/*<div className="split p-md p-b-0">*/}
                    {/*    <Stack horizontal horizontalAlign="space-between" verticalAlign="center"*/}
                    {/*           tokens={{childrenGap: 8}}>*/}
                    {/*        <Label style={{fontSize: "1.2rem"}}>Meta</Label>*/}
                    {/*    </Stack>*/}
                    {/*    <Pivot linkSize={PivotLinkSize.normal} linkFormat={PivotLinkFormat.links}>*/}
                    {/*        <PivotItem headerText={"Keywords"}>*/}
                    {/*            <div className="m-t-lg"></div>*/}
                    {/*            <MetaTable props={keywordTableProps}></MetaTable>*/}
                    {/*        </PivotItem>*/}
                    {/*        <PivotItem headerText={"Authors"}>*/}
                    {/*            <div className="m-t-lg"></div>*/}
                    {/*            <MetaTable props={authorTableProps}></MetaTable>*/}
                    {/*        </PivotItem>*/}
                    {/*        <PivotItem headerText={"Source"}>*/}
                    {/*            <div className="m-t-lg"></div>*/}
                    {/*            <MetaTable props={sourceTableProps}></MetaTable>*/}
                    {/*        </PivotItem>*/}
                    {/*        <PivotItem headerText={"Year"}>*/}
                    {/*            <div className="m-t-lg"></div>*/}
                    {/*            <MetaTable props={yearTableProps}></MetaTable>*/}
                    {/*        </PivotItem>*/}
                    {/*    </Pivot>*/}
                    {/*</div>*/}


                </LoadingOverlay>
            </>
        );
    }
}

// export default hot(module)(App);
export default App