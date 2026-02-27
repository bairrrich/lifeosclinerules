import type { Meta, StoryObj } from '@storybook/nextjs'
import { Label } from './label'
import { Input } from './input'

const meta: Meta<typeof Label> = {
  title: 'UI/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Label>

export const Default: Story = {
  args: {
    children: 'Текст метки',
  },
}

export const WithInput: Story = {
  render: () => (
    <div className="grid w-64 gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="email@example.com" />
    </div>
  ),
}

export const Required: Story = {
  render: () => (
    <div className="grid w-64 gap-1.5">
      <Label htmlFor="name">
        Имя <span className="text-destructive">*</span>
      </Label>
      <Input id="name" placeholder="Введите имя" />
    </div>
  ),
}