import { ContentBlock, EditorState } from "draft-js"
import { EventEmitter2 as Emitter } from "eventemitter2"
import * as React from "react"

interface DraftDecorator {
  strategy: (block: ContentBlock, callback: (start: number, end: number) => void) => void
  component: Function
  props?: Object
}
class DecoratorComponent extends React.Component<any, any> {
  componentWillMount() {
    this.state = { show: true }
    this.props.emitter.on(`hide:${this.props.parent.getKey()}`, this.observe)
  }
  componentWillUnmount() {
    this.props.emitter.off(`hide:${this.props.parent.getKey()}`, this.observe)
  }
  observe = () => {
    this.setState({ show: !this.state.show })
  }
  render() {
    const {type, children, onClick} = this.props
    const isHeader = this.props.block.getType().indexOf("header") === 0
    return <span className={type}>
      {isHeader ? <button onClick={onClick}>test</button> : null}
      {(this.state.show || isHeader) ? children : null}
    </span>
  }
}

// tslint:disable-next-line:max-classes-per-file
class Decorator implements DraftDecorator {
  observer = new Emitter()
  type = ""
  parent = {} as any
  processing = {} as any
  constructor(public store: { state: { editorState: EditorState } }) {
  }
  get editorState() {
    return this.store.state.editorState
  }
  strategy = (block: ContentBlock, callback: (start: number, end: number) => void) => {
    if (block.getType().indexOf("header") === 0) {
      this.type = block.getType()
      this.parent = block
      this.processing = block
      callback(0, block.getCharacterList().size)
    } else {
      const editorState = this.editorState
      const content = editorState.getCurrentContent()
      const blockMap = content.getBlockMap()
      const blocksBefore = blockMap.toSeq().takeUntil((v) => v === block).reverse()
        .find((v: ContentBlock) => v.getType().indexOf("header") === 0)
      if (blocksBefore != null) {
        this.type = blocksBefore.getType()
        this.parent = blocksBefore
        this.processing = block
        callback(0, block.getCharacterList().size)
      }
    }
  }
  observe = (key: string, cb: () => void) => {
    this.observer.on(key, cb)
  }
  dismiss = (key: string) => {
    this.observer.emit(`hide:${key}`)
  }
  component = ({children} = { children: [] }) => {
    const type = this.type
    const parent = this.parent
    return <DecoratorComponent
      block={this.processing}
      parent={parent}
      type={type}
      emitter={this.observer}
      onClick={() => this.dismiss(parent.getKey())}>
      {children}
    </DecoratorComponent>
  }
}

export default Decorator