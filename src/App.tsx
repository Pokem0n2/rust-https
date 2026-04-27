import { useState, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

interface Header {
  key: string;
  value: string;
  enabled: boolean;
}

interface Request {
  method: string;
  url: string;
  headers: Header[];
  body: string;
}

interface Response {
  status: number;
  status_text: string;
  headers: Record<string, string>;
  body: string;
  time_ms: number;
}

const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];

function App() {
  const [request, setRequest] = useState<Request>({
    method: "GET",
    url: "https://httpbin.org/get",
    headers: [{ key: "Content-Type", value: "application/json", enabled: true }],
    body: "",
  });
  const [response, setResponse] = useState<Response | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"headers" | "body" | "response">("headers");
  const [history, setHistory] = useState<{ url: string; method: string; status?: number }[]>([]);
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);

  const addHeader = () => {
    setRequest((r) => ({
      ...r,
      headers: [...r.headers, { key: "", value: "", enabled: true }],
    }));
  };

  const removeHeader = (index: number) => {
    setRequest((r) => ({
      ...r,
      headers: r.headers.filter((_, i) => i !== index),
    }));
  };

  const updateHeader = (index: number, field: keyof Header, value: string | boolean) => {
    setRequest((r) => ({
      ...r,
      headers: r.headers.map((h, i) => (i === index ? { ...h, [field]: value } : h)),
    }));
  };

  const sendRequest = async () => {
    setLoading(true);
    setResponse(null);
    setActiveTab("response");

    const enabledHeaders: Record<string, string> = {};
    request.headers
      .filter((h) => h.enabled && h.key.trim())
      .forEach((h) => {
        enabledHeaders[h.key] = h.value;
      });

    try {
      const result = await invoke<Response>("send_http_request", {
        request: {
          method: request.method,
          url: request.url,
          headers: enabledHeaders,
          body: request.body || null,
        },
      });
      setResponse(result);
      setHistory((h) => [{ url: request.url, method: request.method, status: result.status }, ...h.slice(0, 19)]);
    } catch (err) {
      setResponse({
        status: 0,
        status_text: "Error",
        headers: {},
        body: String(err),
        time_ms: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatJson = (str: string, contentType?: string) => {
    // Check if it's JSON by content-type header or string pattern
    const isJson = contentType?.toLowerCase().includes('json') ||
      str.trim().startsWith('{') ||
      str.trim().startsWith('[');

    if (!isJson) return str;

    try {
      const parsed = JSON.parse(str);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return str;
    }
  };

  const getContentType = (headers: Record<string, string>): string | undefined => {
    for (const [key, value] of Object.entries(headers)) {
      if (key.toLowerCase() === 'content-type') return value;
    }
    return undefined;
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "#22c55e";
    if (status >= 300 && status < 400) return "#eab308";
    if (status >= 400 && status < 500) return "#f97316";
    if (status >= 500) return "#ef4444";
    return "#6b7280";
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span>RustHTTPS</span>
        </div>
        <div className="history-mini">
          {history.slice(0, 5).map((h, i) => (
            <button
              key={i}
              className="history-item"
              onClick={() =>
                setRequest((r) => ({ ...r, url: h.url, method: h.method }))
              }
            >
              <span className={`method ${h.method.toLowerCase()}`}>{h.method}</span>
              <span className="history-url">{h.url.slice(0, 20)}...</span>
              {h.status && (
                <span className="status-dot" style={{ background: getStatusColor(h.status) }} />
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Main Layout */}
      <div className="main">
        {/* Request Panel */}
        <div className="panel request-panel">
          <div className="url-bar">
            <select
              value={request.method}
              onChange={(e) => setRequest((r) => ({ ...r, method: e.target.value }))}
              className={`method-select ${request.method.toLowerCase()}`}
            >
              {METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <input
              type="text"
              className="url-input"
              placeholder="Enter URL..."
              value={request.url}
              onChange={(e) => setRequest((r) => ({ ...r, url: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && sendRequest()}
            />
            <button className="send-btn" onClick={sendRequest} disabled={loading}>
              {loading ? (
                <span className="spinner" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              )}
              Send
            </button>
          </div>

          {/* Request Tabs */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === "headers" ? "active" : ""}`}
              onClick={() => setActiveTab("headers")}
            >
              Headers
              <span className="tab-count">{request.headers.filter((h) => h.enabled).length}</span>
            </button>
            <button
              className={`tab ${activeTab === "body" ? "active" : ""}`}
              onClick={() => setActiveTab("body")}
            >
              Body
            </button>
            <button
              className={`tab ${activeTab === "response" ? "active" : ""}`}
              onClick={() => setActiveTab("response")}
            >
              Response
              {response && (
                <span
                  className="status-badge"
                  style={{ background: getStatusColor(response.status) }}
                >
                  {response.status}
                </span>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === "headers" && (
              <div className="headers-panel">
                <div className="headers-list">
                  {request.headers.map((header, i) => (
                    <div key={i} className={`header-row ${header.enabled ? "" : "disabled"}`}>
                      <input
                        type="checkbox"
                        checked={header.enabled}
                        onChange={(e) => updateHeader(i, "enabled", e.target.checked)}
                      />
                      <input
                        type="text"
                        placeholder="Key"
                        value={header.key}
                        onChange={(e) => updateHeader(i, "key", e.target.value)}
                        className="header-input key"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={header.value}
                        onChange={(e) => updateHeader(i, "value", e.target.value)}
                        className="header-input value"
                      />
                      <button className="remove-btn" onClick={() => removeHeader(i)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <button className="add-header-btn" onClick={addHeader}>
                  + Add Header
                </button>
              </div>
            )}

            {activeTab === "body" && (
              <div className="body-panel">
                <textarea
                  ref={bodyTextareaRef}
                  className="body-textarea"
                  placeholder='{"key": "value"}'
                  value={request.body}
                  onChange={(e) => setRequest((r) => ({ ...r, body: e.target.value }))}
                />
                <div className="body-actions">
                  <button onClick={() => setRequest((r) => ({ ...r, body: formatJson(r.body) }))}>
                    Format JSON
                  </button>
                  <button onClick={() => setRequest((r) => ({ ...r, body: "" }))}>Clear</button>
                </div>
              </div>
            )}

            {activeTab === "response" && (
              <div className="response-panel">
                {loading && (
                  <div className="loading-state">
                    <span className="spinner large" />
                    <p>Sending request...</p>
                  </div>
                )}
                {!loading && !response && (
                  <div className="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                    <p>Enter a URL and click Send to make a request</p>
                  </div>
                )}
                {response && (
                  <>
                    <div className="response-meta">
                      <div className="meta-item">
                        <span className="meta-label">Status</span>
                        <span
                          className="meta-value status"
                          style={{ color: getStatusColor(response.status) }}
                        >
                          {response.status} {response.status_text}
                        </span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Time</span>
                        <span className="meta-value">{response.time_ms}ms</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Size</span>
                        <span className="meta-value">
                          {(response.body.length / 1024).toFixed(2)} KB
                        </span>
                      </div>
                    </div>
                    <div className="response-body-wrapper">
                      <pre className="response-body">{formatJson(response.body, getContentType(response.headers))}</pre>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
