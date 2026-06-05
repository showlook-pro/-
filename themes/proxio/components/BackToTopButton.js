import throttle from 'lodash.throttle'
import { useEffect, useMemo } from 'react'

/**
 * 回顶按钮
 * @returns
 */
export const BackToTopButton = () => {
  const navBarScollListener = useMemo(
    () =>
      throttle(() => {
        const scrollY = window.scrollY
        const backToTop = document.querySelector('.back-to-top')
        if (backToTop) {
          backToTop.style.display = scrollY > 50 ? 'flex' : 'none'
        }
      }, 200),
    []
  )

  useEffect(() => {
    navBarScollListener()
    window.addEventListener('scroll', navBarScollListener)
    return () => {
      window.removeEventListener('scroll', navBarScollListener)
      navBarScollListener.cancel?.()
    }
  }, [navBarScollListener])

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {/* <!-- ====== Back To Top Start --> */}
      <button
        type='button'
        aria-label='回到顶部'
        onClick={scrollTop}
        className='proxio-float-button back-to-top fixed bottom-16 left-auto right-8 z-[999] hidden h-10 w-10 cursor-pointer items-center justify-center rounded-full text-white shadow-md transition duration-200 ease-in-out hover:scale-105'>
        <span className='mt-[6px] h-3 w-3 rotate-45 border-l border-t border-white'></span>
      </button>
      {/* <!-- ====== Back To Top End --> */}
    </>
  )
}
