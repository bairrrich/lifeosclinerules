import type { Meta, StoryObj } from '@storybook/nextjs'
import { Skeleton } from './skeleton'

const meta: Meta<typeof Skeleton> = {
  title: 'UI/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    className: 'w-60 h-4',
  },
}

export const Circle: Story = {
  args: {
    className: 'w-12 h-12 rounded-full',
  },
}

export const Card: Story = {
  render: () => (
    <div className="flex flex-col space-y-3 w-80">
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  ),
}

export const Avatar: Story = {
  render: () => (
    <div className="flex items-center space-x-4 w-80">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  ),
}

export const List: Story = {
  render: () => (
    <div className="space-y-3 w-80">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  ),
}