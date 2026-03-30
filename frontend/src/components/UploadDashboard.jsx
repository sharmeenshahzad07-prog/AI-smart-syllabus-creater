import { useState } from 'react';

export default function UploadDashboard({ onScheduleGenerated, recentPlans, onLoadPlan, onDeletePlan }) {
  const [file, setFile] = useState(null);
  const [hours, setHours] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async () => {
    if (!file) {
      setError('Please select or drop a syllabus file first.');
      return;
    }
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('available_hours', hours);

    try {
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      onScheduleGenerated(data.schedule, file.name);
    } catch (err) {
      setError('Error processing syllabus. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-v2">
      {/* Refined Hero Section */}
      <section className="hero-landing">
        <h2 className="hero-title">Your Exam <span>Battle Plan</span> Starts Here</h2>
        <p className="hero-subtitle">Transform any syllabus into a tactical study roadmap in seconds.</p>
        
        <div className="upload-box-minimal glass-card">
          <div 
            className={`drop-zone-refined ${file ? 'has-file' : ''}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              setFile(e.dataTransfer.files[0]);
            }}
          >
            <input 
              type="file" 
              id="fileInput" 
              onChange={(e) => setFile(e.target.files[0])} 
              hidden 
            />
            <label htmlFor="fileInput">
              {file ? (
                <div className="file-pill">
                  <span>📄 {file.name}</span>
                  <button onClick={(e) => {e.preventDefault(); setFile(null);}} className="clear-file">×</button>
                </div>
              ) : (
                <div className="upload-prompt">
                  <span className="icon-pulse">📤</span>
                  <p>Drop PDF/TXT or Click to Upload</p>
                </div>
              )}
            </label>
          </div>

          <div className="upload-actions">
            <div className="budget-selector">
              <label>Study Budget</label>
              <div className="number-input-wrapper">
                <input 
                  type="number" 
                  value={hours} 
                  onChange={(e) => setHours(e.target.value)} 
                  min="1"
                />
                <span>HRS</span>
              </div>
            </div>
            <button 
              className="btn-primary-large" 
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? <span className="spinner"></span> : 'Generate My Roadmap'}
            </button>
          </div>
          {error && <p className="error-msg-toast">{error}</p>}
        </div>
      </section>

      {/* Modern Plan Gallery */}
      {recentPlans && recentPlans.length > 0 && (
        <section className="plans-library">
          <div className="section-header">
            <h3>Recent Battle Plans</h3>
            <span className="count-badge">{recentPlans.length} SAVED</span>
          </div>
          <div className="library-grid">
            {recentPlans.map((plan) => {
              const progress = Math.round(((plan.completedTopics?.length || 0) / plan.schedule.length) * 100);
              return (
                <div key={plan.id} className="library-card glass-card">
                  <div className="card-top">
                    <span className="timestamp">{plan.timestamp.split(',')[0]}</span>
                    <button className="delete-btn" onClick={(e) => {
                      e.stopPropagation();
                      console.log("Delete clicked for plan:", plan.id);
                      onDeletePlan(plan.id);
                    }}>Delete</button>
                  </div>
                  
                  <div className="card-body">
                    <h4>{plan.fileName.length > 25 ? plan.fileName.substring(0, 22) + '...' : plan.fileName}</h4>
                    <div className="mini-progress">
                      <div className="bar"><div style={{width: `${progress}%`}}></div></div>
                      <span>{progress}% Mastery</span>
                    </div>
                  </div>

                  <button className="restore-btn" onClick={() => onLoadPlan(plan)}>
                    Continue Study <span>→</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Minimal Features Infographic */}
      <div className="quick-features">
        <div className="q-feat">
          <strong>🧠 Smart Prioritization</strong>
          <p>Hard topics first when you have energy.</p>
        </div>
        <div className="q-feat">
          <strong>⏱️ Dynamic Scaling</strong>
          <p>Always fits your available hours.</p>
        </div>
        <div className="q-feat">
          <strong>📂 Multi-Plan Vault</strong>
          <p>All your subjects in one place.</p>
        </div>
      </div>
    </div>
  );
}
