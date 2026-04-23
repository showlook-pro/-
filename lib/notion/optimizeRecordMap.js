function getCollectionId(block, recordMap) {
  if (!block) return null
  if (block.collection_id) return block.collection_id

  const viewIds = Array.isArray(block.view_ids) ? block.view_ids : []
  for (const viewId of viewIds) {
    const view = recordMap?.collection_view?.[viewId]?.value
    const pointerId = view?.format?.collection_pointer?.id
    if (pointerId) {
      return pointerId
    }
  }

  return block?.format?.collection_pointer?.id || null
}

function collectDescendantIds(blockIds, blockMap, target) {
  const queue = [...blockIds]

  while (queue.length > 0) {
    const blockId = queue.shift()
    if (!blockId || target.has(blockId)) continue

    target.add(blockId)

    const childIds = blockMap?.[blockId]?.value?.content
    if (Array.isArray(childIds) && childIds.length > 0) {
      queue.push(...childIds)
    }
  }
}

function getCollectionCoverRequirements(recordMap) {
  const requirements = new Map()
  const blocks = Object.values(recordMap?.block || {})

  for (const entry of blocks) {
    const block = entry?.value
    if (
      block?.type !== 'collection_view' &&
      block?.type !== 'collection_view_page'
    ) {
      continue
    }

    const collectionId = getCollectionId(block, recordMap)
    if (!collectionId) continue

    const state =
      requirements.get(collectionId) || { needsPageContentCover: false }
    const viewIds = Array.isArray(block.view_ids) ? block.view_ids : []

    for (const viewId of viewIds) {
      const view = recordMap?.collection_view?.[viewId]?.value
      const galleryCoverType = view?.format?.gallery_cover?.type
      const boardCoverType = view?.format?.board_cover?.type

      if (
        galleryCoverType === 'page_content' ||
        boardCoverType === 'page_content'
      ) {
        state.needsPageContentCover = true
        break
      }
    }

    requirements.set(collectionId, state)
  }

  return requirements
}

function getRetainedContentIds(contentIds, blockMap, needsPageContentCover) {
  if (!needsPageContentCover || !Array.isArray(contentIds)) {
    return []
  }

  for (const blockId of contentIds) {
    const block = blockMap?.[blockId]?.value
    if (block?.type === 'image') {
      return [blockId]
    }
  }

  return []
}

export function optimizeRecordMapForClientRender(recordMap) {
  if (!recordMap?.block) {
    return recordMap
  }

  const coverRequirements = getCollectionCoverRequirements(recordMap)
  if (coverRequirements.size === 0) {
    return recordMap
  }

  const blockMap = recordMap.block
  const pruneIds = new Set()

  for (const entry of Object.values(blockMap)) {
    const block = entry?.value
    if (block?.type !== 'page' || block?.parent_table !== 'collection') {
      continue
    }

    const collectionId = block.parent_id
    const requirement = coverRequirements.get(collectionId)
    if (!requirement) {
      continue
    }

    const originalContentIds = Array.isArray(block.content) ? [...block.content] : []
    if (originalContentIds.length === 0) {
      continue
    }

    const retainedContentIds = getRetainedContentIds(
      originalContentIds,
      blockMap,
      requirement.needsPageContentCover
    )

    if (retainedContentIds.length > 0) {
      block.content = retainedContentIds
    } else {
      delete block.content
    }

    collectDescendantIds(originalContentIds, blockMap, pruneIds)
    retainedContentIds.forEach(blockId => pruneIds.delete(blockId))
  }

  pruneIds.forEach(blockId => {
    delete blockMap[blockId]
  })

  return recordMap
}
