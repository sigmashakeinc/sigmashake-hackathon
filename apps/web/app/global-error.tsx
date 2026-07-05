"use client";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <head>
        <style>{`
          body {
            margin: 0;
            display: flex;
            height: 100vh;
            align-items: center;
            justify-content: center;
            background: #121414;
            color: #e3e2e2;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }
          .container { text-align: center; max-width: 480px; padding: 24px; }
          .code { font-size: 48px; font-weight: bold; color: #e01e2e; margin: 0; }
          .title { font-size: 20px; font-weight: 600; margin: 8px 0; }
          .detail { font-size: 12px; color: #888; margin: 16px 0; font-family: monospace; word-break: break-all; }
          .btn {
            background: #e01e2e; color: white; border: none;
            padding: 8px 24px; border-radius: 4px; font-size: 14px; cursor: pointer;
          }
          .btn:hover { background: #c01826; }
        `}</style>
      </head>
      <body>
        <div className="container">
          <p className="code">500</p>
          <h1 className="title">Critical Error</h1>
          <p className="detail">{error.message}</p>
          <button className="btn" onClick={reset}>
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
