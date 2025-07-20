import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import React from 'react'
import App from '../../src/App'

describe('App Component', () => {
    it('renders the Vite and React logos', () => {
        render(<App />)
        const viteLogo = screen.getByAltText('Vite logo')
        const reactLogo = screen.getByAltText('React logo')

        expect(viteLogo).toBeInTheDocument()
        expect(reactLogo).toBeInTheDocument()
    })

    it('renders the heading', () => {
        render(<App />)
        const heading = screen.getByText(/Vite \+ React/i)

        expect(heading).toBeInTheDocument()
    })

    it('increments the count when button is clicked', async () => {
        render(<App />)
        const button = screen.getByRole('button', { name: /count is 0/i })

        await userEvent.click(button)
        expect(button).toHaveTextContent('count is 1')

        await userEvent.click(button)
        expect(button).toHaveTextContent('count is 2')
    })

    it('renders the instructional text', () => {
        render(<App />)
        const instruction = screen.getByText(/Edit/i)

        expect(instruction).toBeInTheDocument()
    })

    it('renders the footer text', () => {
        render(<App />)
        const footerText = screen.getByText(/Click on the Vite and React logos to learn more/i)

        expect(footerText).toBeInTheDocument()
    })
})