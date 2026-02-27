import type { Meta, StoryObj } from '@storybook/nextjs'
import { Textarea } from './textarea'
import { Label } from './label'

const meta: Meta<typeof Textarea> = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Введите текст...',
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-80 gap-1.5">
      <Label htmlFor="message">Сообщение</Label>
      <Textarea id="message" placeholder="Напишите ваше сообщение..." />
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Отключенное поле',
  },
}

export const WithValue: Story = {
  args: {
    defaultValue: 'Текст по умолчанию в поле ввода',
    className: 'w-80',
  },
}

export const Resizable: Story = {
  args: {
    placeholder: 'Это поле можно изменять по высоте',
    className: 'w-80 h-32',
  },
}