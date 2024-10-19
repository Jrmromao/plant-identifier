// src/app/layout.tsx
import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
    weight: ['300', '400', '500', '600', '700'],
    subsets: ['latin'],
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'Plant Identifier',
    description: 'Identify plants using AI',
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
        <body className={poppins.className}>
        <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-200">
            {children}
        </div>
        </body>
        </html>
    )
}