import { ContentBlock, ContentState, EditorState } from "draft-js"

export default (editorState: EditorState, newBlock: ContentBlock) => {
  const content = editorState.getCurrentContent()
  const selection = editorState.getSelection()
  const selectionKey = selection.getStartKey()
  const block = content.getBlockForKey(selectionKey)
  const blockMap = content.getBlockMap()
  const blocksBefore = blockMap.toSeq().takeUntil((v) => v === block)
  const blocksAfter = blockMap.toSeq().skipUntil((v) => v === block).rest()
  const newBlockKey = newBlock.getKey()
  const newBlockMap = blocksBefore
    .concat([
      [block.getKey(), block],
      [newBlockKey, newBlock]],
    blocksAfter).toOrderedMap()
  const newContent: ContentState = content.merge({
    blockMap: newBlockMap,
    selectionBefore: selection,
    selectionAfter: selection.merge({
      anchorKey: newBlockKey,
      anchorOffset: 0,
      focusKey: newBlockKey,
      focusOffset: 0,
      isBackward: false,
    }),
  }) as ContentState
  return EditorState.push(editorState, newContent, "split-block")
}