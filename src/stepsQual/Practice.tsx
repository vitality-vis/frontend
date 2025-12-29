import * as React from "react";
import { useState, useEffect } from "react";
import App from "../components/App";
import StepLayout from "../structure/StepLayout";
import { useStepNav } from "../hooks/useStepNav";
import { Logger } from "../socket/logger";
import LoadingScreen from "../components/LoadingScreen";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faCircle,
  faChevronDown,
  faChevronUp,
  faTimes,
  faLightbulb
} from '@fortawesome/free-solid-svg-icons';

console.log('🔍 Practice.tsx file is loading!');

interface PracticeTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

const Practice = ({currentStep, totalSteps}) => {
  console.log('🎯 Practice component function called!');
  const { goNext } = useStepNav();
  const appRef = React.useRef<App>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTaskPanel, setShowTaskPanel] = useState(true);
  const [tasks, setTasks] = useState<PracticeTask[]>([
    {
      id: 'search',
      title: 'Search for papers',
      description: 'Use the search box or filters in the table to find papers',
      completed: false
    },
    {
      id: 'save',
      title: 'Save papers to your collection',
      description: 'Add at least 2 papers to your saved collection',
      completed: false
    },
    {
      id: 'note',
      title: 'Take notes',
      description: 'Write a brief note in the notes panel about any paper',
      completed: false
    },
    {
      id: 'explore',
      title: 'Explore the visualization',
      description: 'Interact with the paper visualization to see related papers',
      completed: false
    }
  ]);

  const [taskStartTime, setTaskStartTime] = useState<Date | null>(null);

  useEffect(() => {
    // Log practice session start
    Logger.logStudyEvent({
      component: 'Practice',
      action: 'sessionStart',
      interactionName: 'practiceSessionStarted'
    });
    setTaskStartTime(new Date());

    return () => {
      // Log practice session end
      Logger.logStudyEvent({
        component: 'Practice',
        action: 'sessionEnd',
        interactionName: 'practiceSessionEnded',
        details: {
          duration: taskStartTime ? (new Date().getTime() - taskStartTime.getTime()) / 1000 : 0
        }
      });
    };
  }, []);

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    Logger.logStudyEvent({
      component: 'Practice',
      action: 'dismissWelcome',
      interactionName: 'practiceWelcomeDismissed'
    });
  };

  const handleWelcomeStart = () => {
    setShowWelcome(false);
    Logger.logStudyEvent({
      component: 'Practice',
      action: 'startPractice',
      interactionName: 'practiceStarted'
    });
  };

  const toggleTaskPanel = () => {
    const newState = !showTaskPanel;
    setShowTaskPanel(newState);
    Logger.logStudyEvent({
      component: 'Practice',
      action: 'toggleTaskPanel',
      interactionName: newState ? 'taskPanelOpened' : 'taskPanelClosed'
    });
  };

  const markTaskComplete = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId && !task.completed
          ? { ...task, completed: true }
          : task
      )
    );

    const task = tasks.find(t => t.id === taskId);
    if (task && !task.completed) {
      Logger.logStudyEvent({
        component: 'Practice',
        action: 'completeTask',
        interactionName: 'practiceTaskCompleted',
        details: {
          taskId,
          taskTitle: task.title,
          timestamp: new Date().toISOString()
        }
      });
    }
  };

  const handleNext = () => {
    const completedCount = tasks.filter(t => t.completed).length;
    const duration = taskStartTime ? (new Date().getTime() - taskStartTime.getTime()) / 1000 : 0;

    Logger.logStudyEvent({
      component: 'Practice',
      action: 'finishPractice',
      interactionName: 'practiceCompleted',
      details: {
        completedTasks: completedCount,
        totalTasks: tasks.length,
        duration,
        taskDetails: tasks.map(t => ({ id: t.id, title: t.title, completed: t.completed }))
      }
    });

    // Log the Quill content before navigating
    if (appRef.current) {
      appRef.current.logQuillContent();
    }
    // Then navigate to next step
    goNext();
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercentage = (completedCount / tasks.length) * 100;
  const allTasksComplete = completedCount === tasks.length;

  console.log('Practice component rendering, showWelcome:', showWelcome);

  return (
    <StepLayout
      title={`Practice (Step ${currentStep}/${totalSteps})`}
      showNext
      showPrev
      notPractice={false}
      onNext={handleNext}
      highlightNext={allTasksComplete}
    >
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
      {/* Task Guide Panel */}
      <div style={{
        position: 'fixed',
        top: '80px',
        left: '20px',
        width: '340px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        overflow: 'hidden',
        border: '2px solid #e9ecef'
      }}>
        {/* Panel Header */}
        <div
          onClick={toggleTaskPanel}
          style={{
            padding: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            userSelect: 'none'
          }}
        >
          <div>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
              Practice Tasks
            </h4>
            <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '4px' }}>
              {completedCount} of {tasks.length} completed
            </div>
          </div>
          <FontAwesomeIcon
            icon={showTaskPanel ? faChevronUp : faChevronDown}
            style={{ fontSize: '18px' }}
          />
        </div>

        {/* Progress Bar */}
        {showTaskPanel && (
          <div style={{ padding: '0 16px', paddingTop: '16px' }}>
            <div style={{
              height: '8px',
              backgroundColor: '#e9ecef',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${progressPercentage}%`,
                backgroundColor: '#28a745',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        )}

        {/* Task List */}
        {showTaskPanel && (
          <div style={{ padding: '16px' }}>
            {tasks.map((task, index) => (
              <div
                key={task.id}
                style={{
                  padding: '12px',
                  marginBottom: index < tasks.length - 1 ? '12px' : 0,
                  backgroundColor: task.completed ? '#d4edda' : '#f8f9fa',
                  borderRadius: '8px',
                  border: `2px solid ${task.completed ? '#28a745' : '#e9ecef'}`,
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}>
                  <FontAwesomeIcon
                    icon={task.completed ? faCheckCircle : faCircle}
                    style={{
                      fontSize: '20px',
                      color: task.completed ? '#28a745' : '#dee2e6',
                      marginTop: '2px',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: 600,
                      fontSize: '14px',
                      color: task.completed ? '#155724' : '#2c3e50',
                      marginBottom: '4px',
                      textDecoration: task.completed ? 'line-through' : 'none'
                    }}>
                      {task.title}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: task.completed ? '#155724' : '#6c757d',
                      lineHeight: '1.4'
                    }}>
                      {task.description}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Tip */}
        {showTaskPanel && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#f8f9fa',
            fontSize: '12px',
            color: '#6c757d',
            borderTop: '1px solid #e9ecef',
            textAlign: 'center'
          }}>
            Tasks will auto-complete as you interact with the system
          </div>
        )}
      </div>

      {/* Completion Banner */}
      {allTasksComplete && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          width: '350px',
          backgroundColor: '#d4edda',
          border: '2px solid #28a745',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 4px 16px rgba(40, 167, 69, 0.3)',
          zIndex: 1000,
          animation: 'slideInRight 0.5s ease-out'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              fontSize: '32px',
              lineHeight: 1
            }}>
              
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: 700,
                fontSize: '16px',
                color: '#155724',
                marginBottom: '4px'
              }}>
                All Practice Tasks Complete!
              </div>
              <div style={{
                fontSize: '14px',
                color: '#155724',
                lineHeight: 1.4
              }}>
                Great job! Click the <strong>Next</strong> button when you're ready to continue.
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <LoadingScreen
          message="Loading VitaLITy..."
          subMessage="Preparing the literature review tool"
          progress={loadingProgress}
        />
      )}
      <App
        ref={appRef}
        isPractice={true}
        onPracticeTaskComplete={markTaskComplete}
        onMetadataLoaded={() => setIsLoading(false)}
        onLoadingProgress={(progress) => setLoadingProgress(progress)}
      />
    </StepLayout>
  );
};

export default Practice;
