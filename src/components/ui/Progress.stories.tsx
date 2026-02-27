import type { Meta, StoryObj } from '@storybook/nextjs'
import { Progress } from './progress'

const meta: Meta<typeof Progress> = {
  title: 'UI/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: 50,
    className: 'w-60',
  },
}

export const Zero: Story = {
  args: {
    value: 0,
    className: 'w-60',
  },
}

export const Complete: Story = {
  args: {
    value: 100,
    className: 'w-60',
  },
}

export const Low: Story = {
  args: {
    value: 25,
    className: 'w-60',
  },
}

export const High: Story = {
  args: {
    value: 75,
    className: 'w-60',
  },
}

export const AllProgress: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-60">
      <div className="space-y-1">
        <span className="text-sm">0%</span>
        <Progress value={0} />
      </div>
      <div className="space-y-1">
        <span className="text-sm">25%</span>
        <Progress value={25} />
      </div>
      <div className="space-y-1">
        <span className="text-sm">50%</span>
        <Progress value={50} />
      </div>
      <div className="space-y-1">
        <span className="text-sm">75%</span>
        <Progress value={75} />
      </div>
      <div className="space-y-1">
        <span className="text-sm">100%</span>
        <Progress value={100} />
      </div>
    </div>
  ),
}