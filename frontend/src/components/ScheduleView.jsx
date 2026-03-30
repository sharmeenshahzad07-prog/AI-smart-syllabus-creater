import { useState, useEffect } from 'react';

const formatTime = (hours) => {
  if (hours < 1) {
    return `${Math.round(hours * 60)} mins`;
  }
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export default function ScheduleView({ activePlan, onUpdateProgress, onReset }) {
  const schedule = activePlan?.schedule || [];
  const [completedTopics, setCompletedTopics] = useState(new Set(activePlan?.completedTopics || []));

  // Update progress to parent whenever it changes locally
  useEffect(() => {
    onUpdateProgress(completedTopics);
  }, [completedTopics]);

  if (!schedule || schedule.length === 0) {
    return (
      <div className="glass-card schedule-view printable">
        <h2 style={{color: 'var(--text-primary)', textAlign: 'center'}}>No Topics Found</h2>
        <div style={{textAlign: 'center'}}>
          <button className="btn-primary" onClick={onReset}>Try Another File</button>
        </div>
      </div>
    );
  }

  const toggleTopic = (topic) => {
    const next = new Set(completedTopics);
    if (next.has(topic)) next.delete(topic);
    else next.add(topic);
    setCompletedTopics(next);
  };

  const progress = Math.round((completedTopics.size / schedule.length) * 100);
  const totalHours = schedule.reduce((acc, curr) => acc + curr.allocated_time_hours, 0);
  const avgComplexity = (schedule.reduce((acc, curr) => acc + curr.complexity, 0) / schedule.length).toFixed(1);
  const hardTopics = schedule.filter(t => t.complexity >= 4).length;

  return (
    <div className="schedule-container" style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
      {/* Progress Bar */}
      <div className="glass-card no-print" style={{padding: '1.5rem'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem'}}>
          <span style={{fontWeight: '600'}}>Syllabus Mastery: {activePlan.fileName}</span>
          <span style={{color: 'var(--accent)'}}>{progress}% COMPLETE</span>
        </div>
        <div style={{height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden'}}>
          <div style={{width: `${progress}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.5s ease', boxShadow: '0 0 10px var(--accent)'}}></div>
        </div>
      </div>

      {/* Insights Dashboard */}
      <div className="glass-card printable" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', textAlign: 'center'}}>
        <div className="insight-item">
          <div style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Total Prep</div>
          <div style={{fontSize: '2rem', fontWeight: '700', color: 'var(--accent)'}}>{formatTime(totalHours)}</div>
        </div>
        <div className="insight-item">
          <div style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Avg. Complexity</div>
          <div style={{fontSize: '2rem', fontWeight: '700', color: '#60a5fa'}}>{avgComplexity}/5</div>
        </div>
        <div className="insight-item">
          <div style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Critical Topics</div>
          <div style={{fontSize: '2rem', fontWeight: '700', color: '#f87171'}}>{hardTopics}</div>
        </div>
      </div>

      <div className="glass-card schedule-view printable">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
          <h2 style={{margin: 0}}>Your Optimized Roadmap</h2>
          <button className="btn-secondary no-print" onClick={() => window.print()} style={{padding: '0.5rem 1rem', fontSize: '0.9rem'}}>
            ⎙ Export PDF
          </button>
        </div>
        
        <div className="timeline">
          {schedule.map((item, index) => (
            <div className={`timeline-item ${completedTopics.has(item.topic) ? 'completed' : ''}`} key={index} style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="timeline-marker no-print" style={{cursor: 'default'}}>
                {completedTopics.has(item.topic) ? '✓' : item.priority_order}
              </div>
              <div className="timeline-marker only-print">{item.priority_order}</div>
              
              <div className="timeline-content" style={{
                border: completedTopics.has(item.topic) ? '1px solid #22c55e' : '1px solid var(--glass-border)',
                background: completedTopics.has(item.topic) ? 'rgba(34, 197, 94, 0.05)' : 'var(--glass-bg)'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <div className="timeline-title">
                    {item.topic}
                    {completedTopics.has(item.topic) && <span style={{marginLeft: '0.8rem', color: '#22c55e', fontSize: '0.8rem', fontWeight: 'bold'}}>COMPLETED</span>}
                  </div>
                  <button 
                    className={`done-badge no-print ${completedTopics.has(item.topic) ? 'active' : ''}`}
                    onClick={() => toggleTopic(item.topic)}
                  >
                    {completedTopics.has(item.topic) ? 'Done' : 'Mark as Done'}
                  </button>
                </div>
                
                <div className="timeline-meta">
                  <span className="badge" style={{background: item.complexity >= 4 ? 'rgba(248, 113, 113, 0.2)' : 'rgba(236, 72, 153, 0.15)'}}>
                    Complexity: {item.complexity}/5
                  </span>
                  <span className="badge">Time: {formatTime(item.allocated_time_hours)}</span>
                  
                  <div className="resource-links no-print" style={{marginTop: '0.8rem', display: 'flex', gap: '0.5rem'}}>
                    <a href={`https://www.youtube.com/results?search_query=how+to+study+${item.topic.replace(' ', '+')}`} target="_blank" rel="noreferrer" style={{fontSize: '0.8rem', color: '#f87171'}}>YouTube ↗</a>
                    <a href={`https://www.google.com/search?q=${item.topic.replace(' ', '+')}+study+guide`} target="_blank" rel="noreferrer" style={{fontSize: '0.8rem', color: '#60a5fa'}}>Search ↗</a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{textAlign: 'center', marginTop: '3rem'}} className="no-print">
          <button className="btn-primary" onClick={onReset}>Return to Collection</button>
        </div>
      </div>

      {/* Quick Tips Section */}
      <div className="glass-card no-print" style={{padding: '1.5rem'}}>
        <h3 style={{marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <span>💡</span> Tactical Advice
        </h3>
        <ul style={{color: 'var(--text-secondary)', marginLeft: '1.5rem', lineHeight: '1.8'}}>
          <li>Click the <strong>"Mark as Done"</strong> button when you finish a topic to update your Mastery score.</li>
          <li>Your progress is auto-saved to your <strong>Battle Plan Collection</strong>.</li>
          <li>Use the resource links above each topic card for instant study material.</li>
        </ul>
      </div>
    </div>
  );
}
