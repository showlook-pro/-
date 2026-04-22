import BLOG from '@/blog.config'
import {
  NOTION_EXTERNAL_FORM_USER_ID,
  buildFormProperties,
  buildFormSubmissionOperation,
  geocodePlace,
  getFormLayoutPropertyIds
} from '@/lib/notion/forms'
import { normalizeRecordMap } from '@/lib/notion/normalizeRecordMap'
import {
  buildSyncRecordRequest,
  submitTransaction,
  syncRecordValues
} from '@/lib/notion/requestNotion'

const getPublicFormContext = async ({ collectionId, formBlockId }) => {
  const recordMap = await syncRecordValues(
    [
      buildSyncRecordRequest(collectionId, 'collection'),
      buildSyncRecordRequest(formBlockId, 'block')
    ],
    { requireAuth: true }
  )
  normalizeRecordMap(recordMap?.recordMap)

  const collection = recordMap?.recordMap?.collection?.[collectionId]?.value
  const formBlock = recordMap?.recordMap?.block?.[formBlockId]?.value

  if (!collection) {
    throw new Error('未找到公开表单对应的数据表')
  }

  if (formBlock?.type !== 'form') {
    throw new Error('未找到公开表单配置')
  }

  const layoutId = formBlock?.format?.form_layout_pointer?.id
  const layoutRecordMap = {
    collection: {
      [collectionId]: {
        value: collection
      }
    },
    block: {
      [formBlockId]: {
        value: formBlock
      }
    },
    layout: {}
  }

  if (layoutId) {
    const layoutResult = await syncRecordValues(
      [buildSyncRecordRequest(layoutId, 'layout')],
      { requireAuth: true }
    )
    normalizeRecordMap(layoutResult?.recordMap)
    layoutRecordMap.layout = layoutResult?.recordMap?.layout || {}
  }

  const layoutPropertyIds = getFormLayoutPropertyIds({
    collection,
    formBlock,
    recordMap: layoutRecordMap
  })

  return { collection, formBlock, layoutPropertyIds }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' })
    return
  }

  if (!BLOG.NOTION_TOKEN_V2) {
    res.status(503).json({
      message: '站点尚未配置服务端 Notion 提交权限，请先配置 NOTION_TOKEN_V2。'
    })
    return
  }

  const { collectionId, formBlockId, spaceId, values } = req.body || {}

  if (!collectionId || !formBlockId || !spaceId) {
    res.status(400).json({ message: '缺少表单提交所需的上下文参数。' })
    return
  }

  if (!values || typeof values !== 'object') {
    res.status(400).json({ message: '缺少表单字段内容。' })
    return
  }

  try {
    const { collection, layoutPropertyIds } = await getPublicFormContext({
      collectionId,
      formBlockId
    })
    const properties = await buildFormProperties(collection, values, {
      layoutPropertyIds,
      resolvePlace: geocodePlace
    })

    const actorId = BLOG.NOTION_ACTIVE_USER || NOTION_EXTERNAL_FORM_USER_ID
    const submissionId = crypto.randomUUID()

    await submitTransaction([
      buildFormSubmissionOperation({
        collectionId,
        formBlockId,
        spaceId,
        properties,
        actorId,
        submissionId
      })
    ])

    res.status(200).json({
      message: '提交成功，我们会尽快联系您。',
      submissionId
    })
  } catch (error) {
    console.error('[NotionForm] submit failed', error)
    res.status(400).json({
      message: error?.message || '表单提交失败，请稍后重试。'
    })
  }
}
