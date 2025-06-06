import * as React from "react";
import "./../assets/scss/App.scss";
import { DefaultButton, Label, TextField } from "@fluentui/react";
import Markdown from 'react-markdown'
import { observer } from "mobx-react";
import { getPaperByTitle } from "./../request";

const baseUrl = "http://localhost:3000/";

export const Dialog = observer(({props}) => {
  const { chatText, chatHistory, chatResponse, chatSelectedPaper, updateDialogState } = props;
  // const [chatText, setChatText] = React.useState('')
  // const [chatHistory, setChatHistory] = React.useState([])
  // const [chatSelectedPaper, setChatSelectedPaper] = React.useState('')
  // const [chatResponse, setChatResponse] = React.useState('')
  // const [chatResponsing, setChatResponsing] = React.useState(false)
 
  const onChangeChatText = (ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newText: string): void => {
    updateDialogState({ chatText: newText });
  }

  const chatRequest = () => {
    updateDialogState({ chatSelectedPaper: '', chatResponse: 'RUNNING ... ...' });
    // setChatSelectedPaper('')
    // setChatResponse('RUNNING ... ...')
    // setChatResponsing(true)

    fetch(`${baseUrl}chat`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        text: chatText,
        chatHistory: chatHistory
      })
    }).then(response => {
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let partial = '';
      // setChatResponse('')
      updateDialogState({ chatResponse: '' });
    
      const readChunk = ({ done, value }) => {
        if (done) {
          if (partial) {
            // setChatResponse(`${partial}`)
            updateDialogState({ chatResponse: partial });
          }
          // setChatResponsing(false)
          const newChatHistory = [...chatHistory, { human: chatText, ai: partial }];
          updateDialogState({ chatHistory: newChatHistory })
          return;
          // maximum to save latest 3 dialog in chatHistory array
          // if (chatHistory.length >= 3) {
          //   setChatHistory(chatHistory.slice(1).concat([{
          //     'human': chatText,
          //     'ai': chatResponse
          //   }]))
          // } else {
          //   setChatHistory(chatHistory.concat([{
          //     'human': chatText,
          //     'ai': chatResponse
          //   }]))
          // }
          // return;
        }
        partial += decoder.decode(value);
        updateDialogState({ chatResponse: partial });
        // setChatResponse(`${partial}`)
        reader.read().then(readChunk) // Call readChunk recursively with next chunk
      }
      reader.read().then(readChunk)
    })
  }


  return (
    <div className="split p-md p-b-0">
      <div className="history">
        {
          chatHistory.map(historyItem => {
            return (
              <div>
                <div> human: {historyItem.human} </div> 
                <div> ai: {historyItem.ai} </div> 
              </div>
            )
          })
        }
      </div>

      <div style={{ display: 'flex' }}>
        <Label style={{ fontSize: "1.2rem" }}> Chat with your data here</Label>
        &nbsp;&nbsp;
        <DefaultButton 
          className="iconButton"
          styles={{root: {padding:0, minWidth: 0, display: "inline-block", verticalAlign: "top"}, icon: {color: "#116EBE"}}}
          onClick={chatRequest}
          iconProps={{iconName: "Rocket"}}
          text={'Ask'}>
        </DefaultButton>
      </div>
      <TextField style={{ marginBottom: "2em" }} multiline rows={10} defaultValue={""} onChange={onChangeChatText} />

      <div>
        <div style={{ display: 'flex' }}>
          <Label style={{ fontSize: "1.2rem" }}> LLM Feedback </Label>
          <div>
            <DefaultButton
              text="ALL"
              iconProps={{iconName: "Locate"}}
              onClick={() => {}} 
              allowDisabledFocus 
              styles={{root: {padding:0, margin: '0 0.5em', minWidth: 0, display: "inline-block", verticalAlign: "top"}, icon: {color: "#116EBE"}}}
            />
            <DefaultButton
              text="ALL"
              iconProps={{iconName: "PlusCircle"}}
              onClick={() => {}} 
              allowDisabledFocus 
              styles={{root: {padding:0, margin: '0 0.5em', minWidth: 0, display: "inline-block", verticalAlign: "top"}, icon: {color: "#116EBE"}}}
            />
            <DefaultButton
              text="ALL"
              iconProps={{iconName: "Save"}}
              onClick={() => {}} 
              allowDisabledFocus 
              styles={{root: {padding:0, margin: '0 0.5em', minWidth: 0, display: "inline-block", verticalAlign: "top"}, icon: {color: "#116EBE"}}}
            />
          </div>
        </div>

        <div>
        {
          chatSelectedPaper.length > 0 &&
          <div>
            <span style={{fontWeight: 900}}>Current Selected Paper:</span> 
            <span style={{color: 'blue'}}>{chatSelectedPaper}</span>
            <span>
              <DefaultButton
                iconProps={{iconName: "Locate"}}
                onClick={() => {
                  // TODO use http filter
                  // let papers = this.state.dataAll.filter(i => i.Title === `${this.state.chatSelectedPaper}.`)
                  // if (papers.length > 0) {
                  //   addToSelectNodeIDs(papers.map((d) => d["ID"]), "scatterplot")
                  // }
                  getPaperByTitle(chatSelectedPaper)
                  .then((papers) => {
                    if (papers.length > 0) {
                      props['addToSelectNodeIDs'](papers.map((d) => d["ID"]), "scatterplot")
                    }
                  })
                }} 
                allowDisabledFocus 
                styles={{root: {padding:0, margin: '0 0.5em', minWidth: 0, display: "inline-block", verticalAlign: "top"}, icon: {color: "#116EBE"}}}
              />
              <DefaultButton
                iconProps={{iconName: "PlusCircle"}}
                onClick={() => {
                  // TODO use http filter
                  // let papers = this.state.dataAll.filter(i => i.Title === `${this.state.chatSelectedPaper}.`)
                  // if (papers.length > 0) {
                  //   addToSimilarInputPapers(papers[0])
                  // }
                  getPaperByTitle(chatSelectedPaper)
                  .then((papers) => {
                    if (papers.length > 0) {
                      props['addToSimilarInputPapers'](papers[0])
                    }
                  })
                }} 
                allowDisabledFocus 
                styles={{root: {padding:0, margin: '0 0.5em', minWidth: 0, display: "inline-block", verticalAlign: "top"}, icon: {color: "#116EBE"}}}
              />
              <DefaultButton
                iconProps={{iconName: "Save"}}
                onClick={() => {
                  // TODO use http filter
                  // let papers = this.state.dataAll.filter(i => i.Title === `${this.state.chatSelectedPaper}.`)
                  // if (papers.length > 0) {
                  //   addToSavedPapers(papers[0])
                  // }
                  getPaperByTitle(chatSelectedPaper)
                  .then((papers) => {
                    if (papers.length > 0) {
                      props['addToSavedPapers'](papers[0])
                    }
                  })
                }} 
                allowDisabledFocus 
                styles={{root: {padding:0, margin: '0 0.5em', minWidth: 0, display: "inline-block", verticalAlign: "top"}, icon: {color: "#116EBE"}}}
              />
            </span>
          </div>
        }
        </div>

        <Markdown
          components={{
            strong: ({node, ...props}) => {
              return (
                <span
                  id={`${props.children[0]}`}
                  style={{color: 'blue', fontWeight: 'bold', cursor: 'pointer' }} {...props} 
                  onClick={() => {
                    // setChatSelectedPaper(`${props.children[0]}`)
                    updateDialogState({ chatSelectedPaper: `${props.children[0]}` });
                  }}
                />
              )
            }
          }}
        >{chatResponse}</Markdown>
      </div>
    </div>
  )
})