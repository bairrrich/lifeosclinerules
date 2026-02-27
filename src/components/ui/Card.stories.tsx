import type { Meta, StoryObj } from '@storybook/nextjs'
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card'
import { Button } from './button'

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Заголовок карточки</CardTitle>
        <CardDescription>Описание карточки с дополнительной информацией</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Содержимое карточки. Здесь может быть любой контент.</p>
      </CardContent>
      <CardFooter>
        <Button>Действие</Button>
      </CardFooter>
    </Card>
  ),
}

export const Simple: Story = {
  render: () => (
    <Card className="w-80 p-4">
      <p>Простая карточка с минимальным содержимым</p>
    </Card>
  ),
}

export const WithHeader: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Только заголовок</CardTitle>
      </CardHeader>
    </Card>
  ),
}

export const WithDescription: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Заголовок</CardTitle>
        <CardDescription>Это описание под заголовком</CardDescription>
      </CardHeader>
    </Card>
  ),
}

export const WithFooter: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Карточка с футером</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Содержимое карточки</p>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="ghost">Отмена</Button>
        <Button>Сохранить</Button>
      </CardFooter>
    </Card>
  ),
}

export const AllParts: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Card className="w-80">
        <CardHeader>
          <CardTitle>Полная карточка</CardTitle>
          <CardDescription>Все компоненты карточки</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Основное содержимое</p>
        </CardContent>
        <CardFooter>
          <Button size="sm">Действие</Button>
        </CardFooter>
      </Card>
    </div>
  ),
}