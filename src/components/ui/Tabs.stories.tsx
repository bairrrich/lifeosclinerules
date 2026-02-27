import type { Meta, StoryObj } from '@storybook/nextjs'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

const meta: Meta<typeof Tabs> = {
  title: 'UI/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-80">
      <TabsList>
        <TabsTrigger value="tab1">Вкладка 1</TabsTrigger>
        <TabsTrigger value="tab2">Вкладка 2</TabsTrigger>
        <TabsTrigger value="tab3">Вкладка 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Содержимое вкладки 1</TabsContent>
      <TabsContent value="tab2">Содержимое вкладки 2</TabsContent>
      <TabsContent value="tab3">Содержимое вкладки 3</TabsContent>
    </Tabs>
  ),
}

export const TwoTabs: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-80">
      <TabsList>
        <TabsTrigger value="overview">Обзор</TabsTrigger>
        <TabsTrigger value="settings">Настройки</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Общая информация</TabsContent>
      <TabsContent value="settings">Настройки приложения</TabsContent>
    </Tabs>
  ),
}