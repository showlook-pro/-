import { useGlobal } from '@/lib/global'
import throttle from 'lodash.throttle'
import { useEffect, useMemo, useState } from 'react'

const TocDrawerButton = ({ onClick }) => {
  const { locale } = useGlobal()
  const [progress, setProgress] = useState(0)

  const updateProgress = useMemo(
    () =>
      throttle(() => {
        const scrollableHeight =
          document.documentElement.scrollHeight - window.innerHeight
        if (scrollableHeight <= 0) {
          setProgress(0)
          return
        }
        setProgress(
          Math.min(100, Math.max(0, (window.scrollY / scrollableHeight) * 100))
        )
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
    <button
      type='button'
      onClick={onClick}
      title={locale.COMMON.TABLE_OF_CONTENTS}
      aria-label={locale.COMMON.TABLE_OF_CONTENTS}
      className='proxio-float-button proxio-toc-float-button fixed bottom-28 right-8 z-[999] flex h-10 w-10 items-center justify-center rounded-full text-sm text-white shadow-md transition duration-200 ease-in-out hover:scale-105 xl:hidden'
      style={{ '--proxio-toc-progress': `${progress}%` }}>
      <i className='fas fa-list-ol' />
    </button>
  )
}

export default TocDrawerButton
