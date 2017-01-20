import {
  CharacterMetadata,
  ContentBlock,
  ContentState,
  DraftHandleValue,
  Editor,
  EditorState,
  genKey,
  getDefaultKeyBinding,
  RichUtils,
} from "draft-js"
import * as React from "react"
import { render } from "react-dom"
import insertNewBlock from "./insertNewBlock"

type KeyboardEvent = React.KeyboardEvent<void>

type State = {
  editorState: EditorState,
}
export default class App extends React.Component<any, State> {
  constructor() {
    super()
    this.state = {
      editorState: EditorState.createEmpty(),
    }
  }
  onChange(editorState: EditorState) {
    this.setState({ editorState })
  }
  handleKeyCommand(command: string): DraftHandleValue {
    let newState = RichUtils.handleKeyCommand(this.state.editorState, command)
    if (command === "new-line") {
      const newBlock = new ContentBlock({
        key: genKey(),
        type: "unstyled",
        text: "",
      })
      newState = insertNewBlock(this.state.editorState, newBlock)
    }
    if (newState != null) {
      this.onChange(newState)
      return "handled"
    }
    return "not-handled"
  }
  keyBinding(e: KeyboardEvent): string {
    const type = RichUtils.getCurrentBlockType(this.state.editorState)
    if (type === "header-one" && e.key === "Enter") {
      return "new-line"
    }
    return getDefaultKeyBinding(e)
  }
  handleBeforeInput(input: string): string | void {
    const {editorState} = this.state
    const content = editorState.getCurrentContent()
    const selection = editorState.getSelection()
    const selectionKey = selection.getStartKey()
    const block = content.getBlockForKey(selectionKey)
    const blockType = block.getType()
    if (blockType.indexOf("unstyled") === 0 && block.getLength() === 1) {
      const text = block.getText()[0] + input
      if (text === "# ") {
        const characterList = block.getCharacterList()
          .push(CharacterMetadata.create())
        const newBlock: ContentBlock = block.
          mergeDeep({
            text: "# ",
            characterList,
            type: "header-one",
            data: {},
          }) as ContentBlock
        const newContent: ContentState = content.merge({
          blockMap: content.getBlockMap().set(selectionKey, newBlock),
          selectionAfter: selection
            .merge({
              anchorOffset: 2,
              focusOffset: 2,
            }),
        }) as ContentState
        this.onChange(EditorState.push(editorState, newContent, "insert-characters"))
        return "handled"
      }
    }
  }
  render() {
    return <div>
      <h1>Draft.js example</h1>
      <Editor
        editorState={this.state.editorState}
        handleBeforeInput={this.handleBeforeInput.bind(this)}
        keyBindingFn={this.keyBinding.bind(this)}
        handleKeyCommand={this.handleKeyCommand.bind(this)}
        onChange={this.onChange.bind(this)}
      />
    </div>
  }
}

document.addEventListener("DOMContentLoaded", () => {
  render(
    <App />,
    document.getElementById("app"),
  )
})