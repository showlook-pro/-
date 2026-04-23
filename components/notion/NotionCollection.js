import NotionFormView from '@/components/notion/NotionFormView'
import NotionProperty from '@/components/notion/NotionProperty'
import { getRecordValue, isFormCollectionView } from '@/lib/notion/forms'
import { isShowPagePropertiesField } from '@/lib/notion/pageProperties'
import { useEffect, useState } from 'react'
import { useNotionContext } from 'react-notion-x'
import { Collection as DefaultCollection } from 'react-notion-x/build/third-party/collection'

const VIEW_PROPERTY_KEYS = {
  board: 'board_properties',
  gallery: 'gallery_properties',
  list: 'list_properties',
  table: 'table_properties'
}

const getViewLabel = view => view?.name || (view?.type === 'table' ? '表格' : '视图')

const getCollectionId = (block, recordMap) =>
  block?.collection_id ||
  getRecordValue(recordMap?.collection_view, block?.view_ids?.[0])?.format
    ?.collection_pointer?.id ||
  block?.parent_id

const getSortedPropertyIds = collection => {
  const schema = collection?.schema || {}
  let propertyIds = Object.keys(schema).filter(propertyId => {
    if (propertyId === 'title') {
      return false
    }

    const field = schema[propertyId]
    if (!field || isShowPagePropertiesField(field)) {
      return false
    }

    return true
  })

  const propertyVisibility = Array.isArray(collection?.format?.property_visibility)
    ? collection.format.property_visibility
    : []

  if (propertyVisibility.length > 0) {
    propertyIds = propertyIds.filter(propertyId => {
      const visibility = propertyVisibility.find(
        property => property.property === propertyId
      )?.visibility

      return visibility !== 'hide'
    })
  }

  const orderedProperties = Array.isArray(collection?.format?.collection_page_properties)
    ? collection.format.collection_page_properties
    : []

  if (orderedProperties.length > 0) {
    const order = Object.fromEntries(
      orderedProperties.map((property, index) => [property.property, index])
    )

    propertyIds.sort((left, right) => (order[left] ?? 999) - (order[right] ?? 999))
  } else {
    propertyIds.sort((left, right) =>
      String(schema[left]?.name || '').localeCompare(String(schema[right]?.name || ''))
    )
  }

  return propertyIds
}

const getConfiguredViewProperties = (collection, collectionView) => {
  const propertyKey = VIEW_PROPERTY_KEYS[collectionView?.type]

  if (!propertyKey) {
    return []
  }

  const configuredProperties = Array.isArray(collectionView?.format?.[propertyKey])
    ? collectionView.format[propertyKey]
    : []

  const filteredProperties = configuredProperties.filter(property => {
    const field = collection?.schema?.[property?.property]
    return field && property.property !== 'title' && !isShowPagePropertiesField(field)
  })

  if (filteredProperties.length > 0) {
    return filteredProperties.map(property => ({
      ...property,
      visible: property.visible !== false
    }))
  }

  return getSortedPropertyIds(collection).map(property => ({
    property,
    visible: true
  }))
}

const patchCollectionViewProperties = (collection, collectionView) => {
  const propertyKey = VIEW_PROPERTY_KEYS[collectionView?.type]

  if (!propertyKey) {
    return collectionView
  }

  return {
    ...collectionView,
    format: {
      ...(collectionView?.format || {}),
      [propertyKey]: getConfiguredViewProperties(collection, collectionView)
    }
  }
}

const patchCollectionViewsRecordMap = (recordMap, collection, viewIds) => {
  if (!recordMap?.collection_view || !collection || !Array.isArray(viewIds)) {
    return recordMap
  }

  let hasChanges = false
  const collectionViews = { ...recordMap.collection_view }

  for (const viewId of viewIds) {
    const viewRecord = collectionViews?.[viewId]
    const view = viewRecord?.value

    if (!view || isFormCollectionView(view) || !VIEW_PROPERTY_KEYS[view.type]) {
      continue
    }

    collectionViews[viewId] = {
      ...viewRecord,
      value: patchCollectionViewProperties(collection, view)
    }
    hasChanges = true
  }

  if (!hasChanges) {
    return recordMap
  }

  return {
    ...recordMap,
    collection_view: collectionViews
  }
}

const INTERACTIVE_CHILD_SELECTOR =
  'a,button,input,select,textarea,[role="button"],[role="link"],[tabindex]:not([tabindex="-1"])'

const isInteractiveChildClick = event => {
  const interactiveElement = event?.target?.closest?.(INTERACTIVE_CHILD_SELECTOR)
  return interactiveElement && interactiveElement !== event.currentTarget
}

function NonNavigatingPageLink({ children, className, href, onClick, ...rest }) {
  const {
    as,
    locale,
    passHref,
    prefetch,
    rel,
    replace,
    scroll,
    shallow,
    target,
    ...safeRest
  } = rest

  const handleClick = event => {
    if (isInteractiveChildClick(event)) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <div
      aria-disabled='true'
      className={className}
      data-notion-collection-link='disabled'
      onClick={handleClick}
      {...safeRest}>
      {children}
    </div>
  )
}

const shouldDisableCollectionPageLink = props => {
  const className = String(props?.className || '')

  return (
    className.includes('notion-collection-card') ||
    className.includes('notion-list-item') ||
    className.includes('notion-page-link')
  )
}

const withConditionalNonNavigatingLink = (LinkComponent, shouldDisable) => {
  if (!LinkComponent) {
    return function ConditionalNonNavigatingLink(props) {
      return shouldDisable(props) ? (
        <NonNavigatingPageLink {...props} />
      ) : (
        <a {...props} />
      )
    }
  }

  return function ConditionalNonNavigatingLink(props) {
    return shouldDisable(props) ? (
      <NonNavigatingPageLink {...props} />
    ) : (
      <LinkComponent {...props} />
    )
  }
}

const buildCollectionContext = ({
  ctx,
  notionContext,
  pagePropertiesMode,
  recordMap,
  collection,
  viewIds
}) => {
  const nextRecordMap = pagePropertiesMode
    ? patchCollectionViewsRecordMap(recordMap, collection, viewIds)
    : recordMap

  const components = {
    ...(notionContext?.components || {}),
    ...(ctx?.components || {}),
    Property: props => (
      <NotionProperty {...props} pagePropertiesMode={pagePropertiesMode} />
    )
  }

  if (pagePropertiesMode === 'showclose') {
    components.PageLink = withConditionalNonNavigatingLink(
      components.PageLink,
      shouldDisableCollectionPageLink
    )
  }

  return {
    ...(notionContext || {}),
    ...(ctx || {}),
    recordMap: nextRecordMap,
    components
  }
}

export default function NotionCollection({
  block,
  className,
  ctx,
  pagePropertiesMode = ''
}) {
  const notionContext = useNotionContext()
  const recordMap = notionContext?.recordMap || ctx?.recordMap
  const viewIds = Array.isArray(block?.view_ids) ? block.view_ids : []
  const defaultViewId = viewIds[0]
  const collectionId = getCollectionId(block, recordMap)
  const collection = getRecordValue(recordMap?.collection, collectionId)
  const views = viewIds
    .map(viewId => getRecordValue(recordMap?.collection_view, viewId))
    .filter(Boolean)
  const hasFormView = views.some(isFormCollectionView)
  const collectionCtx = buildCollectionContext({
    ctx,
    notionContext,
    pagePropertiesMode,
    recordMap,
    collection,
    viewIds
  })

  const [activeViewId, setActiveViewId] = useState(defaultViewId)

  useEffect(() => {
    setActiveViewId(defaultViewId)
  }, [block?.id, defaultViewId])

  if (!hasFormView) {
    return <DefaultCollection block={block} className={className} ctx={collectionCtx} />
  }

  const activeView =
    getRecordValue(collectionCtx?.recordMap?.collection_view, activeViewId) ||
    getRecordValue(collectionCtx?.recordMap?.collection_view, viewIds[0]) ||
    views[0]

  const activeBlock = {
    ...block,
    view_ids: activeView?.id ? [activeView.id] : block?.view_ids
  }

  return (
    <div className='notion-form-collection-wrapper'>
      {viewIds.length > 1 && (
        <div className='notion-collection-view-tabs-row'>
          {views.map(view => (
            <button
              className={`notion-collection-view-tabs-content-item ${
                activeView?.id === view.id
                  ? 'notion-collection-view-tabs-content-item-active'
                  : ''
              }`}
              key={view.id}
              onClick={() => setActiveViewId(view.id)}
              type='button'>
              <div className='notion-collection-view-type'>
                <span className='notion-collection-view-type-title'>
                  {getViewLabel(view)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {isFormCollectionView(activeView) ? (
        <NotionFormView block={activeBlock} />
      ) : (
        <DefaultCollection
          block={activeBlock}
          className={className}
          ctx={collectionCtx}
        />
      )}
    </div>
  )
}
