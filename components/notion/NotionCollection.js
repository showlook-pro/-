import NotionFormView from '@/components/notion/NotionFormView'
import { isShowPagePropertiesField } from '@/lib/notion/pageProperties'
import { getRecordValue, isFormCollectionView } from '@/lib/notion/forms'
import { useEffect, useMemo, useState } from 'react'
import { useNotionContext } from 'react-notion-x'
import {
  Collection as DefaultCollection,
  Property as DefaultProperty
} from 'react-notion-x/build/third-party/collection'

const getViewLabel = view => view?.name || (view?.type === 'table' ? '表格' : '视图')

const getCollectionPagePropertyIds = (collection, schemas) => {
  let propertyIds = Object.keys(schemas || {}).filter(id => id !== 'title')

  if (collection?.format?.property_visibility) {
    propertyIds = propertyIds.filter(id => {
      const visibility = collection.format.property_visibility.find(
        property => property.property === id
      )?.visibility

      return visibility !== 'hide'
    })
  }

  if (collection?.format?.collection_page_properties) {
    const idToIndex = Object.fromEntries(
      collection.format.collection_page_properties.map((property, index) => [
        property.property,
        index
      ])
    )

    propertyIds.sort((left, right) => (idToIndex[left] ?? 999) - (idToIndex[right] ?? 999))
  } else {
    propertyIds.sort((left, right) =>
      String(schemas[left]?.name || '').localeCompare(String(schemas[right]?.name || ''))
    )
  }

  return propertyIds.filter(propertyId => !isShowPagePropertiesField(schemas[propertyId]))
}

function NotionCollectionPageProperties({ block, className, recordMap }) {
  const collection = getRecordValue(recordMap?.collection, block?.parent_id)
  const schemas = collection?.schema

  if (!collection || !schemas) {
    return null
  }

  const propertyIds = getCollectionPagePropertyIds(collection, schemas)

  return (
    <div className='notion-collection-page-properties'>
      <div className={`notion-collection-row ${className || ''}`}>
        <div className='notion-collection-row-body'>
          {propertyIds.map(propertyId => {
            const schema = schemas[propertyId]
            if (!schema) return null

            return (
              <div className='notion-collection-row-property' key={propertyId}>
                <div className='notion-collection-column-title'>
                  <span>{schema.name}</span>
                </div>
                <div className='notion-collection-row-value'>
                  <DefaultProperty
                    block={block}
                    collection={collection}
                    data={block?.properties?.[propertyId]}
                    pageHeader
                    propertyId={propertyId}
                    schema={schema}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function NotionCollection({ block, className, ctx }) {
  const { recordMap } = useNotionContext()
  const isCollectionPage =
    block?.type === 'page' && block?.parent_table === 'collection'

  const viewIds = useMemo(
    () => (Array.isArray(block?.view_ids) ? block.view_ids : []),
    [block?.view_ids]
  )

  const views = useMemo(
    () =>
      viewIds
        .map(viewId => getRecordValue(recordMap?.collection_view, viewId))
        .filter(Boolean),
    [recordMap?.collection_view, viewIds]
  )

  const hasFormView = views.some(isFormCollectionView)
  const [activeViewId, setActiveViewId] = useState(viewIds[0])

  useEffect(() => {
    setActiveViewId(viewIds[0])
  }, [viewIds])

  if (isCollectionPage) {
    return (
      <NotionCollectionPageProperties
        block={block}
        className={className}
        recordMap={recordMap}
      />
    )
  }

  if (!hasFormView || !viewIds.length) {
    return <DefaultCollection block={block} className={className} ctx={ctx} />
  }

  const activeView =
    getRecordValue(recordMap?.collection_view, activeViewId) || views[0]
  const activeBlock = {
    ...block,
    view_ids: activeView?.id ? [activeView.id] : block.view_ids
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
        <DefaultCollection block={activeBlock} className={className} ctx={ctx} />
      )}
    </div>
  )
}
