import * as React from "react";
import "./../assets/scss/App.scss";
import { ActionButton, DefaultButton, IconButton, Modal, Stack } from "@fluentui/react";
import { observer } from "mobx-react";
import { getPaperByTitle } from "./../request";
import Markdown from "react-markdown";
import { Logger } from "../socket/logger";
import { API_BASE_URL } from '../config';

const baseUrl = `${API_BASE_URL}/`;

// ✅ Define getPaperById at the top level
export async function getPaperById(id: string) {
  const res = await fetch(`${baseUrl}getPaperById?id=${id}`);
  return res.json();
}




////////////////////////////////////////////////////////////////////// modified code
// Parse paper title and ID from raw string
// const parseTitleAndId = (raw: string) => {
//   const match = raw.match(/\[\[ID:([^\]]+)\]\]/); // Match [[ID:xxx]]
//   const id = match ? match[1] : null;

//   let title = raw;

//   // Check if there's a "Title:" prefix (handle both **Title:** and Title:)
//   const titleMatch = raw.match(/\*{0,2}Title:\*{0,2}\s*([^\[.\n]+)/i);
//   if (titleMatch) {
//     title = titleMatch[1].trim();
//     // Remove trailing period if present
//     title = title.replace(/\.\s*$/, '');
//   } else if (id) {
//     // Extract everything before [[ID:xxx]]
//     const beforeId = raw.split('[[ID:')[0].trim();

//     // Remove any metadata after the title (could be inline or on same line)
//     // Pattern matches: Authors:, Year:, Source:, Venue:, etc.
//     title = beforeId
//       .split(/\n/)[0]  // Take only first line if multiline
//       .replace(/\s+(Authors?:|Year:|Source:|Venue:|ID:).*$/gi, '')  // Remove inline metadata
//       .replace(/\.\s*$/, '')  // Remove trailing period
//       .trim();
//   }

//   console.log("parseTitleAndId → raw:", raw, "title:", title, "id:", id);
//   return { title, id };
// };

const parseTitleAndId = (raw: string) => {
  // 1) Extract ID (various formats supported)
  const idMatch = raw.match(/(?:<!--ID:([\w-]+)-->|\[\[ID:([^\]]+)\]\])/i);
  const extractedId = idMatch ? (idMatch[1] || idMatch[2]) : null;

  // 2) Extract title
  const titleMatch = raw.match(/Title:\s*([^\n\.<]+)/i);
  const title = titleMatch ? titleMatch[1].trim() : null;

  // 3) Build fallback key (only for UI, never used in backend queries)
  const fallbackKey = extractedId || (title
    ? `temp_${title.replace(/\s+/g, "_").toLowerCase()}`
    : `temp_raw_${raw.slice(0, 20).replace(/\s+/g, "_")}`);

  return { id: extractedId, title, key: fallbackKey };
};

async function fetchPaper(id: string | null, title: string | null) {
  try {
    if (id && !id.startsWith("temp_")) {
      const res = await getPaperById(id);
      const paper = Array.isArray(res) ? res[0] : (res?.data || res);
      if (paper && paper.ID) return paper;
    }

    // Fallback to title
    if (title) {
      const papers = await getPaperByTitle(title);
      if (papers && papers.length > 0) return papers[0];
    }

    return null;
  } catch (err) {
    console.error("fetchPaper error:", err);
    return null;
  }
}
/////////////////////////////////////////////////////////////






export const Dialog = observer(({ props }) => {
  const {
    chatText,
    chatHistory,
    chatSelectedPaper,
    displayMessages: savedDisplayMessages,
    chatSessionId,
    updateDialogState,
    addToSelectNodeIDs,
    addToSimilarInputPapers,
    addToSavedPapers,
    isInSimilarInputPapers,
    isInSavedPapers,
    isInSelectedNodeIDs,
  } = props;




//////////////////////////////////////////////////////////////////// modified code
  // Ensure chatSessionId is always set (create on first use if missing)
  // const sessionId = React.useMemo(() => {
  //   if (chatSessionId) {
  //     return chatSessionId;
  //   }
  //   const newId = `chat_${Date.now()}`;
  //   updateDialogState({ chatSessionId: newId });
  //   return newId;
  // }, [chatSessionId]);

  // const [displayMessages, setDisplayMessages] = React.useState<
  //   { role: "user" | "ai"; text: string }[]
  // >(savedDisplayMessages || []);

  const [displayMessages, setDisplayMessages] = React.useState<{ role: "user" | "ai"; text: string }[]>(
    chatHistory || [] 
  );

  const [retrievedPapers, setRetrievedPapers] = React.useState<{title: string, id: string | null, key: string}[]>([]);

///////////////////////////////////////////////////////////////////








  const [isWaiting, setIsWaiting] = React.useState(false);

  // Paper info modal state
  const [isModalOpen, setModalState] = React.useState(false);
  const [paperInfo, setPaperInfo] = React.useState<any>(null);
  const [loadingPaperInfo, setLoadingPaperInfo] = React.useState(false);

  // Function to open paper info modal
  const openPaperInfoModal = async (title: string, id: string | null) => {
    setLoadingPaperInfo(true);
    setModalState(true);
    
    try {
      let paper = null;
      if (id) {
        paper = await getPaperById(id);
      } else {
        const papers = await getPaperByTitle(title);
        paper = papers.length > 0 ? papers[0] : null;
      }
      
      if (paper) {
        setPaperInfo(paper);
        Logger.logUIInteraction({
          component: "Dialog",
          action: "paperInfoModalOpen",
          paperTitle: title,
          paperId: paper.ID || id,
        });
      } else {
        setPaperInfo(null);
      }
    } catch (error) {
      console.error("Error fetching paper info:", error);
      setPaperInfo(null);
    }
    setLoadingPaperInfo(false);
  };





///////////////////////////////////////////////////////// modified code
      // Sync displayMessages to dialogStates whenever it changes
      // React.useEffect(() => {
      //   updateDialogState({ displayMessages });
      // }, [displayMessages]);

      React.useEffect(() => {
        setDisplayMessages(chatHistory || []);
    }, [chatHistory]);
/////////////////////////////////////////////////////////



  const textareaRef = React.useRef<HTMLTextAreaElement>(null);



//////////////////////////////////////////////////////////////// modified code
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const chatMessagesContainerRef = React.useRef<HTMLDivElement>(null);

  // Removed auto-scroll on every chatHistory change to prevent page jumping
/////////////////////////////////////////////////////////////////




  const prevMessageCountRef = React.useRef(0);

  // Auto scroll to the latest message only when new messages are added
  React.useEffect(() => {
    // Only scroll if messages were actually added (not on initial render)
    if (displayMessages.length > prevMessageCountRef.current && chatMessagesContainerRef.current) {
      // Scroll only within the chat container, not the entire page
      chatMessagesContainerRef.current.scrollTop = chatMessagesContainerRef.current.scrollHeight;
    }
    prevMessageCountRef.current = displayMessages.length;

    // Reset button states when a new AI message is added
    if (displayMessages.length > 0 && displayMessages[displayMessages.length - 1].role === "ai") {
      setButtonsClicked({ locateAll: false, addAll: false, saveAll: false });
    }
  }, [displayMessages, isWaiting]);

  // Handle Enter key to send message
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent newline
      if (chatText.trim()) {
        Logger.logUIInteraction({
          component: "Dialog",
          action: "askButtonClick",
          value: chatText,
          chatHistoryLength: chatHistory.length,
          trigger: "enter_key",
        });
        chatRequest();
      }
    }
  };

  const onChangeChatText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    updateDialogState({ chatText: newText });

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;

      const lineHeight = 24;
      const maxHeight = lineHeight * 3;
      if (textareaRef.current.scrollHeight > maxHeight) {
        textareaRef.current.style.height = `${maxHeight}px`;
        textareaRef.current.style.overflowY = "auto";
      } else {
        textareaRef.current.style.overflowY = "hidden";
      }
    }
  };

  const currentAIResponseText = React.useCallback(() => {
    for (let i = displayMessages.length - 1; i >= 0; i--) {
      if (displayMessages[i].role === "ai") return displayMessages[i].text || "";
    }
    return "";
  }, [displayMessages]);

  // Extract all papers from the current AI response
  const extractAllPapers = React.useCallback(() => {
    const text = currentAIResponseText();
    const papers: { title: string; id: string | null }[] = [];

    // Match paper titles in format: **Title: xxx [[ID:yyy]]** or **Title:** xxx [[ID:yyy]]
    const titlePattern = /\*\*Title:\*\*\s*([^\[]+)\s*\[\[ID:([^\]]+)\]\]/gi;
    let match;

    while ((match = titlePattern.exec(text)) !== null) {
      const title = match[1].trim();
      const id = match[2].trim();
      papers.push({ title, id });
    }

    // Also match list items: Title: xxx [[ID:yyy]]
    const listPattern = /Title:\s*([^\[]+)\s*\[\[ID:([^\]]+)\]\]/gi;
    while ((match = listPattern.exec(text)) !== null) {
      const title = match[1].trim();
      const id = match[2].trim();
      // Check if not already added
      if (!papers.some(p => p.id === id)) {
        papers.push({ title, id });
      }
    }

    return papers;
  }, [currentAIResponseText]);

  // State to track which buttons have been clicked
  const [buttonsClicked, setButtonsClicked] = React.useState({
    locateAll: false,
    addAll: false,
    saveAll: false
  });



///////////////////////////////////////////////////////////////// modified code
  const chatRequest = () => {
    if (!chatText.trim()) return;

    // 1. Clear previous retrieval state
    setRetrievedPapers([]); 
    setIsWaiting(true);

    // 2. Optimistically add the USER message to the UI immediately
    const userMessage = { role: "user", text: chatText };
    
    // Update global state with the new user message
    updateDialogState((prev: any) => ({
      chatHistory: [...prev.chatHistory, userMessage],
      chatText: "", // Clear input
    }));

    // Prepare history to send to backend (existing history + new user msg)
    const baseHistory = [...chatHistory, userMessage];

    // 3. Start the Fetch Request
    fetch(`${baseUrl}chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: props.tabId,
        text: chatText,
        chat_history_raw: baseHistory,
      }),
    }).then((response) => {
      // 4. Initialize the Stream Reader
      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      
      let partialResponse = ""; // Accumulates the full text for final processing
      let isFirstChunk = true;

      // 5. Define the Recursive Reader Function
      const readChunk = ({ done, value }: ReadableStreamReadResult<Uint8Array>) => {
        // --- CASE A: Stream is Finished ---
        if (done) {
          setIsWaiting(false);
          
          // Parse all papers found in the complete response for the "ALL" buttons
          const papers: { title: string; id: string | null; key: string }[] = [];
          const lines = partialResponse.split("\n");

          for (const line of lines) {
            const { id, title, key } = parseTitleAndId(line);
            if (key && !papers.some((p) => p.key === key)) {
               // Only add if it looks like a valid paper line
               if(title) papers.push({ id, title, key });
            }
          }
          console.log("Stream complete. Papers found:", papers);
          setRetrievedPapers(papers);
          return;
        }

        // --- CASE B: Process New Chunk ---
        const newTextChunk = decoder.decode(value);
        partialResponse += newTextChunk;

        // If this is the very first bit of text, create the "AI" message bubble
        if (isFirstChunk) {
          isFirstChunk = false;
          setIsWaiting(false); // Stop the "Thinking..." spinner
          
          updateDialogState((prev: any) => ({
            chatHistory: [...prev.chatHistory, { role: "ai", text: "" }],
          }));
        }

        // Append the new chunk to the *last* message (the AI's message)
        updateDialogState((prev: any) => {
          const historyCopy = [...prev.chatHistory];
          const lastMsgIndex = historyCopy.length - 1;
          const lastMsg = historyCopy[lastMsgIndex];

          if (lastMsg && lastMsg.role === "ai") {
            historyCopy[lastMsgIndex] = {
              ...lastMsg,
              text: lastMsg.text + newTextChunk,
            };
          }
          return { chatHistory: historyCopy };
        });

        // Read the next chunk
        reader.read().then(readChunk);
      };

      // Kick off the reading loop
      reader.read().then(readChunk);
    }).catch(err => {
      console.error("Stream error:", err);
      setIsWaiting(false);
    });
  };
/////////////////////////////////////////////////////////////////





  const extractText = (children: React.ReactNode): string => {
    if (typeof children === "string") return children;
    if (Array.isArray(children)) {
      return children.map((child) => extractText(child)).join(" ");
    }
    if (React.isValidElement(children)) {
      return extractText(children.props.children);
    }
    return "";
  };

  // Helper function to check if text is part of a summary (not an individual paper)
  const isSummaryText = (text: string): boolean => {
    // Summary text characteristics:
    // - Doesn't start with "Title:"
    // - Contains narrative text (commas, parentheses, conjunctions)
    // - May contain multiple [[ID:xxx]] references

    if (!text || text.trim().startsWith("Title:")) {
      return false;
    }

    // Check if it's embedded in parentheses (common in summaries)
    if (/^\s*\(/i.test(text) || /\)\s*$/i.test(text)) {
      return true;
    }

    // Check if it contains summary-like patterns or narrative structure
    const hasSummaryKeywords = /short summary|results include|highlights?|guidance|survey|taxonomy|special issues|applied collections/i.test(text);
    const hasNarrativeStructure = /[,()]/g.test(text) && text.length > 50;

    // Check if it contains multiple [[ID:xxx]] references (indicates it's a summary paragraph)
    const idMatches = text.match(/\[\[ID:[^\]]+\]\]/g);
    const hasMultipleIDs = idMatches && idMatches.length > 1;

    return hasSummaryKeywords || hasNarrativeStructure || hasMultipleIDs;
  };

  // Helper function to strip [[ID:xxx]] tags from text
  const stripIDTags = (text: string): string => {
    return text.replace(/\[\[ID:[^\]]+\]\]/g, '').trim();
  };




  // Helper function to check if a line is metadata (Authors, Year, Source, etc.)
  const isMetadataLine = (text: string): boolean => {
    if (!text) return false;
    const trimmed = text.trim();

    // Match lines like "**Authors:** ...", "**Year:** ...", "**Source:** ...", etc.
    const metadataPattern = /^\*{0,2}(Authors?|Year|Source|Venue|ID):\*{0,2}/i;

    // Also match standalone "ID: xxx" lines
    const standaloneIdPattern = /^ID:\s*\d+\s*$/i;

    return metadataPattern.test(trimmed) || standaloneIdPattern.test(trimmed);
  };




////////////////////////////////////////////////////////////////////////////////////// modified code
  // const renderPaperBlock = (title: string, id: string | null, raw: string) => {
  //   // 🔹 Check if this is summary text (not an individual paper)
  //   if (isSummaryText(raw)) {
  //     // For summary text, strip ID tags and display as normal text
  //     const cleanedText = stripIDTags(raw);
  //     return <span>{cleanedText}</span>;
  //   }

  //   // 🔹 If no Title was parsed OR title === raw text, then it's not a paper title
  //   if (!id && (!title || title === raw)) {
  //     return <span>{raw}</span>; // Normal text → display as is
  //   }

  //   // Check if buttons should be disabled
  //   const paperObj = { ID: id };
  //   const isAlreadySelected = id && isInSelectedNodeIDs && isInSelectedNodeIDs(id);
  //   const isAlreadyInSimilar = id && isInSimilarInputPapers && isInSimilarInputPapers(paperObj);
  //   const isAlreadySaved = id && isInSavedPapers && isInSavedPapers(paperObj);

  //   // 🔹 Otherwise it's a paper title → render in blue + show buttons
  //   return (
  //     <div style={{ marginBottom: "0.5em" }}>
  //       <span
  //         style={{ color: "blue", fontWeight: "bold", cursor: "pointer" }}
  //         onClick={() => {
  //           // 🟣 Open paper info modal when clicking on paper title
  //           Logger.logUIInteraction({
  //             component: "Dialog",
  //             action: "selectPaperFromResponse",
  //             paperTitle: title,
  //             previousSelectedPaper: chatSelectedPaper,
  //             paperId: id || undefined,
  //           });
  //           updateDialogState({ chatSelectedPaper: title });
  //           // Open info modal
  //           openPaperInfoModal(title, id);
  //         }}
  //       >
  //         {title}
  //       </span>

  //       <div style={{ marginTop: "0.2em" }}>
  //         <DefaultButton
  //           iconProps={{ iconName: "Locate" }}
  //           styles={{ root: { marginRight: "0.3em", minWidth: 0 } }}
  //           disabled={isAlreadySelected}
  //           onClick={() => {
  //             // 🔍 Locate (by ID first, else by title) + logs
  //             if (id) {
  //               Logger.logUIInteraction({
  //                 component: "Dialog",
  //                 action: "locateSelectedPaper",
  //                 paperTitle: title,
  //                 paperId: id,
  //               });
  //               getPaperById(id).then((paper) => {
  //                 if (paper && paper["ID"] != null) {
  //                   Logger.logUIInteraction({
  //                     component: "Dialog",
  //                     action: "locateSelectedPaperSuccess",
  //                     paperTitle: title,
  //                     paperId: paper["ID"],
  //                     via: "id",
  //                   });
  //                   addToSelectNodeIDs([paper["ID"]], "scatterplot");
  //                 } else {
  //                   Logger.logUIInteraction({
  //                     component: "Dialog",
  //                     action: "locateSelectedPaperNotFound",
  //                     paperTitle: title,
  //                     paperId: id,
  //                     via: "id",
  //                   });
  //                 }
  //               });
  //             } else {
  //               Logger.logUIInteraction({
  //                 component: "Dialog",
  //                 action: "locateSelectedPaper",
  //                 paperTitle: title,
  //               });
  //               getPaperByTitle(title).then((papers) => {
  //                 if (papers.length > 0) {
  //                   Logger.logUIInteraction({
  //                     component: "Dialog",
  //                     action: "locateSelectedPaperSuccess",
  //                     paperTitle: title,
  //                     paperId: papers[0].ID,
  //                     papersFound: papers.length,
  //                     via: "title",
  //                   });
  //                   addToSelectNodeIDs(papers.map((d) => d["ID"]), "scatterplot");
  //                 } else {
  //                   Logger.logUIInteraction({
  //                     component: "Dialog",
  //                     action: "locateSelectedPaperNotFound",
  //                     paperTitle: title,
  //                     via: "title",
  //                   });
  //                 }
  //               });
  //             }
  //           }}
  //         />

  //         <DefaultButton
  //           iconProps={{ iconName: "PlusCircle" }}
  //           styles={{ root: { marginRight: "0.3em", minWidth: 0 } }}
  //           disabled={isAlreadyInSimilar}
  //           onClick={() => {
  //             // ➕ Add to similar input + logs
  //             if (id) {
  //               Logger.logUIInteraction({
  //                 component: "Dialog",
  //                 action: "addSelectedPaperToSimilarInput",
  //                 paperTitle: title,
  //                 paperId: id,
  //               });
  //               getPaperById(id).then((paper) => {
  //                 if (paper) {
  //                   Logger.logUIInteraction({
  //                     component: "Dialog",
  //                     action: "addSelectedPaperToSimilarInputSuccess",
  //                     paperTitle: title,
  //                     paperId: paper["ID"],
  //                   });
  //                   addToSimilarInputPapers(paper);
  //                 } else {
  //                   Logger.logUIInteraction({
  //                     component: "Dialog",
  //                     action: "addSelectedPaperToSimilarInputNotFound",
  //                     paperTitle: title,
  //                     paperId: id,
  //                   });
  //                 }
  //               });
  //             } else {
  //               Logger.logUIInteraction({
  //                 component: "Dialog",
  //                 action: "addSelectedPaperToSimilarInput",
  //                 paperTitle: title,
  //               });
  //               getPaperByTitle(title).then((papers) => {
  //                 if (papers.length > 0) {
  //                   Logger.logUIInteraction({
  //                     component: "Dialog",
  //                     action: "addSelectedPaperToSimilarInputSuccess",
  //                     paperTitle: title,
  //                     paperId: papers[0].ID,
  //                   });
  //                   addToSimilarInputPapers(papers[0]);
  //                 } else {
  //                   Logger.logUIInteraction({
  //                     component: "Dialog",
  //                     action: "addSelectedPaperToSimilarInputNotFound",
  //                     paperTitle: title,
  //                   });
  //                 }
  //               });
  //             }
  //           }}
  //         />

  //         <DefaultButton
  //           iconProps={{ iconName: "Save" }}
  //           styles={{ root: { minWidth: 0 } }}
  //           disabled={isAlreadySaved}
  //           onClick={() => {
  //             // 💾 Save + logs
  //             if (id) {
  //               Logger.logUIInteraction({
  //                 component: "Dialog",
  //                 action: "saveSelectedPaper",
  //                 paperTitle: title,
  //                 paperId: id,
  //               });
  //               getPaperById(id).then((paper) => {
  //                 if (paper) {
  //                   Logger.logUIInteraction({
  //                     component: "Dialog",
  //                     action: "saveSelectedPaperSuccess",
  //                     paperTitle: title,
  //                     paperId: paper["ID"],
  //                   });
  //                   addToSavedPapers(paper);
  //                 } else {
  //                   Logger.logUIInteraction({
  //                     component: "Dialog",
  //                     action: "saveSelectedPaperNotFound",
  //                     paperTitle: title,
  //                     paperId: id,
  //                   });
  //                 }
  //               });
  //             } else {
  //               Logger.logUIInteraction({
  //                 component: "Dialog",
  //                 action: "saveSelectedPaper",
  //                 paperTitle: title,
  //               });
  //               getPaperByTitle(title).then((papers) => {
  //                 if (papers.length > 0) {
  //                   Logger.logUIInteraction({
  //                     component: "Dialog",
  //                     action: "saveSelectedPaperSuccess",
  //                     paperTitle: title,
  //                     paperId: papers[0].ID,
  //                   });
  //                   addToSavedPapers(papers[0]);
  //                 } else {
  //                   Logger.logUIInteraction({
  //                     component: "Dialog",
  //                     action: "saveSelectedPaperNotFound",
  //                     paperTitle: title,
  //                   });
  //                 }
  //               });
  //             }
  //           }}
  //         />
  //       </div>
  //     </div>
  //   );
  // };

  const renderPaperBlock = (title: string, id: string | null, raw: string) => {
    // 1. If it's not a valid paper title line, just render cleaned text
    if (!title || title === raw || !/Title:\s*[^\n]+/i.test(raw)) {
      const cleaned = raw.replace(/\[\[ID:[^\]]+\]\]/g, "");
      return <span>{cleaned}</span>;
    }
  
    // 2. Clean the title (remove ID tags)
    const cleanTitle = title.replace(/\[\[ID:[^\]]+\]\]/g, "").trim();
  
    // 3. Extract the Summary (Remove Title line and ID tags from the raw block)
    const summary = raw
      .replace(/\*\*Title:[\s\S]*?\[\[ID:[^\]]+\]\]\*\*/gi, "")
      .replace(/Title:\s*[^\n]+/gi, "")
      .replace(/<!--ID:[^>]+-->/g, "")
      .replace(/\[\[ID:[^\]]+\]\]/g, "")
      .trim();
  
    // Check if buttons should be disabled
    const paperObj = { ID: id };
    const isAlreadySelected = id && isInSelectedNodeIDs && isInSelectedNodeIDs(id);
    const isAlreadyInSimilar = id && isInSimilarInputPapers && isInSimilarInputPapers(paperObj);
    const isAlreadySaved = id && isInSavedPapers && isInSavedPapers(paperObj);
  
    // 🔹 Otherwise it's a paper title → render in blue + show buttons
    return (
      <div style={{ marginBottom: "0.5em" }}>
        <span
          style={{ color: "blue", fontWeight: "bold", cursor: "pointer" }}
          onClick={() => {
            // Open paper info modal when clicking on paper title
            Logger.logUIInteraction({
              component: "Dialog",
              action: "selectPaperFromResponse",
              paperTitle: title,
              previousSelectedPaper: chatSelectedPaper,
              paperId: id || undefined,
            });
            updateDialogState({ chatSelectedPaper: title });
            // Open info modal
            openPaperInfoModal(title, id);
          }}
        >
          {cleanTitle}             
        </span>
  
        <div style={{ marginTop: "0.2em" }}>
          <DefaultButton
            iconProps={{ iconName: "Locate" }}
            styles={{ root: { marginRight: "0.3em", minWidth: 0 } }}
            disabled={isAlreadySelected}
            onClick={() => {
              // Locate (by ID first, else by title) + logs
              if (id) {
                Logger.logUIInteraction({
                  component: "Dialog",
                  action: "locateSelectedPaper",
                  paperTitle: title,
                  paperId: id,
                });
                getPaperById(id).then((paper) => {
                  if (paper && paper["ID"] != null) {
                    Logger.logUIInteraction({
                      component: "Dialog",
                      action: "locateSelectedPaperSuccess",
                      paperTitle: title,
                      paperId: paper["ID"],
                      via: "id",
                    });
                    addToSelectNodeIDs([paper["ID"]], "scatterplot");
                  } else {
                    Logger.logUIInteraction({
                      component: "Dialog",
                      action: "locateSelectedPaperNotFound",
                      paperTitle: title,
                      paperId: id,
                      via: "id",
                    });
                  }
                });
              } else {
                Logger.logUIInteraction({
                  component: "Dialog",
                  action: "locateSelectedPaper",
                  paperTitle: title,
                });
                getPaperByTitle(title).then((papers) => {
                  if (papers.length > 0) {
                    Logger.logUIInteraction({
                      component: "Dialog",
                      action: "locateSelectedPaperSuccess",
                      paperTitle: title,
                      paperId: papers[0].ID,
                      papersFound: papers.length,
                      via: "title",
                    });
                    addToSelectNodeIDs(papers.map((d) => d["ID"]), "scatterplot");
                  } else {
                    Logger.logUIInteraction({
                      component: "Dialog",
                      action: "locateSelectedPaperNotFound",
                      paperTitle: title,
                      via: "title",
                    });
                  }
                });
              }
            }}
          />
  
          <DefaultButton
            iconProps={{ iconName: "PlusCircle" }}
            styles={{ root: { marginRight: "0.3em", minWidth: 0 } }}
            disabled={isAlreadyInSimilar}
            onClick={() => {
              // ➕ Add to similar input + logs
              if (id) {
                Logger.logUIInteraction({
                  component: "Dialog",
                  action: "addSelectedPaperToSimilarInput",
                  paperTitle: title,
                  paperId: id,
                });
                getPaperById(id).then((paper) => {
                  if (paper) {
                    Logger.logUIInteraction({
                      component: "Dialog",
                      action: "addSelectedPaperToSimilarInputSuccess",
                      paperTitle: title,
                      paperId: paper["ID"],
                    });
                    addToSimilarInputPapers(paper);
                  } else {
                    Logger.logUIInteraction({
                      component: "Dialog",
                      action: "addSelectedPaperToSimilarInputNotFound",
                      paperTitle: title,
                      paperId: id,
                    });
                  }
                });
              } else {
                Logger.logUIInteraction({
                  component: "Dialog",
                  action: "addSelectedPaperToSimilarInput",
                  paperTitle: title,
                });
                getPaperByTitle(title).then((papers) => {
                  if (papers.length > 0) {
                    Logger.logUIInteraction({
                      component: "Dialog",
                      action: "addSelectedPaperToSimilarInputSuccess",
                      paperTitle: title,
                      paperId: papers[0].ID,
                      papersFound: papers.length,
                      via: "title",
                    });
                    addToSimilarInputPapers(papers[0]);
                  } else {
                    Logger.logUIInteraction({
                      component: "Dialog",
                      action: "addSelectedPaperToSimilarInputNotFound",
                      paperTitle: title,
                    });
                  }
                });
              }
            }}
          />
  
          <DefaultButton
            iconProps={{ iconName: "Save" }}
            styles={{ root: { minWidth: 0 } }}
            disabled={isAlreadySaved}
            onClick={() => {
              // Save + logs
              if (id) {
                Logger.logUIInteraction({
                  component: "Dialog",
                  action: "saveSelectedPaper",
                  paperTitle: title,
                  paperId: id,
                });
                getPaperById(id).then((paper) => {
                  if (paper) {
                    Logger.logUIInteraction({
                      component: "Dialog",
                      action: "saveSelectedPaperSuccess",
                      paperTitle: title,
                      paperId: paper["ID"],
                    });
                    addToSavedPapers(paper);
                  } else {
                    Logger.logUIInteraction({
                      component: "Dialog",
                      action: "saveSelectedPaperNotFound",
                      paperTitle: title,
                      paperId: id,
                    });
                  }
                });
              } else {
                Logger.logUIInteraction({
                  component: "Dialog",
                  action: "saveSelectedPaper",
                  paperTitle: title,
                });
                getPaperByTitle(title).then((papers) => {
                  if (papers.length > 0) {
                    Logger.logUIInteraction({
                      component: "Dialog",
                      action: "saveSelectedPaperSuccess",
                      paperTitle: title,
                      paperId: papers[0].ID,
                      papersFound: papers.length,
                      via: "title",
                    });
                    addToSavedPapers(papers[0]);
                  } else {
                    Logger.logUIInteraction({
                      component: "Dialog",
                      action: "saveSelectedPaperNotFound",
                      paperTitle: title,
                    });
                  }
                });
              }
            }}
          />
        </div>
        {/* 📝 Render the extracted summary text */}
        {summary && (
          <div
            style={{
              color: "#333",
              fontSize: "0.95rem",
              lineHeight: "1.5em",
              whiteSpace: "pre-wrap",
              marginLeft: "0.2em",
              marginTop: "0.5em"
            }}
          >
            {summary}
          </div>
        )}
      </div>
    );
  };
/////////////////////////////////////////////////////////////////////////////////




  return (
    <div className="chat-window">
      {/* Chat messages */}
      <div className="chat-messages" ref={chatMessagesContainerRef}>
        {displayMessages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble ${msg.role}`}>
            {msg.role === "user" ? (
              `${msg.text}`
            ) : (
              <div>
                
                <Markdown
                  components={{
                    strong: ({ node, ...props }) => {
                      const raw = extractText(props.children);

                      // Filter out metadata lines completely
                      if (isMetadataLine(raw)) {
                        return null;
                      }

                      const { title, id } = parseTitleAndId(raw);
                      return renderPaperBlock(title, id, raw);
                    },
                    li: ({ node, children }) => {
                      const raw = extractText(children);

                      // Filter out metadata lines in list items
                      if (isMetadataLine(raw)) {
                        return null;
                      }

                      const { title, id } = parseTitleAndId(raw);
                      return renderPaperBlock(title, id, raw);
                    },
                    p: ({ node, children }) => {
                      const raw = extractText(children);

                      // Filter out metadata lines
                      if (isMetadataLine(raw)) {
                        return null;
                      }

                      // Check if paragraph contains summary text with IDs
                      if (raw && /\[\[ID:[^\]]+\]\]/g.test(raw)) {
                        // Check if this looks like a summary paragraph
                        if (isSummaryText(raw)) {
                          const cleanedText = stripIDTags(raw);
                          return <p>{cleanedText}</p>;
                        }
                      }

                      // Otherwise render normally
                      return <p>{children}</p>;
                    },
                    // Also filter metadata in plain text nodes
                    text: ({ node, ...props }) => {
                      const text = props.children as string;
                      if (typeof text === 'string' && isMetadataLine(text)) {
                        return null;
                      }
                      return <>{text}</>;
                    },
                  }}
                >
                  {msg.text}
                </Markdown>
              </div>
            )}
          </div>
        ))}

        {isWaiting && (
          <div className="chat-bubble ai">
            <span className="spinner"></span> THINKING...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="chat-input-area">
        <div className="chat-input-row">
          <textarea
            ref={textareaRef}
            className="chat-input"
            value={chatText}
            onChange={onChangeChatText}
            onKeyDown={onKeyDown}
            placeholder="Type your message"
            rows={1}
          />
          <DefaultButton
            className="iconButton"
            styles={{ root: { padding: "0 1rem", minWidth: 0 } }}
            onClick={() => {
              // 🔵 Ported Ask button click log
              Logger.logUIInteraction({
                component: "Dialog",
                action: "askButtonClick",
                value: chatText,
                chatHistoryLength: chatHistory.length,
              });
              chatRequest();
            }}
            iconProps={{ iconName: "Rocket" }}
            text="Ask"
          />
        </div>

        <div className="chat-action-row" style={{ display: 'flex', flexWrap: 'nowrap', alignItems: 'center', gap: '4px' }}>
          <DefaultButton
            text="ALL"
            iconProps={{ iconName: "Locate" }}
            styles={{ root: { minWidth: 0, padding: "0 6px" } }}
            disabled={buttonsClicked.locateAll}
            onClick={async () => {
              const papers = extractAllPapers();
              Logger.logUIInteraction({
                component: "Dialog",
                action: "selectAllPapers",
                responseLength: currentAIResponseText().length,
                paperCount: papers.length,
              });

              if (papers.length === 0) {
                console.log("No papers found in response");
                return;
              }

              // Collect all paper IDs
              const paperIds: string[] = [];
              for (const paper of papers) {
                if (paper.id) {
                  paperIds.push(paper.id);
                }
              }

              if (paperIds.length > 0) {
                addToSelectNodeIDs(paperIds, "scatterplot");
                setButtonsClicked(prev => ({ ...prev, locateAll: true }));
              }
            }}
          />
          <DefaultButton
            text="ALL"
            iconProps={{ iconName: "PlusCircle" }}
            styles={{ root: { minWidth: 0, padding: "0 6px" } }}
            disabled={buttonsClicked.addAll}
            onClick={async () => {
              const papers = extractAllPapers();
              Logger.logUIInteraction({
                component: "Dialog",
                action: "addAllToSimilarInputPapers",
                responseLength: currentAIResponseText().length,
                paperCount: papers.length,
              });

              if (papers.length === 0) {
                console.log("No papers found in response");
                return;
              }

              // Add all papers to similar input
              for (const paper of papers) {
                if (paper.id) {
                  try {
                    const paperObj = await getPaperById(paper.id);
                    if (paperObj) {
                      addToSimilarInputPapers(paperObj);
                    }
                  } catch (e) {
                    console.error(`Failed to fetch paper ${paper.id}:`, e);
                  }
                }
              }
              setButtonsClicked(prev => ({ ...prev, addAll: true }));
            }}
          />
          <DefaultButton
            text="ALL"
            iconProps={{ iconName: "Save" }}
            styles={{ root: { minWidth: 0, padding: "0 6px" } }}
            disabled={buttonsClicked.saveAll}
            onClick={async () => {
              const papers = extractAllPapers();
              Logger.logUIInteraction({
                component: "Dialog",
                action: "saveAllPapers",
                responseLength: currentAIResponseText().length,
                paperCount: papers.length,
              });

              if (papers.length === 0) {
                console.log("No papers found in response");
                return;
              }

              // Save all papers
              for (const paper of papers) {
                if (paper.id) {
                  try {
                    const paperObj = await getPaperById(paper.id);
                    if (paperObj) {
                      addToSavedPapers(paperObj);
                    }
                  } catch (e) {
                    console.error(`Failed to fetch paper ${paper.id}:`, e);
                  }
                }
              }
              setButtonsClicked(prev => ({ ...prev, saveAll: true }));
            }}
          />



{/*////////////////////////////////////////////////////////////////////modified code */}
          {/* <DefaultButton
            text="Clear"
            iconProps={{ iconName: "Delete" }}
            styles={{ root: { minWidth: 0, padding: "0 6px", marginLeft: "8px" } }}
            onClick={() => {
              Logger.logUIInteraction({
                component: "Dialog",
                action: "clearConversation",
                messageCount: displayMessages.length,
                previousSessionId: sessionId,
              });

              // Clear messages and generate new chat session ID for fresh conversation
              const newSessionId = `chat_${Date.now()}`;
              setDisplayMessages([]);
              updateDialogState({
                displayMessages: [],
                chatHistory: [],
                chatSessionId: newSessionId,
              });
            }}
          /> */}

          <DefaultButton
            text="Clear"
            iconProps={{ iconName: "Delete" }}
            styles={{ root: { minWidth: 0, padding: "0 6px", marginLeft: "8px" } }}
            onClick={() => {
              // 1. Log the action
              // Note: We use chatSessionId from props, as 'sessionId' variable was commented out
              Logger.logUIInteraction({
                component: "Dialog",
                action: "clearConversation",
                messageCount: displayMessages.length,
                previousSessionId: chatSessionId, 
              });

              // 2. Generate a new Session ID for the backend
              const newSessionId = `chat_${Date.now()}`;

              // 3. Clear Local Component State (UI immediate update)
              setDisplayMessages([]);
              setRetrievedPapers([]); // Clear any parsed papers held in memory
              setButtonsClicked({ locateAll: false, addAll: false, saveAll: false }); // Reset "ALL" buttons to enabled
              setIsWaiting(false); // Stop loading spinner if active

              // 4. Update Parent/MobX State (Source of Truth)
              // This ensures persistence if the user switches tabs and comes back
              updateDialogState({
                displayMessages: [],
                chatHistory: [], // Clear the history array sent to backend
                chatSessionId: newSessionId,
                chatText: "",    // Clear any drafted text input
                chatSelectedPaper: null // Optional: Deselect any currently active paper
              });
            }}
          />
        </div>
      </div>
{/*///////////////////////////////////////////////////////////////////////////////////////////*/}



      {/* Paper Info Modal */}
      <Modal
        styles={{ main: { maxWidth: 700 } }}
        isOpen={isModalOpen}
        onDismiss={() => setModalState(false)}
        isBlocking={false}
      >
        <div className="p-lg">
          {loadingPaperInfo ? (
            <div style={{ padding: 20, textAlign: "center" }}>Loading...</div>
          ) : paperInfo ? (
            <>
              <h2 className="p-0 m-0">
                {paperInfo.Title}
                <IconButton
                  className="float-right iconButton"
                  iconProps={{ iconName: "Times" }}
                  ariaLabel="Close popup modal"
                  onClick={() => setModalState(false)}
                />
              </h2>
              <br />
              <div>
                <b>Authors</b>:{" "}
                {paperInfo.Authors
                  ? Array.isArray(paperInfo.Authors)
                    ? paperInfo.Authors.filter(Boolean).join(", ")
                    : paperInfo.Authors
                  : null}
                <br />
                <b>Source</b>: {paperInfo.Source || paperInfo.Venue}
                <br />
                <b>Year</b>: {paperInfo.Year}
                <br />
                <b>No. of Citations</b>: {paperInfo.CitationCounts}
                <br />
                <b>ID</b>: {paperInfo.ID}
                <br />
              </div>
              <p>
                <b>Abstract</b>: {paperInfo.Abstract}
              </p>
              <div>
                <b>Keywords</b>:{" "}
                {paperInfo.Keywords
                  ? Array.isArray(paperInfo.Keywords)
                    ? paperInfo.Keywords.filter(Boolean).join(", ")
                    : paperInfo.Keywords
                  : null}
              </div>
              <br />
              <hr></hr>
              <Stack tokens={{ childrenGap: 8 }} horizontal>
                <ActionButton
                  iconProps={{ iconName: "PlusCircle" }}
                  disabled={isInSimilarInputPapers && isInSimilarInputPapers(paperInfo)}
                  onClick={() => {
                    Logger.logUIInteraction({
                      component: "Dialog",
                      action: "addToSimilarPapersFromModal",
                      paperId: paperInfo.ID,
                      paperTitle: paperInfo.Title,
                    });
                    addToSimilarInputPapers(paperInfo);
                  }}
                  allowDisabledFocus
                >
                  Select
                </ActionButton>
                <ActionButton
                  disabled={isInSavedPapers && isInSavedPapers(paperInfo)}
                  iconProps={{ iconName: "Save" }}
                  onClick={() => {
                    Logger.logUIInteraction({
                      component: "Dialog",
                      action: "savePaperFromModal",
                      paperId: paperInfo.ID,
                      paperTitle: paperInfo.Title,
                    });
                    addToSavedPapers(paperInfo);
                  }}
                  allowDisabledFocus
                >
                  Save
                </ActionButton>
                <ActionButton
                  iconProps={{ iconName: "GraduationCap" }}
                  onClick={() => {
                    Logger.logUIInteraction({
                      component: "Dialog",
                      action: "openGoogleScholar",
                      paperId: paperInfo.ID,
                      paperTitle: paperInfo.Title,
                    });
                    const url =
                      "https://scholar.google.com/scholar?hl=en&q=" +
                      encodeURI(paperInfo.Title);
                    window.open(url, "_blank");
                  }}
                  allowDisabledFocus
                >
                  Google Scholar
                </ActionButton>
              </Stack>
            </>
          ) : (
            <div style={{ padding: 20, textAlign: "center" }}>Paper not found</div>
          )}
        </div>
      </Modal>
    </div>
  );
});
