import React, { useEffect, useState } from "react"

type HelloResponse = {
    text: string
}

type MessagesResponse = HelloResponse[]

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8000"

const App: React.FC = () => {
    const [data, setData] = useState<HelloResponse | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchHello = async () => {
            try {
                const res = await fetch(`${API_URL}/api/messages/`)

                if (!res.ok) {
                    throw new Error(`Request failed with status ${res.status}`)
                }

                const json: MessagesResponse = await res.json()
                setData(json.length > 0 ? json[0] : null)
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message)
                } else {
                    setError("Unknown error")
                }
            } finally {
                setLoading(false)
            }
        }

        fetchHello()
    }, [])
    if (loading) {
        return <div style={{ fontFamily: "sans-serif" }}>Loading…</div>
    }

    if (error) {
        return (
            <div style={{ fontFamily: "sans-serif", color: "red" }}>
                Error: {error}
            </div>
        )
    }

    return (
        <div
            style={{
                fontFamily: "sans-serif",
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: "0.5rem",
            }}
        >
            <h1>Text from backend</h1>
            <p>
                {data?.text ?? <i>No text in database</i>}
            </p>
        </div>
    )
}

export default App
