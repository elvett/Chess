import React, { useState } from 'react';
import axios from 'axios';

interface StockfishAnalyzerProps {
  fen: string;
}

interface StockfishResponse {
  bestmove: string;
  eval?: number | string;
  mate?: number | string;
  continuation: string;
  success?: boolean;
  data?: string;
}

const StockfishAnalyzer: React.FC<StockfishAnalyzerProps> = ({ fen }) => {
  const [depth, setDepth] = useState(15);
  const [result, setResult] = useState<StockfishResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzePosition = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.get<StockfishResponse>('https://stockfish.online/api/s/v2.php', {
        params: { fen, depth },
      });

      if (response.data.success) {
        setResult(response.data);
      } else {
        setError(`Error: ${response.data.data}`);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(`HTTP Error: ${err.message}`);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      fontFamily: '"Helvetica Neue", Arial, sans-serif',
      padding: '1.5rem',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#222f3e',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
    },
    heading: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#ecf0f1',
      marginBottom: '1rem',
    },
    fenText: {
      fontSize: '1rem',
      color: '#bfc9d1',
      marginBottom: '1rem',
    },
    inputGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '1rem',
    },
    label: {
      fontSize: '1rem',
      color: '#ecf0f1',
    },
    input: {
      width: '60px',
      padding: '6px',
      border: '1px solid #34495e',
      borderRadius: '4px',
      fontSize: '1rem',
      outline: 'none',
      background: '#2c3e50',
      color: '#ecf0f1',
      transition: 'border-color 0.2s',
    },
    inputFocus: {
      borderColor: '#2563eb',
      boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.2)',
    },
    button: {
      padding: '8px 16px',
      backgroundColor: loading ? '#3b4252' : '#2563eb',
      color: '#ecf0f1',
      border: 'none',
      borderRadius: '4px',
      fontSize: '1rem',
      fontWeight: '500',
      cursor: loading ? 'not-allowed' : 'pointer',
      transition: 'background-color 0.2s',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
    buttonHover: {
      backgroundColor: loading ? '#3b4252' : '#1d4ed8',
    },
    error: {
      color: '#ff6b6b',
      fontSize: '0.875rem',
      marginTop: '0.5rem',
    },
    result: {
      marginTop: '1rem',
      padding: '1rem',
      backgroundColor: '#293447',
      borderRadius: '4px',
      fontSize: '1rem',
      color: '#ecf0f1',
      lineHeight: '1.5',
    },
    resultItem: {
      marginBottom: '0.5rem',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Stockfish Analyzer</h2>

      <p style={styles.fenText}>
        <strong>FEN for analysis:</strong> {fen}
      </p>

      <div style={styles.inputGroup}>
        <label style={styles.label}>
          Depth (1–15):
          <input
            type="number"
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            min={1}
            max={15}
            style={styles.input}
            onFocus={(e) => (e.target.style.borderColor = styles.inputFocus.borderColor)}
            onBlur={(e) => (e.target.style.borderColor = styles.input.border)}
          />
        </label>

        <button
          onClick={analyzePosition}
          disabled={loading}
          style={styles.button}
          onMouseOver={(e) =>
            !loading && (e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor)
          }
          onMouseOut={(e) =>
            !loading && (e.currentTarget.style.backgroundColor = styles.button.backgroundColor)
          }
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {result && (
        <div style={styles.result}>
          <p style={styles.resultItem}>
            <strong>✔️ Best Move:</strong> {result.bestmove}
          </p>
          <p style={styles.resultItem}>
            <strong>📈 Evaluation:</strong> {result.eval ?? 'N/A'}
          </p>
          <p style={styles.resultItem}>
            <strong>♟️ Mate in:</strong> {result.mate ?? 'No forced mate'}
          </p>
          <p style={styles.resultItem}>
            <strong>🔁 Continuation:</strong> {result.continuation}
          </p>
        </div>
      )}
    </div>
  );
};

export default StockfishAnalyzer;
