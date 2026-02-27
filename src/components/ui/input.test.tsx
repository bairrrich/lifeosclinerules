import { render, screen } from "@testing-library/react"
import { Input } from "./input"
import userEvent from "@testing-library/user-event"

describe("Input", () => {
  it("renders correctly", () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument()
  })

  it("accepts user input", async () => {
    const user = userEvent.setup()
    render(<Input placeholder="Enter text" />)

    const input = screen.getByPlaceholderText("Enter text")
    await user.type(input, "Hello World")

    expect(input).toHaveValue("Hello World")
  })

  it("can be disabled", () => {
    render(<Input placeholder="Disabled input" disabled />)
    expect(screen.getByPlaceholderText("Disabled input")).toBeDisabled()
  })

  it("applies type attribute", () => {
    const { rerender } = render(<Input type="text" placeholder="Text" />)
    expect(screen.getByPlaceholderText("Text")).toHaveAttribute("type", "text")

    rerender(<Input type="email" placeholder="Email" />)
    expect(screen.getByPlaceholderText("Email")).toHaveAttribute("type", "email")

    rerender(<Input type="password" placeholder="Password" />)
    expect(screen.getByPlaceholderText("Password")).toHaveAttribute("type", "password")
  })

  it("handles onChange events", async () => {
    const user = userEvent.setup()
    const handleChange = jest.fn()
    render(<Input placeholder="Enter text" onChange={handleChange} />)

    await user.type(screen.getByPlaceholderText("Enter text"), "a")
    expect(handleChange).toHaveBeenCalled()
  })
})
