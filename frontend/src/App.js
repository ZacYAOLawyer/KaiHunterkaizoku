import React, { useState } from 'react';
import './App.css';

function App() {
  const [videoUrl, setVideoUrl] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyze = async () => {
    try {
      const res = await fetch('/fastapi/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_url: videoUrl })
      });
      const data = await res.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Analyze error:', error);
      alert('分析失敗');
    }
  };

  return (
    <div className="App">
      <h1>KaiKaiShield - 短影片價值分析 Demo</h1>
      <div className="container">
        <input
          type="text"
          placeholder="輸入影片連結"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
        <button onClick={handleAnalyze}>分析影片</button>
      </div>
      {analysis && (
        <div className="analysis-result">
          <h3>分析結果</h3>
          <pre>{JSON.stringify(analysis, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
