import { act, render, screen } from '@testing-library/react'
import NotionPage from '@/components/NotionPage'

jest.mock('@/lib/config', () => ({
  siteConfig: jest.fn((key, fallback) => fallback)
}))

jest.mock('@fisch0920/medium-zoom', () =>
  jest.fn(() => ({
    attach: jest.fn(),
    clone: jest.fn(() => ({ attach: jest.fn() }))
  }))
)

jest.mock('react-notion-x', () => ({
  NotionRenderer: () => (
    <div>
      <div className='notion-collection-page-properties'>
        Collection page properties
      </div>
    </div>
  )
}))

describe('NotionPage', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('does not remove React-owned collection page property nodes', () => {
    render(
      <NotionPage
        post={{
          blockMap: {
            block: {}
          }
        }}
      />
    )

    act(() => {
      jest.advanceTimersByTime(1500)
    })

    expect(screen.getByText('Collection page properties')).toBeInTheDocument()
  })
})
