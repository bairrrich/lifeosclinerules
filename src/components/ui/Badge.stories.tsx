import type { Meta, StoryObj } from '@storybook/nextjs'
import { Badge } from './badge'

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
      description: 'Вариант отображения бейджа',
    },
  },
  args: {
    children: 'Badge',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    variant: 'default',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
}

export const StatusExamples: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Активно</Badge>
      <Badge variant="secondary">В процессе</Badge>
      <Badge variant="destructive">Отменено</Badge>
      <Badge variant="outline">Черновик</Badge>
    </div>
  ),
}