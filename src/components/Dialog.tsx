// import * as React from "react";
// import "./../assets/scss/App.scss";
// import { DefaultButton, Label, TextField } from "@fluentui/react";
// import Markdown from 'react-markdown'
// import { observer } from "mobx-react";
// import { getPaperByTitle } from "./../request";
// import { Logger } from "../socket/logger";

// const baseUrl = "http://localhost:3000/";

// export const Dialog = observer(({props}) => {
//   const { chatText, chatHistory, chatResponse, chatSelectedPaper, updateDialogState } = props;
//   // const [chatText, setChatText] = React.useState('')
//   // const [chatHistory, setChatHistory] = React.useState([])
//   // const [chatSelectedPaper, setChatSelectedPaper] = React.useState('')
//   // const [chatResponse, setChatResponse] = React.useState('')
//   // const [chatResponsing, setChatResponsing] = React.useState(false)
 
//   const onChangeChatText = (ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newText: string): void => {
//     updateDialogState({ chatText: newText });
//   }

//   const chatRequest = () => {
//     Logger.logLLMInteraction({
//       component: 'Dialog',
//       action: 'chatQuery',
//       query: chatText,
//       chatHistory: chatHistory,
//       historyLength: chatHistory.length
//     });
    
//     updateDialogState({ chatSelectedPaper: '', chatResponse: 'RUNNING ... ...' });

//     fetch(`${baseUrl}chat`, {
//       method: 'POST',
//       headers: {'Content-Type': 'application/json'},
//       body: JSON.stringify({
//         text: chatText,
//         chatHistory: chatHistory
//       })
//     }).then(response => {
//       const reader = response.body.getReader();
//       const decoder = new TextDecoder('utf-8');
//       let partial = '';
//       updateDialogState({ chatResponse: '' });
    
//       const readChunk = ({ done, value }) => {
//         if (done) {
//           if (partial) {
//             updateDialogState({ chatResponse: partial });
            
//             // Log the completed LLM response
//             Logger.logLLMInteraction({
//               component: 'Dialog',
//               action: 'chatResponse',
//               query: chatText,
//               responseLength: partial.length,
//               chatHistory: chatHistory
//             });
//           }
//           const newChatHistory = [...chatHistory, { human: chatText, ai: partial }];
//           updateDialogState({ chatHistory: newChatHistory })
//           return;
//           // maximum to save latest 3 dialog in chatHistory array
//           // if (chatHistory.length >= 3) {
//           //   setChatHistory(chatHistory.slice(1).concat([{
//           //     'human': chatText,
//           //     'ai': chatResponse
//           //   }]))
//           // } else {
//           //   setChatHistory(chatHistory.concat([{
//           //     'human': chatText,
//           //     'ai': chatResponse
//           //   }]))
//           // }
//           // return;
//         }
//         partial += decoder.decode(value);
//         updateDialogState({ chatResponse: partial });
//         // setChatResponse(`${partial}`)
//         reader.read().then(readChunk) // Call readChunk recursively with next chunk
//       }
//       reader.read().then(readChunk)
//     })
//   }


//   return (
//     <div className="split p-md p-b-0">
//       <div className="history">
//         {
//           chatHistory.map(historyItem => {
//             return (
//               <div>
//                 <div> User: {historyItem.human} </div> 
//                 <div> AI: {historyItem.ai} </div> 
//               </div>
//             )
//           })
//         }
//       </div>

//       <div style={{ display: 'flex' }}>
//         <Label style={{ fontSize: "1.2rem" }}> Chat with your data here</Label>
//         &nbsp;&nbsp;
//         <DefaultButton 
//           className="iconButton"
//           styles={{root: {padding:0, minWidth: 0, display: "inline-block", verticalAlign: "top"}, icon: {color: "#116EBE"}}}
//           onClick={() => {
//             Logger.logUIInteraction({
//               component: 'Dialog',
//               action: 'askButtonClick',
//               value: chatText,
//               chatHistoryLength: chatHistory.length
//             });
            
//             chatRequest();
//           }}
//           iconProps={{iconName: "Rocket"}}
//           text={'Ask'}>
//         </DefaultButton>
//       </div>
//       <TextField style={{ marginBottom: "2em" }} multiline rows={10} defaultValue={""} onChange={onChangeChatText} />

//       <div>
//         <div style={{ display: 'flex' }}>
//           <Label style={{ fontSize: "1.2rem" }}> LLM Feedback </Label>
//           <div>
//             <DefaultButton
//               text="ALL"
//               iconProps={{iconName: "Locate"}}
//               onClick={() => {
//                 Logger.logUIInteraction({
//                   component: 'Dialog',
//                   action: 'selectAllPapers',
//                   responseLength: chatResponse.length
//                 });
//               }} 
//               allowDisabledFocus 
//               styles={{root: {padding:0, margin: '0 0.5em', minWidth: 0, display: "inline-block", verticalAlign: "top"}, icon: {color: "#116EBE"}}}
//             />
//             <DefaultButton
//               text="ALL"
//               iconProps={{iconName: "PlusCircle"}}
//               onClick={() => {
//                 Logger.logUIInteraction({
//                   component: 'Dialog',
//                   action: 'addAllToSimilarInputPapers',
//                   responseLength: chatResponse.length
//                 });
//               }} 
//               allowDisabledFocus 
//               styles={{root: {padding:0, margin: '0 0.5em', minWidth: 0, display: "inline-block", verticalAlign: "top"}, icon: {color: "#116EBE"}}}
//             />
//             <DefaultButton
//               text="ALL"
//               iconProps={{iconName: "Save"}}
//               onClick={() => {
//                 Logger.logUIInteraction({
//                   component: 'Dialog',
//                   action: 'saveAllPapers',
//                   responseLength: chatResponse.length
//                 });
//               }} 
//               allowDisabledFocus 
//               styles={{root: {padding:0, margin: '0 0.5em', minWidth: 0, display: "inline-block", verticalAlign: "top"}, icon: {color: "#116EBE"}}}
//             />
//           </div>
//         </div>

//         <div>
//         {
//           chatSelectedPaper.length > 0 &&
//           <div>
//             <span style={{fontWeight: 900}}>Current Selected Paper:</span> 
//             <span style={{color: 'blue'}}>{chatSelectedPaper}</span>
//             <span>
//               <DefaultButton
//                 iconProps={{iconName: "Locate"}}
//                 onClick={() => {
//                   Logger.logUIInteraction({
//                     component: 'Dialog',
//                     action: 'locateSelectedPaper',
//                     paperTitle: chatSelectedPaper
//                   });
                  
//                   getPaperByTitle(chatSelectedPaper)
//                   .then((papers) => {
//                     if (papers.length > 0) {
//                       Logger.logUIInteraction({
//                         component: 'Dialog',
//                         action: 'locateSelectedPaperSuccess',
//                         paperTitle: chatSelectedPaper,
//                         paperId: papers[0].ID,
//                         papersFound: papers.length
//                       });
                      
//                       props['addToSelectNodeIDs'](papers.map((d) => d["ID"]), "scatterplot")
//                     } else {
//                       Logger.logUIInteraction({
//                         component: 'Dialog',
//                         action: 'locateSelectedPaperNotFound',
//                         paperTitle: chatSelectedPaper
//                       });
//                     }
//                   })
//                 }} 
//                 allowDisabledFocus 
//                 styles={{root: {padding:0, margin: '0 0.5em', minWidth: 0, display: "inline-block", verticalAlign: "top"}, icon: {color: "#116EBE"}}}
//               />
//               <DefaultButton
//                 iconProps={{iconName: "PlusCircle"}}
//                 onClick={() => {
//                   Logger.logUIInteraction({
//                     component: 'Dialog',
//                     action: 'addSelectedPaperToSimilarInput',
//                     paperTitle: chatSelectedPaper
//                   });
                  
//                   getPaperByTitle(chatSelectedPaper)
//                   .then((papers) => {
//                     if (papers.length > 0) {
//                       Logger.logUIInteraction({
//                         component: 'Dialog',
//                         action: 'addSelectedPaperToSimilarInputSuccess',
//                         paperTitle: chatSelectedPaper,
//                         paperId: papers[0].ID
//                       });
                      
//                       props['addToSimilarInputPapers'](papers[0])
//                     } else {
//                       Logger.logUIInteraction({
//                         component: 'Dialog',
//                         action: 'addSelectedPaperToSimilarInputNotFound',
//                         paperTitle: chatSelectedPaper
//                       });
//                     }
//                   })
//                 }} 
//                 allowDisabledFocus 
//                 styles={{root: {padding:0, margin: '0 0.5em', minWidth: 0, display: "inline-block", verticalAlign: "top"}, icon: {color: "#116EBE"}}}
//               />
//               <DefaultButton
//                 iconProps={{iconName: "Save"}}
//                 onClick={() => {
//                   Logger.logUIInteraction({
//                     component: 'Dialog',
//                     action: 'saveSelectedPaper',
//                     paperTitle: chatSelectedPaper
//                   });
                  
//                   getPaperByTitle(chatSelectedPaper)
//                   .then((papers) => {
//                     if (papers.length > 0) {
//                       Logger.logUIInteraction({
//                         component: 'Dialog',
//                         action: 'saveSelectedPaperSuccess',
//                         paperTitle: chatSelectedPaper,
//                         paperId: papers[0].ID
//                       });
                      
//                       props['addToSavedPapers'](papers[0])
//                     } else {
//                       Logger.logUIInteraction({
//                         component: 'Dialog',
//                         action: 'saveSelectedPaperNotFound',
//                         paperTitle: chatSelectedPaper
//                       });
//                     }
//                   })
//                 }} 
//                 allowDisabledFocus 
//                 styles={{root: {padding:0, margin: '0 0.5em', minWidth: 0, display: "inline-block", verticalAlign: "top"}, icon: {color: "#116EBE"}}}
//               />
//             </span>
//           </div>
//         }
//         </div>

//         <Markdown
//           components={{
//             strong: ({node, ...props}) => {
//               return (
//                 <span
//                   id={`${props.children[0]}`}
//                   style={{color: 'blue', fontWeight: 'bold', cursor: 'pointer' }} {...props} 
//                   onClick={() => {
//                     Logger.logUIInteraction({
//                       component: 'Dialog',
//                       action: 'selectPaperFromResponse',
//                       paperTitle: `${props.children[0]}`,
//                       previousSelectedPaper: chatSelectedPaper
//                     });
                    
//                     updateDialogState({ chatSelectedPaper: `${props.children[0]}` });
//                   }}
//                 />
//               )
//             }
//           }}
//         >{chatResponse}</Markdown>
//       </div>
//     </div>
//   )
// })

import * as React from "react";
import "./../assets/scss/App.scss";
import { DefaultButton, Dropdown, IDropdownOption } from "@fluentui/react";
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

const options: IDropdownOption[] = [
  { key: "normal", text: "🗣 Normal Chat" },
  { key: "rag", text: "📚 RAG Chat" },
];

// Parse paper title and ID from raw string
const parseTitleAndId = (raw: string) => {
  const match = raw.match(/\[\[ID:([^\]]+)\]\]/); // Match [[ID:xxx]]
  const id = match ? match[1] : null;

  // Only take the part after "Title:" until the first period
  let title = raw;
  const titleMatch = raw.match(/Title:\s*([^\.]+)/i);
  if (titleMatch) {
    title = titleMatch[1].trim();
  }

  console.log("parseTitleAndId → raw:", raw, "title:", title, "id:", id);
  return { title, id };
};

export const Dialog = observer(({ props }) => {
  const {
    chatText,
    chatHistory,
    chatSelectedPaper,
    updateDialogState,
    addToSelectNodeIDs,
    addToSimilarInputPapers,
    addToSavedPapers,
  } = props;

  const [displayMessages, setDisplayMessages] = React.useState<
    { role: "user" | "ai"; text: string }[]
  >([]);
  const [isWaiting, setIsWaiting] = React.useState(false);
  const [chatMode, setChatMode] = React.useState<string>("normal");

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const prevMessageCountRef = React.useRef(0);

  // Auto scroll to the latest message only when new messages are added
  React.useEffect(() => {
    // Only scroll if messages were actually added (not on initial render)
    if (displayMessages.length > prevMessageCountRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    prevMessageCountRef.current = displayMessages.length;
  }, [displayMessages, isWaiting]);

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

  const chatRequest = () => {
    if (!chatText.trim()) return;

    // 🔵 Log the outgoing query (ported)
    Logger.logLLMInteraction({
      component: "Dialog",
      action: "chatQuery",
      query: chatText,
      chatHistory: chatHistory,
      historyLength: chatHistory.length,
      mode: chatMode,
      chat_history_raw: [...displayMessages, { role: "user", text: chatText }],
    });

    setDisplayMessages((prev) => [...prev, { role: "user", text: chatText }]);
    updateDialogState({ chatText: "" });

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setIsWaiting(true);

    fetch(`${baseUrl}chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: chatText,
        chat_history_raw: [...displayMessages, { role: "user", text: chatText }],
        mode: chatMode,
      }),
    }).then((response) => {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder("utf-8");
      let partial = "";
      let firstChunk = true;

      const readChunk = ({ done, value }: ReadableStreamReadResult<Uint8Array>) => {
        if (done) {
          setIsWaiting(false);

          // 🟢 Log the completed LLM response (ported)
          Logger.logLLMInteraction({
            component: "Dialog",
            action: "chatResponse",
            query: chatText,
            responseLength: partial.length,
            chatHistory: chatHistory,
            mode: chatMode,
          });

          // Also append to external chatHistory like before
          const newChatHistory = [...chatHistory, { human: chatText, ai: partial }];
          updateDialogState({ chatHistory: newChatHistory });
          return;
        }

        partial += decoder.decode(value);

        if (firstChunk) {
          setIsWaiting(false);
          setDisplayMessages((prev) => [...prev, { role: "ai", text: "" }]);
          firstChunk = false;
        }

        setDisplayMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "ai", text: partial };
          return updated;
        });

        reader.read().then(readChunk);
      };
      reader.read().then(readChunk);
    });
  };

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

  const renderPaperBlock = (title: string, id: string | null, raw: string) => {
    // 🔹 If no Title was parsed OR title === raw text, then it's not a paper title
    if (!id && (!title || title === raw)) {
      return <span>{raw}</span>; // Normal text → display as is
    }

    // 🔹 Otherwise it's a paper title → render in blue + show buttons
    return (
      <div style={{ marginBottom: "0.5em" }}>
        <span
          style={{ color: "blue", fontWeight: "bold", cursor: "pointer" }}
          onClick={() => {
            // 🟣 Log selecting a paper from response (ported)
            Logger.logUIInteraction({
              component: "Dialog",
              action: "selectPaperFromResponse",
              paperTitle: title,
              previousSelectedPaper: chatSelectedPaper,
              paperId: id || undefined,
            });
            updateDialogState({ chatSelectedPaper: title });
          }}
        >
          {title}
        </span>

        {id && <div style={{ color: "red", fontSize: "0.85em" }}>ID: {id}</div>}

        <div style={{ marginTop: "0.2em" }}>
          <DefaultButton
            iconProps={{ iconName: "Locate" }}
            styles={{ root: { marginRight: "0.3em", minWidth: 0 } }}
            onClick={() => {
              // 🔍 Locate (by ID first, else by title) + logs
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
            onClick={() => {
              // 💾 Save + logs
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
      </div>
    );
  };

  return (
    <div className="chat-window">
      {/* Chat messages */}
      <div className="chat-messages">
        {displayMessages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble ${msg.role}`}>
            {msg.role === "user" ? (
              `${msg.text}`
            ) : (
              <div>
                🤖
                <Markdown
                  components={{
                    strong: ({ node, ...props }) => {
                      const raw = extractText(props.children);
                      const { title, id } = parseTitleAndId(raw);
                      return renderPaperBlock(title, id, raw); // ✅ Pass raw
                    },
                    li: ({ node, children }) => {
                      const raw = extractText(children);
                      const { title, id } = parseTitleAndId(raw);
                      return renderPaperBlock(title, id, raw); // ✅ Pass raw
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
            🤖 <span className="spinner"></span> RUNNING...
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
            placeholder="Type your message..."
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
                mode: chatMode,
              });
              chatRequest();
            }}
            iconProps={{ iconName: "Rocket" }}
            text="Ask"
          />
        </div>

        <div className="chat-action-row">
          <Dropdown
            id="chatModeDropdown"
            placeholder="Select mode"
            options={options}
            selectedKey={chatMode}
            defaultSelectedKey="normal"
            onChange={(e, option) => {
              setChatMode(option?.key as string);
              // 🟠 Log mode change
              Logger.logUIInteraction({
                component: "Dialog",
                action: "changeChatMode",
                mode: option?.key as string,
              });
            }}
            styles={{ root: { width: 160 } }}
          />
          <DefaultButton
            text="ALL"
            iconProps={{ iconName: "Locate" }}
            onClick={() => {
              // Ported "ALL locate" log using latest AI response length
              Logger.logUIInteraction({
                component: "Dialog",
                action: "selectAllPapers",
                responseLength: currentAIResponseText().length,
              });
            }}
          />
          <DefaultButton
            text="ALL"
            iconProps={{ iconName: "PlusCircle" }}
            onClick={() => {
              Logger.logUIInteraction({
                component: "Dialog",
                action: "addAllToSimilarInputPapers",
                responseLength: currentAIResponseText().length,
              });
            }}
          />
          <DefaultButton
            text="ALL"
            iconProps={{ iconName: "Save" }}
            onClick={() => {
              Logger.logUIInteraction({
                component: "Dialog",
                action: "saveAllPapers",
                responseLength: currentAIResponseText().length,
              });
            }}
          />
        </div>
      </div>
    </div>
  );
});
