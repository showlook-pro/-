import { useGlobal } from '@/lib/global'
import throttle from 'lodash.throttle'
import { uuidToId } from 'notion-utils'
import { useEffect, useMemo, useRef, useState } from 'react'

const getPageScrollProgress = () => {
  const scrollableHeight =
    document.documentElement.scrollHeight - window.innerHeight
  if (scrollableHeight <= 0) {
    return 0
  }
  return Math.min(100, Math.max(0, (window.scrollY / scrollableHeight) * 100))
}

const CatalogProgress = () => {
  const [progress, setProgress] = useState(0)
  const updateProgress = useMemo(
    () =>
      throttle(() => {
        setProgress(getPageScrollProgress())
      }, 100),
    []
  )

  useEffect(() => {
    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)
    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
      updateProgress.cancel?.()
    }
  }, [updateProgress])

  return (
    <div className='proxio-catalog-progress'>
      <span style={{ width: `${progress}%` }} />
    </div>
  )
}

const Catalog = ({ toc, onNavigate }) => {
  const { locale } = useGlobal()
  const scrollRef = useRef(null)
  const tocItems = useMemo(
    () =>
      (toc || []).map(tocItem => ({
        ...tocItem,
        htmlId: uuidToId(tocItem.id)
      })),
    [toc]
  )
  const tocIds = useMemo(() => tocItems.map(tocItem => tocItem.htmlId), [tocItems])
  const [activeSection, setActiveSection] = useState(tocIds[0] || null)

  const actionSectionScrollSpy = useMemo(
    () =>
      throttle(() => {
        const sections = document.getElementsByClassName('notion-h')
        let currentSectionId = tocIds[0] || null
        let prevBBox = null

        for (let i = 0; i < sections.length; ++i) {
          const section = sections[i]
          if (!section || !(section instanceof Element)) {
            continue
          }
          const bbox = section.getBoundingClientRect()
          const prevHeight = prevBBox ? bbox.top - prevBBox.bottom : 0
          const offset = Math.max(150, prevHeight / 4)
          if (bbox.top - offset < 0) {
            currentSectionId = section.getAttribute('data-id')
            prevBBox = bbox
            continue
          }
          break
        }

        setActiveSection(currentSectionId)
        const currentIndex = tocIds.indexOf(currentSectionId)
        if (currentIndex >= 0) {
          scrollRef.current?.scrollTo({
            top: 34 * currentIndex,
            behavior: 'smooth'
          })
        }
      }, 160),
    [tocIds]
  )

  useEffect(() => {
    actionSectionScrollSpy()
    window.addEventListener('scroll', actionSectionScrollSpy, { passive: true })
    return () => {
      window.removeEventListener('scroll', actionSectionScrollSpy)
      actionSectionScrollSpy.cancel?.()
    }
  }, [actionSectionScrollSpy])

  if (!tocItems.length) {
    return null
  }

  const handleCatalogClick = (event, id) => {
    event.preventDefault()
    onNavigate?.()

    window.setTimeout(() => {
      const target = document.getElementById(id)
      if (!target) {
        return
      }
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      window.history.pushState(null, '', `#${id}`)
    }, onNavigate ? 80 : 0)
  }

  return (
    <div className='proxio-catalog-panel'>
      <div className='proxio-catalog-header'>
        <span className='proxio-catalog-icon' aria-hidden='true'>
          <span />
          <span />
          <span />
        </span>
        <span>{locale.COMMON.TABLE_OF_CONTENTS}</span>
      </div>
      <CatalogProgress />
      <div className='proxio-catalog-scroll' ref={scrollRef}>
        <nav className='proxio-catalog-nav'>
          {tocItems.map(tocItem => {
            const isActive = activeSection === tocItem.htmlId
            return (
              <a
                key={tocItem.htmlId}
                href={`#${tocItem.htmlId}`}
                onClick={event => handleCatalogClick(event, tocItem.htmlId)}
                aria-current={isActive ? 'location' : undefined}
                style={{ paddingLeft: 12 + tocItem.indentLevel * 14 }}
                className={`proxio-catalog-link notion-table-of-contents-item notion-table-of-contents-item-indent-level-${tocItem.indentLevel} catalog-item ${isActive ? 'is-active' : ''}`}>
                <span className='proxio-catalog-text'>{tocItem.text}</span>
              </a>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export default Catalog
