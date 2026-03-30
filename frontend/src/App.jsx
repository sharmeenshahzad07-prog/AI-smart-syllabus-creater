import { useState, useEffect } from 'react'
import UploadDashboard from './components/UploadDashboard'
import ScheduleView from './components/ScheduleView'
import SyllabusChat from './components/SyllabusChat'

function App() {
  const [activePlan, setActivePlan] = useState(null)
  
  // Persistent Plan Collection
  const [savedPlans, setSavedPlans] = useState(() => {
    const saved = localStorage.getItem('smart_syllabus_plans');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistent Chat State
  const [chatMessages, setChatMessages] = useState(() => {
    const saved = localStorage.getItem('smart_syllabus_chat');
    return saved ? JSON.parse(saved) : [
      { role: 'bot', text: "Hello! I'm your AI Study Assistant. Upload a syllabus to get started, or ask me any general study questions! 📚" }
    ];
  });

  // Save plans to localStorage
  useEffect(() => {
    localStorage.setItem('smart_syllabus_plans', JSON.stringify(savedPlans));
  }, [savedPlans]);

  // Save chat to localStorage
  useEffect(() => {
    localStorage.setItem('smart_syllabus_chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  const handleNewPlan = (planData, fileName) => {
    const newPlan = {
      id: Date.now(),
      fileName: fileName || 'Syllabus',
      timestamp: new Date().toLocaleString(),
      schedule: planData,
      completedTopics: [] // Initialize progress for new plan
    };
    const updated = [newPlan, ...savedPlans].slice(0, 10); // Keep last 10
    setSavedPlans(updated);
    setActivePlan(newPlan);
  };

  const handleUpdateProgress = (planId, completedSet) => {
    const updated = savedPlans.map(p => 
      p.id === planId ? { ...p, completedTopics: Array.from(completedSet) } : p
    );
    setSavedPlans(updated);
  };

  const [planToDelete, setPlanToDelete] = useState(null);

  const confirmDelete = () => {
    if (planToDelete) {
      setSavedPlans(savedPlans.filter(p => p.id !== planToDelete));
      setPlanToDelete(null);
    }
  };

  const cancelDelete = () => setPlanToDelete(null);

  return (
    <div className="app-container">
      <header className="header" style={{animation: 'fadeIn 1s ease'}}>
        <h1 className="title">Smart Syllabus</h1>
        <p className="subtitle">AI-Powered Exam Preparation Planner</p>
      </header>

      <main>
        {!activePlan ? (
          <UploadDashboard 
            onScheduleGenerated={(data, name) => handleNewPlan(data, name)} 
            recentPlans={savedPlans}
            onLoadPlan={setActivePlan}
            onDeletePlan={setPlanToDelete}
          />
        ) : (
          <ScheduleView 
            activePlan={activePlan} 
            onUpdateProgress={(set) => handleUpdateProgress(activePlan.id, set)}
            onReset={() => setActivePlan(null)} 
          />
        )}
      </main>

      <SyllabusChat 
        schedule={activePlan?.schedule} 
        messages={chatMessages} 
        setMessages={setChatMessages} 
      />

      {/* Custom Delete Modal */}
      {planToDelete && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <h3>Delete Study Plan?</h3>
            <p>This will permanently remove your progress and study schedule for this syllabus.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={cancelDelete}>Cancel</button>
              <button className="btn-primary-large delete-confirm-btn" onClick={confirmDelete}>Delete Forever</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  )
}

export default App
