import React, { useState, useEffect } from 'react';

type Article = {
    id: number;
    title: string;
    link: string;
    date_published: string;
    content: string;
    pdf_file?: string;
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const ScraperData: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(false);
    const [scraping, setScraping] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [query, setQuery] = useState("chopin");
    const [startDate, setStartDate] = useState("01.10.2025");
    const [endDate, setEndDate] = useState("31.10.2025");

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/scraper/list/`);
            if (res.ok) {
                const data = await res.json();
                setArticles(data);
            }
        } catch (error) {
            console.error("Error fetching articles:", error);
        } finally {
            setLoading(false);
        }
    };

    const runScraper = async () => {
        setScraping(true);
        setMessage("Scraping started... this may take a while.");
        try {
            const res = await fetch(`${API_URL}/scraper/run/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: query,
                    start_date: startDate,
                    end_date: endDate
                })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage(`Scraping finished! Saved ${data.saved_count || 0} new articles.`);
                fetchArticles();
            } else {
                setMessage(`Error: ${data.message}`);
            }
        } catch (error) {
            setMessage("Failed to run scraper.");
            console.error(error);
        } finally {
            setScraping(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    return (
        <div style={{ padding: '40px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", width: '100%', minHeight: '100vh', backgroundColor: '#121212', color: '#e0e0e0', boxSizing: 'border-box' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#ffffff' }}>TVP World Scraper</h1>

            <div style={{
                width: '100%',
                marginBottom: '40px',
                padding: '25px',
                backgroundColor: '#1e1e1e',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                boxSizing: 'border-box'
            }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>Search Parameters</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '25px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ marginBottom: '8px', fontSize: '0.9rem', color: '#aaa' }}>Search Query</label>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            style={{
                                padding: '10px',
                                backgroundColor: '#2d2d2d',
                                border: '1px solid #404040',
                                borderRadius: '6px',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ marginBottom: '8px', fontSize: '0.9rem', color: '#aaa' }}>Start Date (DD.MM.YYYY)</label>
                        <input
                            type="text"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={{
                                padding: '10px',
                                backgroundColor: '#2d2d2d',
                                border: '1px solid #404040',
                                borderRadius: '6px',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ marginBottom: '8px', fontSize: '0.9rem', color: '#aaa' }}>End Date (DD.MM.YYYY)</label>
                        <input
                            type="text"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={{
                                padding: '10px',
                                backgroundColor: '#2d2d2d',
                                border: '1px solid #404040',
                                borderRadius: '6px',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>
                <button
                    onClick={runScraper}
                    disabled={scraping}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: scraping ? '#555' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: scraping ? 'not-allowed' : 'pointer',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        width: '100%',
                        transition: 'background-color 0.2s'
                    }}
                >
                    {scraping ? 'Processing...' : 'Run Scraper'}
                </button>
            </div>

            {message && (
                <div style={{
                    width: '100%',
                    marginBottom: '20px',
                    padding: '15px',
                    backgroundColor: message.includes('Error') ? '#3e1a1a' : '#1a3e1a',
                    borderRadius: '8px',
                    border: message.includes('Error') ? '1px solid #8b0000' : '1px solid #006400',
                    textAlign: 'center',
                    boxSizing: 'border-box'
                }}>
                    {message}
                </div>
            )}

            {loading ? (
                <p style={{ textAlign: 'center', color: '#aaa' }}>Loading articles...</p>
            ) : (
                <div style={{ overflowX: 'auto', width: '100%' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#1e1e1e', borderRadius: '8px', overflow: 'hidden' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#252525' }}>
                                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #333' }}>Date</th>
                                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #333' }}>Title</th>
                                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #333' }}>Source</th>
                                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #333' }}>PDF</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#777' }}>No articles found. Try running the scraper.</td>
                                </tr>
                            ) : (
                                articles.map((article) => (
                                    <tr key={article.id} style={{ borderBottom: '1px solid #333' }}>
                                        <td style={{ padding: '15px', whiteSpace: 'nowrap' }}>{article.date_published}</td>
                                        <td style={{ padding: '15px', fontWeight: '500' }}>{article.title}</td>
                                        <td style={{ padding: '15px' }}>
                                            <a href={article.link} target="_blank" rel="noopener noreferrer" style={{ color: '#4da6ff', textDecoration: 'none' }}>
                                                Original Link
                                            </a>
                                        </td>
                                        <td style={{ padding: '15px' }}>
                                            {article.pdf_file ? (
                                                <a
                                                    href={article.pdf_file}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        display: 'inline-block',
                                                        padding: '6px 12px',
                                                        backgroundColor: '#dc3545',
                                                        color: 'white',
                                                        textDecoration: 'none',
                                                        borderRadius: '4px',
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    View PDF
                                                </a>
                                            ) : (
                                                <span style={{ color: '#555' }}>N/A</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ScraperData;
