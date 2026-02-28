import type { Meta, StoryObj } from "@storybook/react"
import { Combobox } from "@/components/ui/combobox"
import { action } from "@storybook/addon-actions"

const meta = {
  title: "UI/Combobox",
  component: Combobox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    mode: { control: "select", options: ["single", "multiple"] },
    searchable: { control: "boolean" },
    allowCustom: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Combobox>

export default meta
type Story = StoryObj<typeof meta>

const mockOptions = [
  { id: "1", label: "React" },
  { id: "2", label: "Vue" },
  { id: "3", label: "Angular" },
  { id: "4", label: "Svelte" },
  { id: "5", label: "Solid" },
]

export const Single: Story = {
  args: {
    label: "Select Framework",
    options: mockOptions,
    value: "",
    onChange: action("change"),
    mode: "single",
    placeholder: "Choose a framework",
  },
}

export const Multiple: Story = {
  args: {
    label: "Select Frameworks",
    options: mockOptions,
    value: ["1", "3"],
    onChange: action("change"),
    mode: "multiple",
    searchable: true,
  },
}

export const WithCustomValue: Story = {
  args: {
    label: "Select or Add",
    options: mockOptions,
    value: "",
    onChange: action("change"),
    mode: "single",
    allowCustom: true,
  },
}

export const Searchable: Story = {
  args: {
    label: "Search Framework",
    options: mockOptions,
    value: "",
    onChange: action("change"),
    mode: "single",
    searchable: true,
  },
}

export const Disabled: Story = {
  args: {
    label: "Disabled",
    options: mockOptions,
    value: "1",
    onChange: action("change"),
    mode: "single",
    disabled: true,
  },
}

export const WithoutLabel: Story = {
  args: {
    options: mockOptions,
    value: "",
    onChange: action("change"),
    mode: "single",
    placeholder: "Select...",
  },
}
