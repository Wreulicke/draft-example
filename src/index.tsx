import * as Draft from "draft-js"
import * as React from "react"
import { render } from "react-dom"
const { Editor, EditorState, getDefaultKeyBinding, RichUtils} = Draft
type KeyboardEvent = React.KeyboardEvent<{}>

type State = {
  editorState: Draft.EditorState,
}
class TogglableContent extends React.Component<{ block: Draft.ContentBlock }, { show: boolean }>{
  componentWillMount() {
    this.setState({ show: true })
  }
  render() {
    return <div className="wrapper">
      <button onClick={() => this.setState({ show: !this.state.show })}>#</button>
      <span style={{ display: this.state.show ? "" : "none" }}>{this.props.block.getText()}</span>
    </div>
  }
}

// tslint:disable-next-line:max-classes-per-file
export default class App extends React.Component<any, State> {
  constructor() {
    super()
    this.state = {
      editorState: EditorState.createEmpty(),
    }
  }
  onChange(editorState: Draft.EditorState) {
    this.setState({ editorState })
  }
  handleKeyCommand(command: string): Draft.DraftHandleValue {
    let newState = RichUtils.handleKeyCommand(this.state.editorState, command)
    if (command === "toggle") {
      newState = RichUtils.toggleBlockType(this.state.editorState, "opened-section")
    }
    if (command === "toggle-header") {
      newState = RichUtils.toggleBlockType(this.state.editorState, "header-two")
    }
    if (newState != null) {
      this.onChange(newState)
      return "handled"
    }
    return "not-handled"
  }
  handleStyle(_: Draft.ContentBlock): any {
    // const type: string = contentBlock.getType()
    // if (type === "opened-section") {
    //   return "opened-section"
    // }
  }
  keyBinding(e: KeyboardEvent): string {
    if (e.key === "o" && e.altKey) {
      return "toggle"
    }
    return getDefaultKeyBinding(e)
  }
  handleBeforeInput(input: string): string | void {
    const {editorState} = this.state
    const content = editorState.getCurrentContent()
    const selection = editorState.getSelection()
    const block = content.getBlockForKey(editorState.getSelection().getStartKey())
    const blockType = block.getType()
    if (blockType.indexOf("unstyled") === 0) {
      const text = block.getText()[0] + input
      if (text === "# ") {
        const characterList = block.getCharacterList().push(Draft.CharacterMetadata.create())
        const newBlock: Draft.ContentBlock = block.
          mergeDeep({ text: "# ", characterList, type: "header-two", data: {} }) as any
        const newContent: Draft.ContentState = content.merge({
          blockMap: content.getBlockMap().set(selection.getStartKey(), newBlock),
          selectionAfter: selection.merge({ anchorOffset: 2, focusOffset: 2 }),
        }) as any
        newBlock.getCharacterList().insert
        this.onChange(Draft.EditorState.push(editorState, newContent, "insert-characters"))
        return "handled"
      }
    }
  }
  blockRender(contentBlock: Draft.ContentBlock): any {
    const type: string = contentBlock.getType()
    if (type === "opened-section") {
      return {
        component: TogglableContent,
        editable: false,
        props: {
          block: contentBlock,
        },
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
        // blockStyleFn={this.handleStyle.bind(this)}
        // blockRendererFn={this.blockRender.bind(this)}
        // blockRenderMap={BlockDefinition as any}
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