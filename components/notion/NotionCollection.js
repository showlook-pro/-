import NotionFormView from '@/components/notion/NotionFormView'
import { getRecordValue, isFormCollectionView } from '@/lib/notion/forms'
import { useEffect, useMemo, useState } from 'react'
import { useNotionContext } from 'react-notion-x'
import { Collection as DefaultCollection } from 'react-notion-x/build/third-party/collection'

const getViewLabel = view => view?.name || (view?.type === 'table' ? '表格' : '视图')

export default function NotionCollection({ block, className, ctx }) {
  const { recordMap } = useNotionContext()
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
