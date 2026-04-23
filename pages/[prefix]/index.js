import BLOG from '@/blog.config'
import useNotification from '@/components/Notification'
import OpenWrite from '@/components/OpenWrite'
import { siteConfig } from '@/lib/config'
import { getGlobalData, getPost } from '@/lib/db/getSiteData'
import { useGlobal } from '@/lib/global'
import { getPageTableOfContents } from '@/lib/notion/getPageTableOfContents'
import {
  getPasswordQuery,
  savePathPassword,
  saveScopePassword
} from '@/lib/password'
import { checkSlugHasNoSlash, processPostData } from '@/lib/utils/post'
import { DynamicLayout } from '@/themes/theme'
import { createNotFoundStaticPropsResult } from '@/lib/router/staticProps'
import md5 from 'js-md5'
import { useRouter } from 'next/router'
import { idToUuid } from 'notion-utils'
import { useCallback, useEffect, useState } from 'react'

/**
 * 根据notion的slug访问页面
 * 只解析一级目录例如 /about
 * @param {*} props
 * @returns
 */
const Slug = props => {
  const { post } = props
  const router = useRouter()
  const { locale } = useGlobal()

  // 文章锁🔐
  const [lock, setLock] = useState(post?.password && post?.password !== '')
  const { showNotification, Notification } = useNotification()

  /**
   * 验证文章密码
   * @param {*} passInput
   */
  const validPassword = useCallback(
    (passInput, options = {}) => {
      const { notify = true, notifyDuration = 3000 } = options
      if (!post) {
        return false
      }
      const passwordSalt = post?.password_salt || post?.slug || post?.id || ''
      const encrypt = md5(passwordSalt + passInput)
      if (passInput && encrypt === post?.password) {
        setLock(false)
        // 输入密码存入localStorage，下次自动提交
        savePathPassword(router.asPath, passInput)
        if (post?.unlock_scope && post?.scope_share_enabled !== false) {
          saveScopePassword(post.unlock_scope, passInput)
        }
        if (notify) {
          showNotification(locale.COMMON.ARTICLE_UNLOCK_TIPS, notifyDuration) // 设置解锁成功提示显示
        }
        return true
      }
      return false
    },
    [locale.COMMON.ARTICLE_UNLOCK_TIPS, post, router.asPath, showNotification]
  )

  // 文章加载
  useEffect(() => {
    // 文章加密
    if (post?.password && post?.password !== '') {
      setLock(true)
    } else {
      setLock(false)
    }

    // 读取上次记录 自动提交密码
    const passInputs = getPasswordQuery(router.asPath, post?.unlock_scope)
    if (passInputs.length > 0) {
      for (const passInput of passInputs) {
        if (validPassword(passInput, { notify: true, notifyDuration: 5000 })) {
          break // 密码验证成功，停止尝试
        }
      }
    }
  }, [post, post?.unlock_scope, router.asPath, validPassword])

  // 文章加载
  useEffect(() => {
    if (lock) {
      return
    }
    // 文章解锁后生成目录与内容
    if (post?.blockMap?.block) {
      post.content = Object.keys(post.blockMap.block).filter(
        key => post.blockMap.block[key]?.value?.parent_id === post.id
      )
      post.toc = getPageTableOfContents(post, post.blockMap)
    }
  }, [router, lock, post])

  props = { ...props, lock, validPassword }
  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  return (
    <>
      {/* 文章布局 */}
      <DynamicLayout theme={theme} layoutName='LayoutSlug' {...props} />
      {/* 解锁密码提示框 */}
      {post?.password && post?.password !== '' && !lock && <Notification />}
      {/* 导流工具 */}
      <OpenWrite />
    </>
  )
}

export async function getStaticPaths() {
  if (!BLOG.isProd) {
    return {
      paths: [],
      fallback: true
    }
  }

  const from = 'slug-paths'
  const { allPages } = await getGlobalData({ from })
  const paths = allPages
    ?.filter(row => checkSlugHasNoSlash(row))
    .map(row => ({ params: { prefix: row.slug } }))
  return {
    paths: paths,
    fallback: 'blocking'
  }
}

export async function getStaticProps({ params: { prefix }, locale }) {
  let fullSlug = prefix
  const from = `slug-props-${fullSlug}`
  const props = await getGlobalData({ from, locale })
  if (siteConfig('PSEUDO_STATIC', false, props.NOTION_CONFIG)) {
    if (!fullSlug.endsWith('.html')) {
      fullSlug += '.html'
    }
  }

  // 在列表内查找文章
  props.post = props?.allPages?.find(p => {
    return (
      p.type.indexOf('Menu') < 0 &&
      (p.slug === prefix || p.id === idToUuid(prefix))
    )
  })

  // 处理非列表内文章的内信息
  if (!props?.post) {
    const pageId = prefix
    if (pageId.length >= 32) {
      const post = await getPost(pageId, props?.allPages)
      props.post = post
    }
  }
  if (!props?.post) {
    return createNotFoundStaticPropsResult(props.NOTION_CONFIG)
  } else {
    await processPostData(props, from)
  }
  return {
    props,
    revalidate: process.env.EXPORT
      ? undefined
      : siteConfig(
          'NEXT_REVALIDATE_SECOND',
          BLOG.NEXT_REVALIDATE_SECOND,
          props.NOTION_CONFIG
        )
  }
}

export default Slug
