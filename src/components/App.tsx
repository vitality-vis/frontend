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
    faRocket,
    faFilter
} from '@fortawesome/free-solid-svg-icons';
import {
    Callout,
    DirectionalHint,
    DefaultButton,
    DelayedRender,
    Dropdown,
    Icon,
    IconButton,
    IDropdownOption,
    IPivotItemProps,
    Label,
    Modal,
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
import LiteratureReviewPanel from "./LiteratureReviewPanel";
import ResultPaperExplore from "./ResultPaperExplore";
import MultiFunctionSearchBar, {MainWorkspaceTool} from "./MultiFunctionSearchBar";
import {CorpusResultsList, PaperRow} from "./CorpusResultsList";
import {
    CorpusResultsFilterState,
    emptyCorpusResultsFilter,
    hasActiveCorpusResultsFilters,
    filterCorpusResultsByFacets,
} from "./corpusFilter";
import {SimilarityByAbstractPanel} from "./SimilarityByAbstractPanel";
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
import {Dialog, getPaperById} from "./Dialog";
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
    /** Main workspace panels: hidden via header X; pills open and move panel to top of stack */
    similarityWorkspaceOpen: boolean;
    visualizationWorkspaceOpen: boolean;
    /** Top-to-bottom render order among open panels (first opened on top; later opens append below) */
    workspacePanelOrder: MainWorkspaceTool[];
    /** Chat sidebar visibility; toggled by the Chat pill; state persists when hidden */
    chatSidebarOpen: boolean;
    /** Text in the multifunction corpus search bar */
    corpusSearchInput: string;
    /** Selected paper in the master results list (Litmaps-style) */
    selectedPaperId: number | null;
    /** Results paper info modal (same content style as chat paper info modal). */
    isResultPaperModalOpen: boolean;
    resultPaperInfo: any | null;
    loadingResultPaperInfo: boolean;
    /** "explore" = Litmaps-style full read; "summary" = compact metadata + actions (info icon). */
    resultPaperViewMode: "explore" | "summary";
    /** Full filtered results list — used for Previous / Next in the paper modal. */
    resultPaperNavList: PaperRow[];
    resultPaperNavIndex: number;
    /** Results sidebar: shown after user applies corpus search (Enter / Search); hidden until then or via header X */
    resultsPanelOpen: boolean;
    /** One-shot queue so Results "Ask" adds the paper to the active chat tab (see Dialog.toggleQuestionPaper) */
    corpusAskQueue: { id: number; title: string; token: number } | null;
    /** One-shot queue so the Literature Review panel "Ask" adds the paper to its dedicated chat. */
    litReviewAskQueue: { id: number; title: string; token: number } | null;
    /** Slide-over panel to set year / citation / venue filters on Results */
    resultsFilterPanelOpen: boolean;
    corpusResultsFilter: CorpusResultsFilterState;
    corpusResultsFilterDraft: CorpusResultsFilterState;
    /** Litmaps-style full paper read shown inside the Results column (not a centered modal). */
    resultsExploreInline: boolean;
    /** Per-paper inline highlight operations for result explore text. */
    resultHighlightOpsByPaper: { [paperId: number]: ResultHighlightOp[] };
    /** Loading state scoped to the Results window (corpus search bar), not the whole screen. */
    resultsLoading: boolean;
    /** Inline explore reading view open inside the Literature Review panel (column 1). */
    litReviewExploreOpen: boolean;
    /** LIFO stack of deleted saved papers (with original index) so each delete can be undone step by step. */
    deletedSavedPaperUndoStack: Array<{ paper: PaperRow; index: number }>;
    /** Dedicated explore state for the Literature Review panel (kept separate from the
     * main Results column so closing the panel never disturbs the main column). */
    litReviewPaperInfo: PaperRow | null;
    litReviewLoadingPaperInfo: boolean;
    litReviewNavList: PaperRow[];
    litReviewNavIndex: number;
}

interface ResultHighlightOp {
    field: "title" | "year" | "abstract" | "keywords";
    start: number;
    end: number;
    text: string;
    createdAt: number;
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

/** Stack top-to-bottom: first opened stays on top; each newly opened tool is appended below. */
const appendWorkspacePanelToOrder = (
    order: MainWorkspaceTool[],
    openedTool: MainWorkspaceTool,
    similarityOpen: boolean,
    visualizationOpen: boolean
): MainWorkspaceTool[] => {
    const kept = order.filter(
        (k) =>
            (k === "similarity" && similarityOpen) ||
            (k === "visualization" && visualizationOpen)
    );
    const withoutOpened = kept.filter((k) => k !== openedTool);
    const openedIsVisible =
        (openedTool === "similarity" && similarityOpen) ||
        (openedTool === "visualization" && visualizationOpen);
    return openedIsVisible ? [...withoutOpened, openedTool] : withoutOpened;
};

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
    /** Anchor for the Results filter popover (Callout). */
    resultsFilterButtonRef = React.createRef<HTMLButtonElement>();
    /** Results sidebar column — used to constrain the filter Callout so it stays in-column (Litmaps-style). */
    resultsSidebarRef = React.createRef<HTMLElement>();
    /** Inline results explore content container (for text selection highlight). */
    resultsExploreContentRef = React.createRef<HTMLDivElement>();

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
                },
                'litReview': {
                    chatText: '',
                    chatHistory: [],
                    chatResponse: '',
                    chatSelectedPaper: '',
                    displayMessages: [],
                    chatSessionId: `chat_${Date.now()}_litReview`  // Independent chat for the Literature Review panel
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
            similarityWorkspaceOpen: false,
            visualizationWorkspaceOpen: true,
            workspacePanelOrder: ["visualization"],
            chatSidebarOpen: false,
            corpusAskQueue: null,
            litReviewAskQueue: null,
            corpusSearchInput: "",
            selectedPaperId: null,
            isResultPaperModalOpen: false,
            resultPaperInfo: null,
            loadingResultPaperInfo: false,
            resultPaperViewMode: "summary",
            resultPaperNavList: [],
            resultPaperNavIndex: 0,
            resultsPanelOpen: false,
            resultsFilterPanelOpen: false,
            corpusResultsFilter: emptyCorpusResultsFilter(),
            corpusResultsFilterDraft: emptyCorpusResultsFilter(),
            resultsExploreInline: false,
            resultHighlightOpsByPaper: {},
            resultsLoading: false,
            litReviewExploreOpen: false,
            deletedSavedPaperUndoStack: [],
            litReviewPaperInfo: null,
            litReviewLoadingPaperInfo: false,
            litReviewNavList: [],
            litReviewNavIndex: 0,
        }
        this.setSpinner = this.setSpinner.bind(this);
    }

    /** Filter loaded papers by the corpus search bar (client-side; Enter to apply). */
    applyCorpusSearchFromBar = () => {
        const q = this.state.corpusSearchInput.trim();
        if (this.props.isPractice && q.length > 0) {
            this.completePracticeTask("search");
        }
        if (!q) {
            this.setState((prev) => ({
                dataFiltered: {
                    ...prev.dataFiltered,
                    all: [],
                },
                dataFilteredID: [],
                selectedPaperId: null,
                corpusResultsFilter: emptyCorpusResultsFilter(),
                corpusResultsFilterDraft: emptyCorpusResultsFilter(),
            }));
            Logger.logUIInteraction({
                component: "App",
                action: "corpus_search_bar_submit",
                queryLength: 0,
                resultCount: 0,
            });
            return;
        }

        this.setState({ resultsLoading: true });
        fetch(baseUrl + "searchCorpus", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: q, offset: 0, limit: 2000 }),
        })
            .then((response) => response.json())
            .then((payload) => {
                const filtered = payload?.papers || [];
                const totalFromServer = payload?.total ?? filtered.length;
                this.setState((prev) => {
                    const ids = new Set(filtered.map((p: { ID: number }) => p.ID));
                    const sel = prev.selectedPaperId;
                    return {
                        dataFiltered: {
                            ...prev.dataFiltered,
                            all: filtered,
                        },
                        dataFilteredID: filtered.map((p: { ID: number }) => p.ID),
                        selectedPaperId: sel != null && !ids.has(sel) ? null : sel,
                        totalPaperCount: totalFromServer,
                        resultsLoading: false,
                        corpusResultsFilter: emptyCorpusResultsFilter(),
                        corpusResultsFilterDraft: emptyCorpusResultsFilter(),
                    };
                });
                Logger.logUIInteraction({
                    component: "App",
                    action: "corpus_search_bar_submit",
                    queryLength: q.length,
                    resultCount: filtered.length,
                });
            })
            .catch((err) => {
                console.error("Corpus search failed:", err);
                this.setState({ resultsLoading: false });
            });
    };

    clearCorpusSearchFromBar = () => {
        this.setState((prev) => ({
            corpusSearchInput: "",
            resultsPanelOpen: false,
            dataFiltered: {
                ...prev.dataFiltered,
                all: [],
            },
            dataFilteredID: [],
            selectedPaperId: null,
            corpusResultsFilter: emptyCorpusResultsFilter(),
            corpusResultsFilterDraft: emptyCorpusResultsFilter(),
            resultsFilterPanelOpen: false,
            resultsExploreInline: false,
        }), () => {
            this.requestSplitRelayout();
        });
    };

    getFilteredCorpusSearchPapers = (): PaperRow[] => {
        return filterCorpusResultsByFacets(
            this.state.dataFiltered["all"] || [],
            this.state.corpusResultsFilter
        );
    };

    toggleResultsFilterPanel = () => {
        this.setState((prev) => {
            const nextOpen = !prev.resultsFilterPanelOpen;
            return {
                resultsFilterPanelOpen: nextOpen,
                corpusResultsFilterDraft: nextOpen
                    ? { ...prev.corpusResultsFilter }
                    : prev.corpusResultsFilterDraft,
            };
        });
    };

    applyCorpusResultsFilters = () => {
        this.setState((prev) => {
            const nextFilter = { ...prev.corpusResultsFilterDraft };
            const filtered = filterCorpusResultsByFacets(
                prev.dataFiltered["all"] || [],
                nextFilter
            );
            const ids = new Set(filtered.map((p) => p.ID));
            const sel = prev.selectedPaperId;
            return {
                corpusResultsFilter: nextFilter,
                resultsFilterPanelOpen: false,
                selectedPaperId: sel != null && !ids.has(sel) ? null : sel,
            };
        });
    };

    clearCorpusResultsFilters = () => {
        this.setState((prev) => {
            const all = prev.dataFiltered["all"] || [];
            const ids = new Set(all.map((p: { ID: number }) => p.ID));
            const sel = prev.selectedPaperId;
            return {
                corpusResultsFilter: emptyCorpusResultsFilter(),
                corpusResultsFilterDraft: emptyCorpusResultsFilter(),
                resultsFilterPanelOpen: false,
                selectedPaperId: sel != null && !ids.has(sel) ? null : sel,
            };
        });
    };

    /** Summarize a single saved paper into the Studio "LLM Output" (Literature Review panel). */
    summarizeSinglePaper = (paper: PaperRow) => {
        const prompt = `You are a scholar expert in the field of data visualization. \
Now, I'm giving you relevant information about a paper. \
Could you please help me summarize the content of this paper? \
The requirement is to provide a detailed summary and also to expand upon it as appropriate.`;
        Logger.logLLMInteraction({
            component: "App",
            action: "summarize_single_paper_start",
            query: prompt,
            paperCount: 1,
            paperIds: [paper.ID],
        });
        this.setState({ summarizeResponse: "SUMMARIZING ... ..." });
        const startTime = Date.now();
        fetch(`${baseUrl}summarize`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: [paper.ID], prompt }),
        })
            .then((response) => {
                const reader = response.body.getReader();
                const decoder = new TextDecoder("utf-8");
                let partial = "";
                this.setState({ summarizeResponse: "" });
                const readChunk = ({ done, value }: { done: boolean; value?: Uint8Array }) => {
                    if (done) {
                        if (partial) {
                            this.setState({ summarizeResponse: `${partial}` });
                        }
                        Logger.logLLMInteraction({
                            component: "App",
                            action: "summarize_single_paper_complete",
                            responseLength: partial?.length || 0,
                            duration: Date.now() - startTime,
                            paperCount: 1,
                        });
                        return;
                    }
                    partial += decoder.decode(value);
                    this.setState({ summarizeResponse: `${partial}` });
                    reader.read().then(readChunk);
                };
                reader.read().then(readChunk);
            })
            .catch((err) => {
                console.error("Single-paper summarize failed:", err);
                this.setState({ summarizeResponse: "Failed to summarize this paper." });
            });
    };

    /** Open the inline explore reading view inside the Literature Review panel (column 1). */
    openLitReviewExplore = (paper: PaperRow, navList: PaperRow[]) => {
        const idx = navList.findIndex((p) => p.ID === paper.ID);
        const index = idx >= 0 ? idx : 0;
        const target = navList[index] ?? paper;
        this.setState(
            {
                litReviewExploreOpen: true,
                litReviewNavList: navList,
                litReviewNavIndex: index,
                litReviewLoadingPaperInfo: true,
                litReviewPaperInfo: null,
            },
            () => {
                void this.loadLitReviewPaperById(target.ID);
            }
        );
        Logger.logUIInteraction({
            component: "App",
            action: "lit_review_paper_explore_open",
            paperId: target.ID,
            paperTitle: target.Title,
        });
    };

    closeLitReviewExplore = () => {
        this.setState({
            litReviewExploreOpen: false,
            litReviewPaperInfo: null,
            litReviewLoadingPaperInfo: false,
            litReviewNavList: [],
            litReviewNavIndex: 0,
        });
    };

    /** Load a paper into the Literature Review panel's dedicated explore state. */
    loadLitReviewPaperById = async (paperId: number) => {
        this.setState({ litReviewLoadingPaperInfo: true, litReviewPaperInfo: null });
        try {
            const fromAll = (this.state.dataFiltered["all"] || []).find(
                (r: { ID: number }) => r.ID === paperId
            );
            const fromNav = this.state.litReviewNavList.find((p) => p.ID === paperId);
            const row = fromAll || fromNav;
            const fetched = await getPaperById(String(paperId));
            this.setState({
                litReviewPaperInfo: fetched || row,
                litReviewLoadingPaperInfo: false,
            });
        } catch (e) {
            console.error("Failed to fetch lit-review paper info:", e);
            const fallback =
                this.state.litReviewNavList.find((p) => p.ID === paperId) || null;
            this.setState({
                litReviewPaperInfo: fallback,
                litReviewLoadingPaperInfo: false,
            });
        }
    };

    /** Previous / Next within the Literature Review panel's explore view. */
    goLitReviewNav = (delta: number) => {
        this.setState(
            (prev) => {
                const list = prev.litReviewNavList;
                if (!list.length) {
                    return null;
                }
                const nextIndex = Math.max(
                    0,
                    Math.min(list.length - 1, prev.litReviewNavIndex + delta)
                );
                if (nextIndex === prev.litReviewNavIndex) {
                    return null;
                }
                return {
                    litReviewNavIndex: nextIndex,
                    litReviewLoadingPaperInfo: true,
                    litReviewPaperInfo: null,
                };
            },
            () => {
                const id =
                    this.state.litReviewNavList[this.state.litReviewNavIndex]?.ID;
                if (id != null) {
                    void this.loadLitReviewPaperById(id);
                }
            }
        );
    };

    /** Remove a paper from the saved list (by ID) and persist to localStorage.
     * Keeps a snapshot (with its original position) so the deletion can be undone. */
    removeSavedPaper = (paper: PaperRow) => {
        const prevSaved = this.state.dataSaved || [];
        const removedIndex = prevSaved.findIndex(
            (p: { ID: number }) => p.ID === paper.ID
        );
        const removedPaper = removedIndex >= 0 ? prevSaved[removedIndex] : paper;
        this.setState(
            (prev) => {
                const nextSaved = (prev.dataSaved || []).filter(
                    (p: { ID: number }) => p.ID !== paper.ID
                );
                const nextSavedID = (prev.dataSavedID || []).filter(
                    (id: number) => id !== paper.ID
                );
                return {
                    dataSaved: nextSaved,
                    dataSavedID: nextSavedID,
                    deletedSavedPaperUndoStack: [
                        ...(prev.deletedSavedPaperUndoStack || []),
                        {
                            paper: removedPaper,
                            index: removedIndex >= 0 ? removedIndex : prevSaved.length,
                        },
                    ],
                };
            },
            () => {
                try {
                    sessionStorage.setItem(
                        "saved_papers",
                        JSON.stringify(this.state.dataSaved)
                    );
                } catch (e) {
                    console.warn("Failed to update saved papers in localStorage:", e);
                }
                Logger.logUIInteraction({
                    component: "App",
                    action: "saved_paper_delete",
                    paperId: paper.ID,
                });
            }
        );
    };

    /** Restore the most recently deleted saved paper (Undo). Each click pops one step off
     * the stack, so undoing N times after N deletions returns to the initial state. */
    undoRemoveSavedPaper = () => {
        const stack = this.state.deletedSavedPaperUndoStack || [];
        if (!stack.length) {
            return;
        }
        const undo = stack[stack.length - 1];
        this.setState(
            (prev) => {
                const saved = [...(prev.dataSaved || [])];
                // Don't duplicate if it somehow got re-added in the meantime.
                const alreadyPresent = saved.some(
                    (p: { ID: number }) => p.ID === undo.paper.ID
                );
                if (!alreadyPresent) {
                    const insertAt = Math.max(0, Math.min(undo.index, saved.length));
                    saved.splice(insertAt, 0, undo.paper);
                }
                return {
                    dataSaved: saved,
                    dataSavedID: saved.map((p: any) => p.ID),
                    deletedSavedPaperUndoStack: (
                        prev.deletedSavedPaperUndoStack || []
                    ).slice(0, -1),
                };
            },
            () => {
                try {
                    sessionStorage.setItem(
                        "saved_papers",
                        JSON.stringify(this.state.dataSaved)
                    );
                } catch (e) {
                    console.warn("Failed to restore saved paper in storage:", e);
                }
                Logger.logUIInteraction({
                    component: "App",
                    action: "saved_paper_delete_undo",
                    paperId: undo.paper.ID,
                });
            }
        );
    };

    closeResultPaperModal = () => {
        this.setState({
            isResultPaperModalOpen: false,
            resultPaperNavList: [],
            resultPaperNavIndex: 0,
        });
    };

    /** Leave inline explore view and return to the results list (Results column). */
    closeResultPaperExplore = () => {
        this.setState(
            {
                resultsExploreInline: false,
                resultPaperNavList: [],
                resultPaperNavIndex: 0,
                resultPaperInfo: null,
                loadingResultPaperInfo: false,
            },
            () => this.requestSplitRelayout()
        );
    };

    getResultHighlightOps = (paperId: number): ResultHighlightOp[] => {
        return this.state.resultHighlightOpsByPaper[paperId] || [];
    };

    getResultHighlightOpsForField = (
        paperId: number,
        field: ResultHighlightOp["field"]
    ): ResultHighlightOp[] => {
        return this.getResultHighlightOps(paperId).filter((op) => op.field === field);
    };

    getSelectionOffsetsInContainer = (
        container: HTMLElement
    ): { field: ResultHighlightOp["field"]; start: number; end: number; text: string } | null => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            return null;
        }
        const range = selection.getRangeAt(0);
        if (range.collapsed) {
            return null;
        }
        if (!container.contains(range.commonAncestorContainer)) {
            return null;
        }
        const selectedText = range.toString();
        if (!selectedText.trim()) {
            return null;
        }
        const startElement =
            range.startContainer.nodeType === Node.ELEMENT_NODE
                ? (range.startContainer as Element)
                : range.startContainer.parentElement;
        const endElement =
            range.endContainer.nodeType === Node.ELEMENT_NODE
                ? (range.endContainer as Element)
                : range.endContainer.parentElement;
        const startFieldEl = startElement?.closest("[data-highlight-field]");
        const endFieldEl = endElement?.closest("[data-highlight-field]");
        if (!startFieldEl || !endFieldEl || startFieldEl !== endFieldEl) {
            return null;
        }
        const field = startFieldEl.getAttribute("data-highlight-field") as ResultHighlightOp["field"] | null;
        if (
            field !== "title" &&
            field !== "year" &&
            field !== "abstract" &&
            field !== "keywords"
        ) {
            return null;
        }
        const preRange = range.cloneRange();
        preRange.selectNodeContents(startFieldEl);
        preRange.setEnd(range.startContainer, range.startOffset);
        const start = preRange.toString().length;
        const end = start + selectedText.length;
        return { field, start, end, text: selectedText };
    };

    renderHighlightedText = (
        text: string,
        ops: ResultHighlightOp[]
    ): React.ReactNode => {
        if (!text) {
            return "N/A";
        }
        if (!ops.length) {
            return text;
        }

        const len = text.length;
        const diff = new Array(len + 1).fill(0);
        ops.forEach((op) => {
            const s = Math.max(0, Math.min(len, Math.floor(op.start)));
            const e = Math.max(s, Math.min(len, Math.floor(op.end)));
            if (e > s) {
                diff[s] += 1;
                diff[e] -= 1;
            }
        });

        const nodes: React.ReactNode[] = [];
        let running = 0;
        let segmentStart = 0;
        let previousHighlighted = false;
        for (let i = 0; i < len; i++) {
            running += diff[i];
            const isHighlighted = running > 0;
            if (i === 0) {
                previousHighlighted = isHighlighted;
            } else if (isHighlighted !== previousHighlighted) {
                const chunk = text.slice(segmentStart, i);
                if (chunk) {
                    nodes.push(
                        previousHighlighted ? (
                            <span
                                key={`hl-${segmentStart}-${i}`}
                                className="result-paper-highlight"
                            >
                                {chunk}
                            </span>
                        ) : (
                            <React.Fragment key={`txt-${segmentStart}-${i}`}>
                                {chunk}
                            </React.Fragment>
                        )
                    );
                }
                segmentStart = i;
                previousHighlighted = isHighlighted;
            }
        }
        const tail = text.slice(segmentStart);
        if (tail) {
            nodes.push(
                previousHighlighted ? (
                    <span
                        key={`hl-${segmentStart}-${len}`}
                        className="result-paper-highlight"
                    >
                        {tail}
                    </span>
                ) : (
                    <React.Fragment key={`txt-${segmentStart}-${len}`}>
                        {tail}
                    </React.Fragment>
                )
            );
        }
        return nodes;
    };

    /** The paper currently shown in whichever explore view is active (panel or main column). */
    getActiveExplorePaper = (): PaperRow | null => {
        return this.state.litReviewExploreOpen
            ? this.state.litReviewPaperInfo
            : this.state.resultPaperInfo;
    };

    applyResultHighlight = () => {
        const activePaper = this.getActiveExplorePaper();
        const paperId = activePaper?.ID;
        if (paperId == null) {
            return;
        }
        const container = this.resultsExploreContentRef.current;
        if (!container) {
            return;
        }
        const selection = this.getSelectionOffsetsInContainer(container);
        if (!selection) {
            return;
        }
        const fieldText = (() => {
            const rp: any = activePaper || {};
            if (selection.field === "title") {
                return String(rp.Title || "(No title)");
            }
            if (selection.field === "year") {
                return rp.Year != null ? String(rp.Year) : "N/A";
            }
            if (selection.field === "keywords") {
                return Array.isArray(rp.Keywords)
                    ? rp.Keywords.join(", ")
                    : String(rp.Keywords || "N/A");
            }
            return String(rp.Abstract || "N/A");
        })();
        const start = Math.max(
            0,
            Math.min(selection.start, fieldText.length)
        );
        const end = Math.max(start, Math.min(selection.end, fieldText.length));
        if (end <= start) {
            return;
        }
        const op: ResultHighlightOp = {
            field: selection.field,
            start,
            end,
            text: selection.text,
            createdAt: Date.now(),
        };
        this.setState(
            (prev) => {
                const current = prev.resultHighlightOpsByPaper[paperId] || [];
                return {
                    resultHighlightOpsByPaper: {
                        ...prev.resultHighlightOpsByPaper,
                        [paperId]: [...current, op],
                    },
                };
            },
            () => this.persistResultHighlights()
        );
        try {
            window.getSelection()?.removeAllRanges();
        } catch {
            // ignore
        }
    };

    undoResultHighlight = () => {
        const paperId = this.getActiveExplorePaper()?.ID;
        if (paperId == null) {
            return;
        }
        this.setState(
            (prev) => {
                const current = prev.resultHighlightOpsByPaper[paperId] || [];
                if (!current.length) {
                    return null;
                }
                return {
                    resultHighlightOpsByPaper: {
                        ...prev.resultHighlightOpsByPaper,
                        [paperId]: current.slice(0, -1),
                    },
                };
            },
            () => this.persistResultHighlights()
        );
    };

    clearResultHighlights = () => {
        const paperId = this.getActiveExplorePaper()?.ID;
        if (paperId == null) {
            return;
        }
        this.setState(
            (prev) => ({
                resultHighlightOpsByPaper: {
                    ...prev.resultHighlightOpsByPaper,
                    [paperId]: [],
                },
            }),
            () => this.persistResultHighlights()
        );
    };

    /** Save all per-paper highlight operations so they survive page reloads. */
    persistResultHighlights = () => {
        try {
            sessionStorage.setItem(
                "result_highlights",
                JSON.stringify(this.state.resultHighlightOpsByPaper || {})
            );
        } catch (error) {
            console.warn("Failed to save highlights to localStorage:", error);
        }
    };

    /** Restore per-paper highlight operations saved in a previous session. */
    loadResultHighlights = () => {
        try {
            const saved = sessionStorage.getItem("result_highlights");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && typeof parsed === "object") {
                    this.setState({ resultHighlightOpsByPaper: parsed });
                }
            }
        } catch (error) {
            console.warn("Failed to load highlights from localStorage:", error);
        }
    };

    loadResultPaperById = async (paperId: number) => {
        this.setState({ loadingResultPaperInfo: true, resultPaperInfo: null });
        try {
            const fromAll = (this.state.dataFiltered["all"] || []).find(
                (r: { ID: number }) => r.ID === paperId
            );
            const fromNav = this.state.resultPaperNavList.find((p) => p.ID === paperId);
            const row = fromAll || fromNav;
            const fetched = await getPaperById(String(paperId));
            this.setState({
                resultPaperInfo: fetched || row,
                loadingResultPaperInfo: false,
            });
        } catch (e) {
            console.error("Failed to fetch result paper info:", e);
            const fallback =
                this.state.resultPaperNavList.find((p) => p.ID === paperId) || null;
            this.setState({
                resultPaperInfo: fallback,
                loadingResultPaperInfo: false,
            });
        }
    };

    openResultPaperModalWithNav = (
        paper: PaperRow,
        mode: "explore" | "summary",
        navList: PaperRow[]
    ) => {
        const idx = navList.findIndex((p) => p.ID === paper.ID);
        const index = idx >= 0 ? idx : 0;
        const target = navList[index] ?? paper;
        const isExplore = mode === "explore";
        this.setState(
            {
                resultsExploreInline: isExplore,
                isResultPaperModalOpen: !isExplore,
                loadingResultPaperInfo: true,
                resultPaperInfo: null,
                resultPaperViewMode: mode,
                resultPaperNavList: navList,
                resultPaperNavIndex: index,
                selectedPaperId: target.ID,
            },
            () => {
                void this.loadResultPaperById(target.ID);
                if (isExplore) {
                    this.requestSplitRelayout();
                }
            }
        );
        Logger.logUIInteraction({
            component: "App",
            action: isExplore
                ? "corpus_results_paper_explore_inline_open"
                : "corpus_results_paper_summary_modal_open",
            mode,
            paperId: target.ID,
            paperTitle: target.Title,
        });
    };

    goResultPaperNav = (delta: number) => {
        this.setState(
            (prev) => {
                const list = prev.resultPaperNavList;
                if (!list.length) {
                    return null;
                }
                const nextIndex = Math.max(
                    0,
                    Math.min(list.length - 1, prev.resultPaperNavIndex + delta)
                );
                if (nextIndex === prev.resultPaperNavIndex) {
                    return null;
                }
                const nextId = list[nextIndex].ID;
                return {
                    resultPaperNavIndex: nextIndex,
                    loadingResultPaperInfo: true,
                    resultPaperInfo: null,
                    selectedPaperId: nextId,
                };
            },
            () => {
                const id =
                    this.state.resultPaperNavList[this.state.resultPaperNavIndex]?.ID;
                if (id != null) {
                    void this.loadResultPaperById(id);
                }
            }
        );
    };

    /** split.js / react-split do not always reflow when the master-detail tree changes width */
    requestSplitRelayout = () => {
        requestAnimationFrame(() => {
            window.dispatchEvent(new Event("resize"));
        });
    };

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
            sessionStorage.setItem('research_notes', content)
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
        const hasColumnFilters = columnFilters && columnFilters.length > 0;
        const globalNeedle =
            globalFilter != null && String(globalFilter).trim().length > 0
                ? String(globalFilter).trim().toLowerCase()
                : null;

        if (!hasColumnFilters && !globalNeedle) {
            return data;
        }

        const filteredData = data.filter((row) => {
            const columnFilterPass = hasColumnFilters
                ? columnFilters.every((filter) => {
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
            })
                : true;

            const globalFilterPass = globalNeedle
                ? Object.values(row).some((value) =>
                    String(value).toLowerCase().includes(globalNeedle)
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
            }), () => {
                // Re-apply corpus bar query (user may have searched before papers finished loading)
                parent.applyCorpusSearchFromBar();
            });
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
                "spinner": false,
                "dataLoaded": true
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
            const raw = sessionStorage.getItem("saved_papers");
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
        this.loadResultHighlights();
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
            const savedContent = sessionStorage.getItem('research_notes')
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
            if (onLoadingProgress) onLoadingProgress(0.7);
            
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
        const corpusResultsTotalUnfiltered = (this.state.dataFiltered["all"] || []).length;
        const corpusResultsFilteredList = this.getFilteredCorpusSearchPapers();
        const corpusResultsFiltersOn = hasActiveCorpusResultsFilters(
            this.state.corpusResultsFilter
        );
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

        // Corpus search: match Results list (including client-side year/citation/venue filters).
        const hasActiveCorpusSearch = this.state.corpusSearchInput.trim().length > 0;
        const corpusBaseList = hasActiveCorpusSearch
            ? this.state.dataFiltered["all"] || []
            : this.state.pointsAll || [];
        const corpusListForHighlight =
            hasActiveCorpusSearch &&
            hasActiveCorpusResultsFilters(this.state.corpusResultsFilter)
                ? filterCorpusResultsByFacets(
                      corpusBaseList as PaperRow[],
                      this.state.corpusResultsFilter
                  )
                : corpusBaseList;
        const filteredPaperIdSet = new Set(
            corpusListForHighlight.map((p: { ID: number }) => p.ID)
        );
        const isInFilteredPapers = (row) => {
            if (Array.isArray(row)) {
                let _numFiltered = 0;
                row.forEach((r) => {
                    try {
                        if (filteredPaperIdSet.has(r["ID"])) {
                            _numFiltered += 1;
                        }
                    } catch (err) {
                        // continue
                    }
                });
                return _numFiltered == row.length;
            } else {
                try {
                    return filteredPaperIdSet.has(row["ID"]);
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
                    sessionStorage.setItem('saved_papers', JSON.stringify(_papers));
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
                        sessionStorage.setItem('saved_papers', JSON.stringify(_property));
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

        const {tabs, activeKey, dialogStates} = this.state;

        const handleCorpusAsk = (paper: PaperRow) => {
            this.setState({
                chatSidebarOpen: true,
                corpusAskQueue: {
                    id: paper.ID,
                    title: paper.Title || "(No title)",
                    token: Date.now(),
                },
            });
            Logger.logUIInteraction({
                component: "App",
                action: "corpus_results_ask",
                paperId: paper.ID,
            });
        };
        const handleCorpusLocate = (paper: PaperRow) => {
            addToSelectNodeIDs([paper.ID], "scatterplot");
            Logger.logUIInteraction({
                component: "App",
                action: "corpus_results_locate",
                paperId: paper.ID,
            });
        };
        const handleCorpusSimilar = (paper: PaperRow) => {
            const full = this.state.dataFiltered["all"].find((r: { ID: number }) => r.ID === paper.ID);
            if (full) {
                addToSimilarInputPapers(full);
                Logger.logUIInteraction({
                    component: "App",
                    action: "corpus_results_add_similar",
                    paperId: paper.ID,
                });
            }
        };
        const handleCorpusSimilarToggle = (paper: PaperRow) => {
            const isAdded = this.state.dataSimilarPayloadID.includes(paper.ID);
            if (isAdded) {
                this.setState((prev) => ({
                    dataSimilarPayload: (prev.dataSimilarPayload || []).filter(
                        (p: { ID: number }) => p.ID !== paper.ID
                    ),
                    dataSimilarPayloadID: (prev.dataSimilarPayloadID || []).filter(
                        (id: number) => id !== paper.ID
                    ),
                }));
                Logger.logUIInteraction({
                    component: "App",
                    action: "corpus_results_remove_similar",
                    paperId: paper.ID,
                });
                return;
            }
            handleCorpusSimilar(paper);
        };
        const handleCorpusSave = (paper: PaperRow) => {
            const full = this.state.dataFiltered["all"].find((r: { ID: number }) => r.ID === paper.ID);
            if (full) {
                addToSavedPapers(full);
                Logger.logUIInteraction({
                    component: "App",
                    action: "corpus_results_save",
                    paperId: paper.ID,
                });
            }
        };
        const handleCorpusSaveToggle = (paper: PaperRow) => {
            const isSaved = this.state.dataSavedID.includes(paper.ID);
            if (isSaved) {
                this.setState((prev) => {
                    const nextSaved = (prev.dataSaved || []).filter(
                        (p: { ID: number }) => p.ID !== paper.ID
                    );
                    return {
                        dataSaved: nextSaved,
                        dataSavedID: (prev.dataSavedID || []).filter(
                            (id: number) => id !== paper.ID
                        ),
                    };
                }, () => {
                    try {
                        sessionStorage.setItem(
                            "saved_papers",
                            JSON.stringify(this.state.dataSaved || [])
                        );
                    } catch (e) {
                        console.warn("Failed to update saved papers in localStorage:", e);
                    }
                });
                Logger.logUIInteraction({
                    component: "App",
                    action: "corpus_results_unsave",
                    paperId: paper.ID,
                });
                return;
            }
            handleCorpusSave(paper);
        };

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

        const chatSidebarContent = (
            <section
                id="chatWindowsPanel"
                className="app-chat-sidebar__body workspace-panel workspace-panel--chat p-md p-b-0"
            >
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
                    <Nav.Item>
                        <Button
                            variant="link"
                            className="add-button"
                            onClick={this.addNewTab}
                            aria-label="Add new tab"
                        >
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
                <div className="dialog-container">
                    {tabs.map((tab) => (
                        <Tab.Content key={tab.id}>
                            {activeKey === tab.id && (
                                <div className="dialog-content">
                                    <Dialog
                                        props={{
                                            ...dialogStates[tab.id],
                                            tabId: tab.id,
                                            updateDialogState: (updatedState) =>
                                                this.updateDialogState(tab.id, updatedState),
                                            addToSelectNodeIDs: addToSelectNodeIDs,
                                            addToSimilarInputPapers: addToSimilarInputPapers,
                                            addToSavedPapers: addToSavedPapers,
                                            isInSimilarInputPapers: isInSimilarInputPapers,
                                            isInSavedPapers: isInSavedPapers,
                                            isInSelectedNodeIDs: isInSelectedNodeIDs,
                                            queuedCorpusQuestionPaper:
                                                activeKey === tab.id ? this.state.corpusAskQueue : null,
                                            onConsumeQueuedCorpusQuestionPaper: () =>
                                                this.setState({ corpusAskQueue: null }),
                                        }}
                                    />
                                </div>
                            )}
                        </Tab.Content>
                    ))}
                </div>
            </section>
        );

        const renderMainToolPanels = () => {
            const {
                similarityWorkspaceOpen,
                visualizationWorkspaceOpen,
                workspacePanelOrder,
            } = this.state;
            let openOrder = workspacePanelOrder.filter(
                (k) =>
                    (k === "similarity" && similarityWorkspaceOpen) ||
                    (k === "visualization" && visualizationWorkspaceOpen)
            );
            if (similarityWorkspaceOpen && openOrder.indexOf("similarity") === -1) {
                openOrder = [...openOrder, "similarity"];
            }
            if (visualizationWorkspaceOpen && openOrder.indexOf("visualization") === -1) {
                openOrder = [...openOrder, "visualization"];
            }
            const n = openOrder.length;
            const stackClass = (i: number) =>
                n <= 1
                    ? "workspace-panel--stack-only"
                    : i === 0
                      ? "workspace-panel--stack-first"
                      : "workspace-panel--stack-second";

            const similarityPanel = (sc: string) => (
                <section
                    key="similarity"
                    id="similaritySearchPanel"
                    className={`workspace-panel workspace-panel--similarity ${sc} p-md p-b-0`}
                >
                    <Stack horizontal horizontalAlign="space-between" verticalAlign="center"
                           tokens={{childrenGap: 8}}>
                        <Label style={{fontSize: "1.2rem"}}>Similarity Search</Label>
                        <button
                            type="button"
                            className="workspace-panel-header__close-btn"
                            title="Hide Similarity Search"
                            aria-label="Close Similarity Search panel"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                                e.stopPropagation();
                                this.setState((prev) => ({
                                    similarityWorkspaceOpen: false,
                                    workspacePanelOrder: prev.workspacePanelOrder.filter(
                                        (k) => k !== "similarity"
                                    ),
                                }));
                                Logger.logUIInteraction({
                                    component: "App",
                                    action: "similarity_workspace_panel_close",
                                    elementId: "similarityWorkspaceClose",
                                });
                            }}
                        >
                            <FontAwesomeIcon icon={faTimes} aria-hidden />
                        </button>
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
                                <SimilarityByAbstractPanel
                                    key={String(this.state.embeddingType.key)}
                                    seedTitle={this.state.searchTitle}
                                    seedAbstract={this.state.searchAbstract}
                                    embeddingIsAda={this.state.embeddingType.key === "ada"}
                                    searchByAbstractLimit={this.state.searchByAbstractLimit}
                                    maxSimilarPapersDropdownOptions={maxSimilarPapersDropdownOptions}
                                    onLimitChange={(event: React.FormEvent<HTMLDivElement>, item: IDropdownOption) => {
                                        if (item) {
                                            this.setState({searchByAbstractLimit: item});
                                        }
                                    }}
                                    onFindSimilar={(title, abstract) => {
                                        this.setState(
                                            {searchTitle: title, searchAbstract: abstract},
                                            () => getSimilarPapersByAbstract()
                                        );
                                    }}
                                />
                            </PivotItem>
                            <PivotItem onRenderItemLink={_outputButtonRenderer} headerText={"Output Similar"}
                                       itemCount={this.state.dataSimilar.length}>
                                <div className="m-t-lg"></div>
                                <SmartTable props={similarPapersTableProps}
                                            setSpinner={this.setSpinner}></SmartTable>
                            </PivotItem>
                        </Pivot>
                    </div>
                </section>
            );

            const visualizationPanel = (sc: string) => (
                <section
                    key="visualization"
                    className={`workspace-panel workspace-panel--visualization ${sc} p-md p-b-0`}
                >
                    <Stack horizontal horizontalAlign="space-between" verticalAlign="center"
                           tokens={{childrenGap: 8}}>
                        <Label style={{fontSize: "1.2rem"}}>Visualization</Label>
                        <button
                            type="button"
                            className="workspace-panel-header__close-btn"
                            title="Hide Visualization"
                            aria-label="Close Visualization panel"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                                e.stopPropagation();
                                this.setState((prev) => ({
                                    visualizationWorkspaceOpen: false,
                                    workspacePanelOrder: prev.workspacePanelOrder.filter(
                                        (k) => k !== "visualization"
                                    ),
                                }));
                                Logger.logUIInteraction({
                                    component: "App",
                                    action: "visualization_workspace_panel_close",
                                    elementId: "visualizationWorkspaceClose",
                                });
                            }}
                        >
                            <FontAwesomeIcon icon={faTimes} aria-hidden />
                        </button>
                    </Stack>
                    {/* Mount only when open; hidden panels have 0×0 canvas and break regl-scatterplot */}
                    <div className="workspace-panel__viz-body">
                    {visualizationWorkspaceOpen &&
                    this.state.pointsAll.length > 0 ? (
                        <PaperScatter
                            props={{
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
                                data: this.state.pointsAll,
                                selectNodeIDs: this.state.selectNodeIDs,
                                addToSelectNodeIDs: addToSelectNodeIDs,
                                embeddingType: this.state.embeddingType.key as string,
                                openGScholar: openGScholar,
                                eventOrigin: this.state.eventOrigin,
                            }}
                        />
                    ) : null}
                    </div>
                </section>
            );

            return (
            <React.Fragment>
                {openOrder.map((key, i) =>
                    key === "similarity" ? similarityPanel(stackClass(i)) : visualizationPanel(stackClass(i))
                )}
                {!similarityWorkspaceOpen && !visualizationWorkspaceOpen ? (
                    <div className="app-working-panels-empty" role="status">
                        <Text variant="medium">Open Similarity search or Visualization from the bar above.</Text>
                    </div>
                ) : null}

            </React.Fragment>
            );
        };

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
                </LoadingOverlay>
            );
        }

        const mainWorkspace = (
            <div className="app-detail-body">
                <div
                    className="app-workspace-scroll"
                    role="region"
                    aria-label="Visualization and similarity tools"
                >
                    <div className="app-working-panels">
                        {renderMainToolPanels()}
                    </div>
                </div>
            </div>
        );

        const detailColumn = this.state.chatSidebarOpen ? (
            <Split
                key={`chat-workspace-split-${this.state.resultsPanelOpen ? "with-results" : "full-width"}`}
                className="app-detail-chat-split"
                direction="horizontal"
                sizes={[58, 42]}
                minSize={[300, 280]}
                gutterSize={12}
            >
                <main className="app-detail app-detail--with-chat-split">{mainWorkspace}</main>
                <aside className="app-chat-sidebar" aria-label="Chat">
                    <div className="app-chat-sidebar__header">
                        <Text variant="large">Chat Windows</Text>
                        <button
                            type="button"
                            className="app-master-header__close-btn"
                            title="Hide chat"
                            aria-label="Close chat panel"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                                e.stopPropagation();
                                this.setState({chatSidebarOpen: false}, () => {
                                    this.requestSplitRelayout();
                                });
                                Logger.logUIInteraction({
                                    component: "App",
                                    action: "chat_panel_close",
                                    elementId: "chatPanelClose",
                                });
                            }}
                        >
                            <FontAwesomeIcon icon={faTimes} aria-hidden />
                        </button>
                    </div>
                    {chatSidebarContent}
                </aside>
            </Split>
        ) : (
            <main className="app-detail" key={`detail-main-solo-${this.state.resultsPanelOpen ? "with-results" : "full-width"}`}>
                {mainWorkspace}
            </main>
        );

        return (
            <>
                <LoadingOverlay
                    active={this.state.spinner}
                    spinner
                    text={'Loading data'}
                    styles={{
                        wrapper: (base) => ({
                            ...base,
                            flex: 1,
                            minHeight: 0,
                            display: "flex",
                            flexDirection: "column",
                            boxSizing: "border-box",
                        }),
                        overlay: (base) => ({...base, background: 'rgba(0, 0, 0, 0.5)'}),
                        content: (base) => ({...base, color: 'rgba(255, 255, 255, 1)'})
                    }}
                >
                    <div className="app-shell">
                    <header className="app-top-bar" role="banner">
                        <div className="app-top-bar__brand-block">
                            <div className="app-top-bar__brand">
                                <img height="32" title="VitaLITy" src={logo} alt="VitaLITy"/>
                            </div>
                            <p className="app-top-bar__tagline">
                                Literature discovery with LLMs and visual analytics
                            </p>
                        </div>
                        <div className="app-top-bar__right">
                            <div className="app-top-bar__embedding">
                                <Dropdown
                                    ariaLabel="Embedding"
                                    selectedKey={this.state.embeddingType.key}
                                    onChange={(event: React.FormEvent<HTMLDivElement>, item: IDropdownOption) => {
                                        if (item) {
                                            this.setState({embeddingType: item});
                                            Logger.logUIInteraction({
                                                component: "App",
                                                action: "embedding_type_change",
                                                elementId: "topBarEmbedding",
                                                value: item?.key,
                                            });
                                        }
                                    }}
                                    options={embeddingTypeDropdownOptions}
                                    styles={{root: {minWidth: 120, maxWidth: 160}}}
                                />
                            </div>
                            <div className="app-top-bar__actions">
                                <DefaultButton
                                    id="metaTableButton"
                                    text="Metadata"
                                    iconProps={{iconName: "Table"}}
                                    onClick={() => {
                                        const wasOpen = this.state.isMetaTableModalOpen;
                                        this.setState({isMetaTableModalOpen: !this.state.isMetaTableModalOpen});
                                        Logger.logUIInteraction({
                                            component: "App",
                                            action: "meta_table_modal_toggle",
                                            elementId: "metaTableButton",
                                            value: !wasOpen,
                                            modalName: "metaTable",
                                        });
                                    }}
                                />
                                <DefaultButton
                                    id="savedPapersButton"
                                    iconProps={{iconName: "ClipboardList"}}
                                    text={"Literature Review (" + this.state.dataSaved.length + ")"}
                                    onClick={() => {
                                        this.setState({isPanelOpen: true});
                                        Logger.logUIInteraction({
                                            component: "App",
                                            action: "saved_papers_panel_open",
                                            elementId: "savedPapersButton",
                                            panelName: "savedPapers",
                                            savedPapersCount: this.state.dataSaved.length,
                                        });
                                    }}
                                />
                            </div>
                        </div>
                    </header>
                    <div className="app-main-column">
                    <div className="app-search-section">
                        <MultiFunctionSearchBar
                            corpusSearchInput={this.state.corpusSearchInput}
                            dataTitles={this.state.dataTitles}
                            authorsSummary={this.state.authorsSummary}
                            sourcesSummary={this.state.sourcesSummary}
                            onSubmitCorpusSearch={(q) =>
                                this.setState({corpusSearchInput: q, resultsPanelOpen: true}, () =>
                                    this.applyCorpusSearchFromBar()
                                )
                            }
                            onClearSearch={this.clearCorpusSearchFromBar}
                            similarityWorkspaceOpen={this.state.similarityWorkspaceOpen}
                            visualizationWorkspaceOpen={this.state.visualizationWorkspaceOpen}
                            chatSidebarOpen={this.state.chatSidebarOpen}
                            onOpenWorkspacePanel={(tool) => {
                                const isSimilarity = tool === "similarity";
                                this.setState(
                                    (prev) => {
                                        const nextSim = isSimilarity
                                            ? true
                                            : prev.similarityWorkspaceOpen;
                                        const nextViz = isSimilarity
                                            ? prev.visualizationWorkspaceOpen
                                            : true;
                                        return {
                                            similarityWorkspaceOpen: nextSim,
                                            visualizationWorkspaceOpen: nextViz,
                                            workspacePanelOrder: appendWorkspacePanelToOrder(
                                                prev.workspacePanelOrder,
                                                tool,
                                                nextSim,
                                                nextViz
                                            ),
                                        };
                                    },
                                    () => {
                                        Logger.logUIInteraction({
                                            component: "App",
                                            action: "workspace_panel_open",
                                            panelName: isSimilarity
                                                ? "similarityWorkspace"
                                                : "visualizationWorkspace",
                                            isOpen: true,
                                        });
                                    }
                                );
                            }}
                            onToggleChatSidebar={() => {
                                this.setState((prev) => {
                                    const next = !prev.chatSidebarOpen;
                                    Logger.logUIInteraction({
                                        component: "App",
                                        action: "chat_sidebar_toggle",
                                        value: next,
                                    });
                                    return {chatSidebarOpen: next};
                                });
                            }}
                        />
                    </div>
                    <div
                        className={`app-master-detail${
                            this.state.resultsPanelOpen ? "" : " app-master-detail--no-results"
                        }`}
                    >
                        {this.state.resultsPanelOpen ? (
                            <Split
                                className="app-results-detail-split"
                                direction="horizontal"
                                sizes={[28, 72]}
                                minSize={[200, 300]}
                                gutterSize={12}
                            >
                                <aside
                                    ref={this.resultsSidebarRef}
                                    className={`app-master${
                                        this.state.resultsExploreInline
                                            ? " app-master--explore-open"
                                            : ""
                                    }`}
                                    aria-label="Corpus search results"
                                >
                                    {this.state.resultsLoading && (
                                        <div
                                            className="app-master-loading"
                                            role="status"
                                            aria-live="polite"
                                        >
                                            <div className="app-master-loading__spinner" />
                                            <span className="app-master-loading__text">
                                                Searching papers…
                                            </span>
                                        </div>
                                    )}
                                    <div className="app-master-header">
                                        {this.state.resultsExploreInline ? (
                                            <div className="app-master-header__titles app-master-header__titles--explore">
                                                <button
                                                    type="button"
                                                    className="app-master-back-to-list"
                                                    onClick={() =>
                                                        this.closeResultPaperExplore()
                                                    }
                                                >
                                                    ← Results
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="app-master-header__titles">
                                                <Text variant="large">Results</Text>
                                                <span className="app-master-count">
                                                    {corpusResultsFiltersOn
                                                        ? `${corpusResultsFilteredList.length} of ${corpusResultsTotalUnfiltered} papers`
                                                        : `${corpusResultsFilteredList.length} papers`}
                                                </span>
                                            </div>
                                        )}
                                        <div className="app-master-header__actions">
                                            <button
                                                ref={this.resultsFilterButtonRef}
                                                type="button"
                                                className={`app-master-header__filter-btn${
                                                    corpusResultsFiltersOn ? " is-active" : ""
                                                }${this.state.resultsFilterPanelOpen ? " is-open" : ""}`}
                                                title="Filter results"
                                                aria-label="Filter results"
                                                aria-expanded={this.state.resultsFilterPanelOpen}
                                                aria-haspopup="dialog"
                                                onMouseDown={(e) => e.stopPropagation()}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    this.toggleResultsFilterPanel();
                                                    Logger.logUIInteraction({
                                                        component: "App",
                                                        action: "results_filter_popover_toggle",
                                                    });
                                                }}
                                            >
                                                <FontAwesomeIcon
                                                    icon={faFilter}
                                                    className="app-master-header__filter-btn-icon"
                                                    aria-hidden
                                                />
                                                <span className="app-master-header__filter-btn-text">
                                                    <span className="app-master-header__filter-btn-label">
                                                        Filter
                                                    </span>
                                                    <span className="app-master-header__filter-btn-hint">
                                                        Year, citations, source…
                                                    </span>
                                                </span>
                                            </button>
                                            <button
                                                type="button"
                                                className="app-master-header__close-btn"
                                                title="Hide results"
                                                aria-label="Close results panel"
                                                onMouseDown={(e) => e.stopPropagation()}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    this.setState(
                                                        {
                                                            resultsPanelOpen: false,
                                                            resultsFilterPanelOpen: false,
                                                            resultsExploreInline: false,
                                                        },
                                                        () => {
                                                            this.requestSplitRelayout();
                                                        }
                                                    );
                                                    Logger.logUIInteraction({
                                                        component: "App",
                                                        action: "results_panel_close",
                                                        elementId: "resultsPanelClose",
                                                    });
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faTimes} aria-hidden />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="app-master-scroll">
                                        {this.state.resultsExploreInline
                                            ? (() => {
                                                  const navList =
                                                      this.state.resultPaperNavList;
                                                  const navIdx =
                                                      this.state.resultPaperNavIndex;
                                                  const navLen = navList.length;
                                                  const atStart =
                                                      navLen === 0 || navIdx <= 0;
                                                  const atEnd =
                                                      navLen === 0 ||
                                                      navIdx >= navLen - 1;
                                                  const loading =
                                                      this.state
                                                          .loadingResultPaperInfo;
                                                  const rp =
                                                      this.state.resultPaperInfo;
                                                  const refCount =
                                                      rp?.ReferenceCounts ??
                                                      rp?.References ??
                                                      rp?.NumReferences;
                                                  const hasRef =
                                                      refCount != null &&
                                                      refCount !== "" &&
                                                      !Number.isNaN(
                                                          Number(refCount)
                                                      );
                                                  return (
                                                      <div
                                                          className="app-master-explore"
                                                          role="article"
                                                      >
                                                          <div className="result-paper-modal__nav result-paper-modal__nav--inline">
                                                              <IconButton
                                                                  iconProps={{
                                                                      iconName:
                                                                          "Cancel",
                                                                  }}
                                                                  ariaLabel="Back to results list"
                                                                  title="Back to results list"
                                                                  onClick={() =>
                                                                      this.closeResultPaperExplore()
                                                                  }
                                                                  className="result-paper-modal__nav-close"
                                                              />
                                                              <DefaultButton
                                                                  text="Previous"
                                                                  disabled={
                                                                      atStart ||
                                                                      loading
                                                                  }
                                                                  iconProps={{
                                                                      iconName:
                                                                          "ChevronLeft",
                                                                  }}
                                                                  onClick={() =>
                                                                      this.goResultPaperNav(
                                                                          -1
                                                                      )
                                                                  }
                                                                  className="result-paper-modal__nav-prev"
                                                              />
                                                              <span className="result-paper-modal__nav-spacer" />
                                                              <DefaultButton
                                                                  text="Next"
                                                                  disabled={
                                                                      atEnd ||
                                                                      loading
                                                                  }
                                                                  iconProps={{
                                                                      iconName:
                                                                          "ChevronRight",
                                                                  }}
                                                                  onClick={() =>
                                                                      this.goResultPaperNav(
                                                                          1
                                                                      )
                                                                  }
                                                                  className="result-paper-modal__nav-next"
                                                              />
                                                          </div>
                                                          <div className="result-paper-modal__body result-paper-modal__body--inline">
                                                              {loading ? (
                                                                  <div className="result-paper-modal__loading">
                                                                      Loading
                                                                      details...
                                                                  </div>
                                                              ) : rp ? (
                                                                  (() => {
                                                                      const paperAsRow: PaperRow =
                                                                          {
                                                                              ID: rp.ID,
                                                                              Title:
                                                                                  rp.Title,
                                                                              Authors:
                                                                                  rp.Authors,
                                                                              Year: rp.Year,
                                                                              CitationCounts:
                                                                                  rp.CitationCounts,
                                                                              Source:
                                                                                  rp.Source ||
                                                                                  rp.Venue,
                                                                          };
                                                                      const highlightOps =
                                                                          this.getResultHighlightOps(
                                                                              rp.ID
                                                                          );
                                                                      const titleText =
                                                                          rp.Title ||
                                                                          "(No title)";
                                                                      const yearText =
                                                                          rp.Year !=
                                                                          null
                                                                              ? String(
                                                                                    rp.Year
                                                                                )
                                                                              : "N/A";
                                                                      const abstractText =
                                                                          rp.Abstract ||
                                                                          "N/A";
                                                                      const keywordsText =
                                                                          Array.isArray(
                                                                              rp.Keywords
                                                                          )
                                                                              ? rp.Keywords.join(
                                                                                    ", "
                                                                                )
                                                                              : rp.Keywords ||
                                                                                "N/A";
                                                                      const titleHighlightOps =
                                                                          this.getResultHighlightOpsForField(
                                                                              rp.ID,
                                                                              "title"
                                                                          );
                                                                      const yearHighlightOps =
                                                                          this.getResultHighlightOpsForField(
                                                                              rp.ID,
                                                                              "year"
                                                                          );
                                                                      const abstractHighlightOps =
                                                                          this.getResultHighlightOpsForField(
                                                                              rp.ID,
                                                                              "abstract"
                                                                          );
                                                                      const keywordsHighlightOps =
                                                                          this.getResultHighlightOpsForField(
                                                                              rp.ID,
                                                                              "keywords"
                                                                          );
                                                                      const hasHighlights =
                                                                          highlightOps.length > 0;
                                                                      return (
                                                                          <div
                                                                              ref={
                                                                                  this
                                                                                      .resultsExploreContentRef
                                                                              }
                                                                              className="result-paper-explore"
                                                                          >
                                                                              <div className="result-paper-explore__highlight-tools result-paper-explore__highlight-tools--sticky">
                                                                                  <DefaultButton
                                                                                      text="Highlight"
                                                                                      iconProps={{
                                                                                          iconName:
                                                                                              "Edit",
                                                                                      }}
                                                                                      onClick={
                                                                                          this
                                                                                              .applyResultHighlight
                                                                                      }
                                                                                  />
                                                                                  <DefaultButton
                                                                                      text="Undo"
                                                                                      iconProps={{
                                                                                          iconName:
                                                                                              "Undo",
                                                                                      }}
                                                                                      disabled={
                                                                                          !hasHighlights
                                                                                      }
                                                                                      onClick={
                                                                                          this
                                                                                              .undoResultHighlight
                                                                                      }
                                                                                  />
                                                                                  <DefaultButton
                                                                                      text="Clear"
                                                                                      iconProps={{
                                                                                          iconName:
                                                                                              "Clear",
                                                                                      }}
                                                                                      disabled={
                                                                                          !hasHighlights
                                                                                      }
                                                                                      onClick={
                                                                                          this
                                                                                              .clearResultHighlights
                                                                                      }
                                                                                  />
                                                                              </div>
                                                                              <h2 className="result-paper-explore__headline">
                                                                                  <span data-highlight-field="title">
                                                                                      {this.renderHighlightedText(
                                                                                          titleText,
                                                                                          titleHighlightOps
                                                                                      )}
                                                                                  </span>
                                                                              </h2>
                                                                              <div className="result-paper-explore__detail-meta">
                                                                                  <p>
                                                                                      <b>
                                                                                          Authors
                                                                                      </b>
                                                                                      :{" "}
                                                                                      {Array.isArray(
                                                                                          rp.Authors
                                                                                      )
                                                                                          ? rp.Authors.join(
                                                                                                ", "
                                                                                            )
                                                                                          : rp.Authors ||
                                                                                            "N/A"}
                                                                                  </p>
                                                                                  <p>
                                                                                      <b>
                                                                                          Source
                                                                                      </b>
                                                                                      :{" "}
                                                                                      {rp.Source ||
                                                                                          rp.Venue ||
                                                                                          "N/A"}
                                                                                  </p>
                                                                                  <p>
                                                                                      <b>
                                                                                          Year
                                                                                      </b>
                                                                                      :{" "}
                                                                                      <span data-highlight-field="year">
                                                                                          {this.renderHighlightedText(
                                                                                              yearText,
                                                                                              yearHighlightOps
                                                                                          )}
                                                                                      </span>
                                                                                  </p>
                                                                                  <p>
                                                                                      <b>
                                                                                          No.
                                                                                          of
                                                                                          Citations
                                                                                      </b>
                                                                                      :{" "}
                                                                                      {rp.CitationCounts ??
                                                                                          "N/A"}
                                                                                  </p>
                                                                                  {hasRef ? (
                                                                                      <p>
                                                                                          <b>
                                                                                              References
                                                                                          </b>
                                                                                          :{" "}
                                                                                          {String(
                                                                                              refCount
                                                                                          )}
                                                                                      </p>
                                                                                  ) : null}
                                                                              </div>
                                                                              <div className="result-paper-explore__abstract-block">
                                                                                  <b>
                                                                                      Abstract
                                                                                  </b>
                                                                                  :{" "}
                                                                                  <div
                                                                                      data-highlight-field="abstract"
                                                                                      className="result-paper-explore__abstract-content"
                                                                                  >
                                                                                      {this.renderHighlightedText(
                                                                                          abstractText,
                                                                                          abstractHighlightOps
                                                                                      )}
                                                                                  </div>
                                                                              </div>
                                                                              <div className="result-paper-explore__keywords-block">
                                                                                  <b>
                                                                                      Keywords
                                                                                  </b>
                                                                                  :{" "}
                                                                                  <span data-highlight-field="keywords">
                                                                                      {this.renderHighlightedText(
                                                                                          keywordsText,
                                                                                          keywordsHighlightOps
                                                                                      )}
                                                                                  </span>
                                                                              </div>
                                                                              <div className="result-paper-explore__actions">
                                                                                  <DefaultButton
                                                                                      text="Add"
                                                                                      iconProps={{
                                                                                          iconName:
                                                                                              "Add",
                                                                                      }}
                                                                                      onClick={() =>
                                                                                          handleCorpusSimilarToggle(
                                                                                              paperAsRow
                                                                                          )
                                                                                      }
                                                                                  />
                                                                                  <DefaultButton
                                                                                      text="Select"
                                                                                      iconProps={{
                                                                                          iconName:
                                                                                              "Locate",
                                                                                      }}
                                                                                      onClick={() => {
                                                                                          const id =
                                                                                              rp?.ID;
                                                                                          if (
                                                                                              id !=
                                                                                              null
                                                                                          ) {
                                                                                              addToSelectNodeIDs(
                                                                                                  [
                                                                                                      id,
                                                                                                  ],
                                                                                                  "table"
                                                                                              );
                                                                                          }
                                                                                      }}
                                                                                  />
                                                                                  <DefaultButton
                                                                                      text="Save"
                                                                                      iconProps={{
                                                                                          iconName:
                                                                                              "Save",
                                                                                      }}
                                                                                      onClick={() =>
                                                                                          handleCorpusSaveToggle(
                                                                                              paperAsRow
                                                                                          )
                                                                                      }
                                                                                  />
                                                                                  <DefaultButton
                                                                                      text="Google Scholar"
                                                                                      iconProps={{
                                                                                          iconName:
                                                                                              "Link",
                                                                                      }}
                                                                                      onClick={() => {
                                                                                          if (
                                                                                              rp?.Title
                                                                                          ) {
                                                                                              openGScholar(
                                                                                                  rp.Title
                                                                                              );
                                                                                          }
                                                                                      }}
                                                                                  />
                                                                              </div>
                                                                          </div>
                                                                      );
                                                                  })()
                                                              ) : (
                                                                  <div className="result-paper-modal__empty">
                                                                      No paper
                                                                      information
                                                                      available.
                                                                  </div>
                                                              )}
                                                          </div>
                                                      </div>
                                                  );
                                              })()
                                            : (
                                                  <CorpusResultsList
                                                      papers={
                                                          corpusResultsFilteredList
                                                      }
                                                      paginationResetKey={`${this.state.corpusSearchInput}|${JSON.stringify(
                                                          this.state
                                                              .corpusResultsFilter
                                                      )}`}
                                                      selectedPaperId={
                                                          this.state
                                                              .selectedPaperId
                                                      }
                                                      onTitleClick={(paper) =>
                                                          this.openResultPaperModalWithNav(
                                                              paper,
                                                              "explore",
                                                              corpusResultsFilteredList
                                                          )
                                                      }
                                                      onPaperInfoClick={(
                                                          paper
                                                      ) =>
                                                          this.openResultPaperModalWithNav(
                                                              paper,
                                                              "summary",
                                                              corpusResultsFilteredList
                                                          )
                                                      }
                                                      paperActions={{
                                                          onAsk: handleCorpusAsk,
                                                          onLocate:
                                                              handleCorpusLocate,
                                                          onAddSimilar:
                                                              handleCorpusSimilar,
                                                          onSave: handleCorpusSave,
                                                          isLocateDisabled: (
                                                              p
                                                          ) =>
                                                              isInSelectedNodeIDs(
                                                                  p.ID
                                                              ),
                                                          isSimilarDisabled: (
                                                              p
                                                          ) =>
                                                              isInSimilarInputPapers(
                                                                  {
                                                                      ID: p.ID,
                                                                  }
                                                              ),
                                                          isSaveDisabled: (p) =>
                                                              isInSavedPapers({
                                                                  ID: p.ID,
                                                              }),
                                                      }}
                                                  />
                                              )}
                                    </div>
                                </aside>
                                <div className="app-master-detail__rest">{detailColumn}</div>
                            </Split>
                        ) : (
                            detailColumn
                        )}
                    </div>
                    </div>
                    </div>
                    {this.state.resultsFilterPanelOpen ? (
                    <Callout
                        className="app-results-filter-callout"
                        target={this.resultsFilterButtonRef}
                        directionalHint={DirectionalHint.bottomCenter}
                        directionalHintFixed
                        onDismiss={() => this.setState({resultsFilterPanelOpen: false})}
                        setInitialFocus
                        isBeakVisible
                        gapSpace={8}
                        beakWidth={12}
                        preventDismissOnLostFocus={false}
                        bounds={() => {
                            const el = this.resultsSidebarRef.current;
                            if (!el) {
                                return undefined;
                            }
                            const r = el.getBoundingClientRect();
                            return {
                                top: r.top,
                                left: r.left,
                                bottom: r.bottom,
                                right: r.right,
                                width: r.width,
                                height: r.height,
                            };
                        }}
                        minPagePadding={4}
                        layerProps={{
                            styles: {root: {zIndex: 1000002}},
                        }}
                        onLayerMounted={() => {
                            requestAnimationFrame(() => {
                                window.dispatchEvent(new Event("resize"));
                            });
                        }}
                        styles={{
                            calloutMain: {
                                borderRadius: 12,
                                boxShadow: "0 8px 28px rgba(0, 0, 0, 0.14)",
                                border: "1px solid #e1e5eb",
                                maxWidth: 340,
                                minWidth: 240,
                                boxSizing: "border-box",
                            },
                        }}
                    >
                        <div
                            className="app-results-filter-popover"
                            role="dialog"
                            aria-label="Filter results"
                        >
                            <div className="app-results-filter-popover__header">
                                <Text variant="mediumPlus" className="app-results-filter-popover__title">
                                    Filter results
                                </Text>
                                <button
                                    type="button"
                                    className="app-results-filter-popover__clear-link"
                                    onClick={() => {
                                        this.clearCorpusResultsFilters();
                                        Logger.logUIInteraction({
                                            component: "App",
                                            action: "results_filters_clear",
                                        });
                                    }}
                                >
                                    Clear all
                                </button>
                            </div>
                            <Stack tokens={{childrenGap: 16}}>
                                <div className="app-results-filter-popover__field">
                                    <Label>Published between (year)</Label>
                                    <Stack
                                        horizontal
                                        verticalAlign="end"
                                        tokens={{childrenGap: 8}}
                                        wrap
                                    >
                                        <TextField
                                            ariaLabel="Minimum year"
                                            placeholder="YYYY"
                                            value={this.state.corpusResultsFilterDraft.yearMin}
                                            onChange={(_, v) =>
                                                this.setState((prev) => ({
                                                    corpusResultsFilterDraft: {
                                                        ...prev.corpusResultsFilterDraft,
                                                        yearMin: v ?? "",
                                                    },
                                                }))
                                            }
                                            styles={{root: {flex: 1, minWidth: 88}}}
                                        />
                                        <span className="app-results-filter-popover__dash" aria-hidden>
                                            –
                                        </span>
                                        <TextField
                                            ariaLabel="Maximum year"
                                            placeholder="YYYY"
                                            value={this.state.corpusResultsFilterDraft.yearMax}
                                            onChange={(_, v) =>
                                                this.setState((prev) => ({
                                                    corpusResultsFilterDraft: {
                                                        ...prev.corpusResultsFilterDraft,
                                                        yearMax: v ?? "",
                                                    },
                                                }))
                                            }
                                            styles={{root: {flex: 1, minWidth: 88}}}
                                        />
                                    </Stack>
                                </div>
                                <div className="app-results-filter-popover__field">
                                    <Label>Citation count</Label>
                                    <Stack
                                        horizontal
                                        verticalAlign="end"
                                        tokens={{childrenGap: 8}}
                                        wrap
                                    >
                                        <TextField
                                            ariaLabel="Minimum citations"
                                            placeholder="Min"
                                            value={this.state.corpusResultsFilterDraft.citationsMin}
                                            onChange={(_, v) =>
                                                this.setState((prev) => ({
                                                    corpusResultsFilterDraft: {
                                                        ...prev.corpusResultsFilterDraft,
                                                        citationsMin: v ?? "",
                                                    },
                                                }))
                                            }
                                            styles={{root: {flex: 1, minWidth: 88}}}
                                        />
                                        <span className="app-results-filter-popover__dash" aria-hidden>
                                            –
                                        </span>
                                        <TextField
                                            ariaLabel="Maximum citations"
                                            placeholder="Max"
                                            value={this.state.corpusResultsFilterDraft.citationsMax}
                                            onChange={(_, v) =>
                                                this.setState((prev) => ({
                                                    corpusResultsFilterDraft: {
                                                        ...prev.corpusResultsFilterDraft,
                                                        citationsMax: v ?? "",
                                                    },
                                                }))
                                            }
                                            styles={{root: {flex: 1, minWidth: 88}}}
                                        />
                                    </Stack>
                                </div>
                                <div className="app-results-filter-popover__field">
                                    <Label>Source (venue)</Label>
                                    <TextField
                                        ariaLabel="Venue or source contains"
                                        placeholder="e.g. KDD, NeurIPS…"
                                        value={this.state.corpusResultsFilterDraft.venue}
                                        onChange={(_, v) =>
                                            this.setState((prev) => ({
                                                corpusResultsFilterDraft: {
                                                    ...prev.corpusResultsFilterDraft,
                                                    venue: v ?? "",
                                                },
                                            }))
                                        }
                                    />
                                </div>
                            </Stack>
                            <PrimaryButton
                                className="app-results-filter-popover__apply"
                                text="Apply"
                                onClick={() => {
                                    this.applyCorpusResultsFilters();
                                    Logger.logUIInteraction({
                                        component: "App",
                                        action: "results_filters_apply",
                                    });
                                }}
                                styles={{root: {width: "100%", marginTop: 20}}}
                            />
                        </div>
                    </Callout>
                    ) : null}
                    <Modal
                        isOpen={this.state.isResultPaperModalOpen}
                        onDismiss={this.closeResultPaperModal}
                        isBlocking={false}
                        layerProps={{ styles: { root: { zIndex: 1000005 } } }}
                        styles={{
                            main: {
                                maxWidth: "720px",
                                padding: "0",
                                borderRadius: "16px",
                                boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
                                overflow: "hidden",
                            },
                        }}
                    >
                        {(() => {
                            const navList = this.state.resultPaperNavList;
                            const navIdx = this.state.resultPaperNavIndex;
                            const navLen = navList.length;
                            const atStart = navLen === 0 || navIdx <= 0;
                            const atEnd = navLen === 0 || navIdx >= navLen - 1;
                            const loading = this.state.loadingResultPaperInfo;
                            const rp = this.state.resultPaperInfo;
                            return (
                                <div className="result-paper-modal result-paper-modal--summary">
                                    <div className="result-paper-modal__nav">
                                        <IconButton
                                            iconProps={{iconName: "Cancel"}}
                                            ariaLabel="Close"
                                            title="Close"
                                            onClick={this.closeResultPaperModal}
                                            className="result-paper-modal__nav-close"
                                        />
                                        <DefaultButton
                                            text="Previous"
                                            disabled={atStart || loading}
                                            iconProps={{iconName: "ChevronLeft"}}
                                            onClick={() => this.goResultPaperNav(-1)}
                                            className="result-paper-modal__nav-prev"
                                        />
                                        <span className="result-paper-modal__nav-spacer" />
                                        <DefaultButton
                                            text="Next"
                                            disabled={atEnd || loading}
                                            iconProps={{iconName: "ChevronRight"}}
                                            onClick={() => this.goResultPaperNav(1)}
                                            className="result-paper-modal__nav-next"
                                        />
                                    </div>
                                    <div className="result-paper-modal__body">
                                        {loading ? (
                                            <div className="result-paper-modal__loading">
                                                Loading details...
                                            </div>
                                        ) : rp ? (
                                            <div
                                                className="result-paper-summary"
                                                style={{
                                                    maxHeight: "70vh",
                                                    overflowY: "auto",
                                                }}
                                            >
                                                <h2 className="result-paper-summary__title">
                                                    {rp.Title}
                                                </h2>
                                                <div className="result-paper-summary__meta">
                                                    <b>Authors</b>:{" "}
                                                    {Array.isArray(rp.Authors)
                                                        ? rp.Authors.join(", ")
                                                        : rp.Authors || "N/A"}
                                                    <br />
                                                    <b>Source</b>:{" "}
                                                    {rp.Source || rp.Venue || "N/A"}
                                                    <br />
                                                    <b>Year</b>: {rp.Year || "N/A"}
                                                    <br />
                                                    <b>No. of Citations</b>:{" "}
                                                    {rp.CitationCounts || "N/A"}
                                                </div>
                                                <div className="result-paper-summary__block">
                                                    <b>Abstract</b>: {rp.Abstract || "N/A"}
                                                </div>
                                                <div className="result-paper-summary__block">
                                                    <b>Keywords</b>:{" "}
                                                    {Array.isArray(rp.Keywords)
                                                        ? rp.Keywords.join(", ")
                                                        : rp.Keywords || "N/A"}
                                                </div>
                                                <div className="result-paper-summary__actions">
                                                    <DefaultButton
                                                        text="Select"
                                                        iconProps={{iconName: "Locate"}}
                                                        onClick={() => {
                                                            const id = rp?.ID;
                                                            if (id != null) {
                                                                addToSelectNodeIDs(
                                                                    [id],
                                                                    "table"
                                                                );
                                                            }
                                                        }}
                                                    />
                                                    <DefaultButton
                                                        text="More Like This"
                                                        iconProps={{
                                                            iconName: "PlusCircle",
                                                        }}
                                                        disabled={isInSimilarInputPapers(
                                                            rp
                                                        )}
                                                        onClick={() => {
                                                            addToSimilarInputPapers(rp);
                                                        }}
                                                    />
                                                    <DefaultButton
                                                        text="Save"
                                                        iconProps={{iconName: "Save"}}
                                                        disabled={isInSavedPapers(rp)}
                                                        onClick={() => {
                                                            addToSavedPapers(rp);
                                                        }}
                                                    />
                                                    <DefaultButton
                                                        text="Google Scholar"
                                                        iconProps={{iconName: "Link"}}
                                                        onClick={() => {
                                                            if (rp?.Title) {
                                                                openGScholar(rp.Title);
                                                            }
                                                        }}
                                                    />
                                                    <DefaultButton
                                                        text="Close"
                                                        iconProps={{iconName: "Cancel"}}
                                                        onClick={
                                                            this.closeResultPaperModal
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="result-paper-modal__empty">
                                                No paper information available.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}
                    </Modal>

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

                    <LiteratureReviewPanel
                        isOpen={this.state.isPanelOpen}
                        onDismiss={() => {
                            // The paper detail modal renders on top of this panel. A single
                            // dismiss (e.g. Escape / overlay click) can bubble to both layers,
                            // so when the detail modal is open we only close that and keep the
                            // Literature Review panel open.
                            if (this.state.isResultPaperModalOpen) {
                                this.closeResultPaperModal();
                                return;
                            }
                            if (this.state.litReviewExploreOpen) {
                                this.closeLitReviewExplore();
                                return;
                            }
                            this.setState({isPanelOpen: false, litReviewExploreOpen: false});

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
                        checkoutLinkRef={this.state.checkoutLinkRef}
                        savedPapers={(this.state.dataSaved || []) as PaperRow[]}
                        chatProps={{
                            ...this.state.dialogStates['litReview'],
                            tabId: 'litReview',
                            updateDialogState: (updatedState: any) =>
                                this.updateDialogState('litReview', updatedState),
                            addToSelectNodeIDs: addToSelectNodeIDs,
                            addToSimilarInputPapers: addToSimilarInputPapers,
                            addToSavedPapers: addToSavedPapers,
                            isInSimilarInputPapers: isInSimilarInputPapers,
                            isInSavedPapers: isInSavedPapers,
                            isInSelectedNodeIDs: isInSelectedNodeIDs,
                            queuedCorpusQuestionPaper: this.state.litReviewAskQueue,
                            onConsumeQueuedCorpusQuestionPaper: () =>
                                this.setState({ litReviewAskQueue: null }),
                        }}
                        savedActions={{
                            onAsk: (paper: PaperRow) =>
                                this.setState({
                                    litReviewAskQueue: {
                                        id: paper.ID,
                                        title: paper.Title || "(No title)",
                                        token: Date.now(),
                                    },
                                }),
                            onSummarize: (paper: PaperRow) =>
                                this.summarizeSinglePaper(paper),
                            onDelete: (paper: PaperRow) =>
                                this.removeSavedPaper(paper),
                        }}
                        canUndoDelete={this.state.deletedSavedPaperUndoStack.length > 0}
                        undoCount={this.state.deletedSavedPaperUndoStack.length}
                        onUndoDelete={this.undoRemoveSavedPaper}
                        onShowPaperDetail={(paper: PaperRow, navList: PaperRow[]) =>
                            this.openResultPaperModalWithNav(paper, "summary", navList)
                        }
                        onExplorePaper={(paper: PaperRow, navList: PaperRow[]) =>
                            this.openLitReviewExplore(paper, navList)
                        }
                        isExploring={this.state.litReviewExploreOpen}
                        exploreView={
                            this.state.litReviewExploreOpen ? (
                                <ResultPaperExplore
                                    rp={this.state.litReviewPaperInfo}
                                    loading={this.state.litReviewLoadingPaperInfo}
                                    atStart={
                                        this.state.litReviewNavList.length === 0 ||
                                        this.state.litReviewNavIndex <= 0
                                    }
                                    atEnd={
                                        this.state.litReviewNavList.length === 0 ||
                                        this.state.litReviewNavIndex >=
                                            this.state.litReviewNavList.length - 1
                                    }
                                    onClose={() => this.closeLitReviewExplore()}
                                    onPrev={() => this.goLitReviewNav(-1)}
                                    onNext={() => this.goLitReviewNav(1)}
                                    contentRef={this.resultsExploreContentRef}
                                    getHighlightOps={(id) => this.getResultHighlightOps(id)}
                                    getHighlightOpsForField={(id, f) =>
                                        this.getResultHighlightOpsForField(
                                            id,
                                            f as ResultHighlightOp["field"]
                                        )
                                    }
                                    renderHighlightedText={(t, o) =>
                                        this.renderHighlightedText(
                                            t,
                                            o as ResultHighlightOp[]
                                        )
                                    }
                                    onHighlight={this.applyResultHighlight}
                                    onUndo={this.undoResultHighlight}
                                    onClear={this.clearResultHighlights}
                                    onAsk={(p) =>
                                        this.setState({
                                            litReviewAskQueue: {
                                                id: p.ID,
                                                title: p.Title || "(No title)",
                                                token: Date.now(),
                                            },
                                        })
                                    }
                                    onSummarize={(p) => this.summarizeSinglePaper(p)}
                                    onDelete={(p) => {
                                        this.removeSavedPaper(p);
                                        this.closeLitReviewExplore();
                                    }}
                                    onGScholar={(t) => openGScholar(t)}
                                />
                            ) : null
                        }
                    />

                </LoadingOverlay>
            </>
        );
    }
}

// export default hot(module)(App);
export default App