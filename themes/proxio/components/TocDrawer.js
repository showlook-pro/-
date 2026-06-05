import { useEffect, useImperativeHandle, useState } from 'react'
import Catalog from './Catalog'

const TocDrawer = ({ post, cRef }) => {
  const hasToc = post?.toc?.length > 0
  const [showDrawer, switchShowDrawer] = useState(false)

  const switchVisible = () => {
    switchShowDrawer(current => !current)
  }

  const closeDrawer = () => {
    switchShowDrawer(false)
  }

  useImperativeHandle(cRef, () => ({
    handleSwitchVisible: switchVisible,
    closeDrawer
  }))

  useEffect(() => {
    if (!showDrawer) {
      return
    }
    const previousBodyOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
    }
  }, [showDrawer])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1140px)')
    const handleResize = event => {
      if (event.matches) {
        closeDrawer()
      }
    }
    handleResize(mediaQuery)
    mediaQuery.addEventListener('change', handleResize)
    return () => mediaQuery.removeEventListener('change', handleResize)
  }, [])

  if (!hasToc) {
    return null
  }

  return (
    <div
      className={`${showDrawer ? 'block' : 'hidden'} proxio-toc-drawer fixed inset-0 z-[1000] bg-white dark:bg-gray-900 xl:hidden`}
      role='dialog'
      aria-modal='true'
      aria-label='文章目录'>
      <button
        type='button'
        aria-label='关闭目录'
        className='proxio-toc-drawer-close'
        onClick={closeDrawer}>
        <i className='fas fa-times' />
      </button>
      <div className='proxio-toc-drawer-content dark:text-gray-400 text-gray-600'>
        <Catalog toc={post.toc} onNavigate={closeDrawer} />
      </div>
    </div>
  )
}

export default TocDrawer
