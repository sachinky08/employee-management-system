import "../styles/globals.css"

export const metadata = {
  title: "Employee Management System",
  description: "A comprehensive employee management system",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
