import type { Meta, StoryObj } from '@storybook/nextjs'
import { Input } from './input'
import { Label } from './label'

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'date', 'time'],
      description: 'Тип input',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder текст',
    },
    disabled: {
      control: 'boolean',
      description: 'Отключено',
    },
  },
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
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="email@example.com" />
    </div>
  ),
}

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Введите пароль',
  },
}

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: '0',
  },
}

export const Date: Story = {
  args: {
    type: 'date',
  },
}

export const Time: Story = {
  args: {
    type: 'time',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Отключенное поле',
  },
}

export const WithValue: Story = {
  args: {
    defaultValue: 'Значение по умолчанию',
  },
}

export const AllTypes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <div className="grid gap-1.5">
        <Label>Text</Label>
        <Input type="text" placeholder="Текстовое поле" />
      </div>
      <div className="grid gap-1.5">
        <Label>Email</Label>
        <Input type="email" placeholder="email@example.com" />
      </div>
      <div className="grid gap-1.5">
        <Label>Password</Label>
        <Input type="password" placeholder="Пароль" />
      </div>
      <div className="grid gap-1.5">
        <Label>Number</Label>
        <Input type="number" placeholder="123" />
      </div>
      <div className="grid gap-1.5">
        <Label>Date</Label>
        <Input type="date" />
      </div>
    </div>
  ),
}