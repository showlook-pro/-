import BLOG from '@/blog.config'

function getCollectionViewValue(viewRecord) {
  return viewRecord?.value?.value || viewRecord?.value || viewRecord || null
}

function appendIds(pageIds, seen, ids) {
  if (!Array.isArray(ids)) return

  for (const id of ids) {
    if (!id || seen.has(id)) continue
    seen.add(id)
    pageIds.push(id)
  }
}

function collectIdsFromQueryView(pageIds, seen, queryView) {
  appendIds(pageIds, seen, queryView?.blockIds)
  appendIds(pageIds, seen, queryView?.collection_group_results?.blockIds)

  if (Array.isArray(queryView?.collection_group_results?.groups)) {
    for (const group of queryView.collection_group_results.groups) {
      appendIds(pageIds, seen, group?.blockIds)
    }
  }
}

function collectIdsFromCollectionView(pageIds, seen, viewRecord) {
  const viewValue = getCollectionViewValue(viewRecord)
  appendIds(pageIds, seen, viewValue?.page_sort)
}

export default function getAllPageIds(
  collectionQuery,
  collectionId,
  collectionView,
  viewIds
) {
  if (!collectionQuery && !collectionView) {
    return []
  }

  const pageIds = []
  const seen = new Set()
  const groupIndex = BLOG.NOTION_INDEX || 0
  const preferredViewId = Array.isArray(viewIds) ? viewIds[groupIndex] : null
  const queryViews = collectionQuery?.[collectionId] || {}

  if (preferredViewId) {
    collectIdsFromQueryView(pageIds, seen, queryViews[preferredViewId])
    collectIdsFromCollectionView(pageIds, seen, collectionView?.[preferredViewId])
  }

  if (pageIds.length === 0 && Array.isArray(viewIds)) {
    for (const viewId of viewIds) {
      collectIdsFromQueryView(pageIds, seen, queryViews[viewId])
    }

    for (const viewId of viewIds) {
      collectIdsFromCollectionView(pageIds, seen, collectionView?.[viewId])
    }
  }

  if (pageIds.length === 0) {
    for (const queryView of Object.values(queryViews)) {
      collectIdsFromQueryView(pageIds, seen, queryView)
    }

    for (const viewRecord of Object.values(collectionView || {})) {
      collectIdsFromCollectionView(pageIds, seen, viewRecord)
    }
  }

  return pageIds
}
