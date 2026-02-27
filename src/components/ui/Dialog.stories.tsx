import type { Meta, StoryObj } from '@storybook/nextjs'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './dialog'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'

const meta: Meta<typeof Dialog> = {
  title: 'UI/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Dialog>

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Открыть диалог</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Заголовок диалога</DialogTitle>
          <DialogDescription>
            Это описание диалогового окна. Здесь может быть полезная информация.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>Содержимое диалогового окна.</p>
        </div>
        <DialogFooter>
          <Button variant="outline">Отмена</Button>
          <Button>Подтвердить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const WithForm: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Создать элемент</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Создать новый элемент</DialogTitle>
          <DialogDescription>
            Заполните форму для создания нового элемента.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Название
            </Label>
            <Input id="name" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const AlertDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Удалить</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Подтверждение удаления</DialogTitle>
          <DialogDescription>
            Вы уверены, что хотите удалить этот элемент? Это действие нельзя отменить.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Отмена</Button>
          </DialogClose>
          <Button variant="destructive">Удалить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}