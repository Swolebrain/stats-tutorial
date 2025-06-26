import React, { useState, useCallback } from 'react'
import HistogramChart from './components/HistogramChart'
import { useStatisticsSimulator } from './hooks/useStatisticsSimulator'
import './style.css'

const App: React.FC = () => {
  const {
    isRunning,
    results,
    currentExperiment,
    params,
    histogramData,
    statistics,
    selectedBarStats,
    selectedBar,
    runSimulation,
    stopSimulation,
    reset,
    updateParams,
    selectBar,
    clearSelection,
  } = useStatisticsSimulator()

  // Validation state
  const [isProbabilityValid, setIsProbabilityValid] = useState(true)

  // Event handlers for controls
  const updateProbability = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value
    
    // Allow empty input (user is still typing)
    if (inputValue === '') {
      setIsProbabilityValid(false)
      return
    }
    
    const value = parseFloat(inputValue)
    
    // Validate the input - allow any number between 0 and 1 (inclusive)
    const epsilon = 1e-10
    if (isNaN(value) || value < -epsilon || value > 1 + epsilon) {
      setIsProbabilityValid(false)
      return // Don't update if invalid
    }
    
    // Valid input - update the parameter
    setIsProbabilityValid(true)
    updateParams({ probabilityOfSuccess: value })
  }, [updateParams])

  const validateProbability = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    const inputValue = event.target.value
    
    if (inputValue === '') {
      // Set to default value if empty
      updateParams({ probabilityOfSuccess: 0.5 })
      setIsProbabilityValid(true)
      event.target.value = '0.5'
    }
  }, [updateParams])

  const updateTrials = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value)
    if (!isNaN(value) && value > 0) {
      updateParams({ trialsPerExperiment: value })
    }
  }, [updateParams])

  const updateExperiments = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value)
    if (!isNaN(value) && value > 0) {
      updateParams({ numberOfExperiments: value })
    }
  }, [updateParams])

  const startSimulation = useCallback(() => {
    if (!isProbabilityValid) return
    runSimulation()
  }, [isProbabilityValid, runSimulation])

  const handleBarClick = useCallback((barIndex: number) => {
    selectBar(barIndex)
  }, [selectBar])

  const handleChartClick = useCallback((event: React.MouseEvent) => {
    // Clear selection when clicking outside bars
    if (event.target === event.currentTarget) {
      clearSelection()
    }
  }, [clearSelection])

  return (
    <div id="app">
      <div className="container">
        <header className="header">
          <h1>Statistics Simulator</h1>
          <p>
            Visualize the distribution of random events across multiple
            experiments
          </p>
        </header>

        <div className="content">
          {/* Simulation Controls */}
          <div className="controls">
            <div className="control-group">
              <label htmlFor="probability">Probability of Success</label>
              <input
                id="probability"
                type="number"
                min="0"
                max="1"
                step="any"
                defaultValue={params.probabilityOfSuccess}
                onChange={updateProbability}
                onBlur={validateProbability}
                placeholder="0.5"
                className={!isProbabilityValid ? 'invalid' : ''}
              />
              <div className={`value-display ${!isProbabilityValid ? 'error' : ''}`}>
                {isProbabilityValid ? (
                  <span>
                    {(params.probabilityOfSuccess * 100).toFixed(
                      params.probabilityOfSuccess < 0.01 ? 3 : 1
                    )}%
                  </span>
                ) : (
                  <span className="error-text">Must be between 0.0 and 1.0</span>
                )}
              </div>
            </div>

            <div className="control-group">
              <label htmlFor="trials">Trials per Experiment</label>
              <input
                id="trials"
                type="number"
                step="1"
                defaultValue={params.trialsPerExperiment}
                onChange={updateTrials}
                placeholder="100"
              />
              <div className="value-display">
                {params.trialsPerExperiment} trials
              </div>
            </div>

            <div className="control-group">
              <label htmlFor="experiments">Number of Experiments</label>
              <input
                id="experiments"
                type="number"
                step="1"
                defaultValue={params.numberOfExperiments}
                onChange={updateExperiments}
                placeholder="1000"
              />
              <div className="value-display">
                {params.numberOfExperiments} experiments
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="button-container">
            <button 
              className="btn" 
              disabled={isRunning || !isProbabilityValid} 
              onClick={startSimulation}
              title={!isProbabilityValid ? 'Please enter a valid probability (0.0 to 1.0)' : ''}
            >
              {isRunning ? "Running..." : "Start Simulation"}
            </button>
            {isRunning && (
              <button
                className="btn"
                style={{ marginLeft: '10px', background: '#dc3545' }}
                onClick={stopSimulation}
              >
                Stop
              </button>
            )}
            {!isRunning && results.length > 0 && (
              <button
                className="btn"
                style={{ marginLeft: '10px', background: '#28a745' }}
                onClick={reset}
              >
                Reset
              </button>
            )}
          </div>

          {/* Progress Indicator */}
          {isRunning && (
            <div className="progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${
                      (currentExperiment / params.numberOfExperiments) * 100
                    }%`,
                  }}
                ></div>
              </div>
              <div className="progress-text">
                Experiment {currentExperiment} of
                {params.numberOfExperiments}
              </div>
            </div>
          )}

          {/* Histogram Chart */}
          <div className="chart-container" onClick={handleChartClick}>
            <HistogramChart
              histogramData={histogramData}
              title={`Distribution of Successes (${params.numberOfExperiments} experiments, ${params.trialsPerExperiment} trials each)`}
              isAnimating={isRunning}
              selectedBar={selectedBar}
              onBarClick={handleBarClick}
            />
          </div>

          {/* Statistical Analysis */}
          {results.length > 0 && (
            <div className="statistics-section">
              <div className="statistics-container">
                {/* Overall Statistics */}
                <div className="stats-card">
                  <h3>Overall Distribution Statistics</h3>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-label">Mean:</span>
                      <span className="stat-value">{statistics.mean.toFixed(3)}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Expected Value:</span>
                      <span className="stat-value">{statistics.expectedValue.toFixed(3)}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Standard Deviation:</span>
                      <span className="stat-value">{statistics.standardDeviation.toFixed(3)}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Range:</span>
                      <span className="stat-value">{statistics.min} - {statistics.max}</span>
                    </div>
                    <div className="stat-item highlight">
                      <span className="stat-label">Z-Score:</span>
                      <span className="stat-value">{statistics.zScore.toFixed(4)}</span>
                    </div>
                    <div className="stat-item highlight">
                      <span className="stat-label">P-Value:</span>
                      <span className="stat-value">{statistics.pValue.toFixed(6)}</span>
                    </div>
                  </div>
                  <div className="stats-explanation">
                    <p><strong>Z-Score:</strong> Measures how many standard deviations the observed mean is from the expected value.</p>
                    <p><strong>P-Value:</strong> Probability of observing this result (or more extreme) if the null hypothesis is true.</p>
                  </div>
                </div>

                {/* Selected Bar Statistics */}
                {selectedBarStats && (
                  <div className="stats-card selected-stats">
                    <h3>Selected Bar Statistics</h3>
                    <div className="stats-grid">
                      <div className="stat-item">
                        <span className="stat-label">Successes:</span>
                        <span className="stat-value">{selectedBarStats.successes}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Frequency:</span>
                        <span className="stat-value">{selectedBarStats.frequency}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Percentage:</span>
                        <span className="stat-value">{((selectedBarStats.frequency / results.length) * 100).toFixed(2)}%</span>
                      </div>
                      <div className="stat-item highlight">
                        <span className="stat-label">Z-Score:</span>
                        <span className="stat-value">{selectedBarStats.zScore.toFixed(4)}</span>
                      </div>
                      <div className="stat-item highlight">
                        <span className="stat-label">P-Value:</span>
                        <span className="stat-value">{selectedBarStats.pValue.toFixed(6)}</span>
                      </div>
                    </div>
                    <div className="stats-explanation">
                      <p><strong>Z-Score:</strong> How many standard deviations this specific outcome is from the expected value.</p>
                      <p><strong>P-Value:</strong> Probability of observing this specific outcome (or more extreme) in a binomial distribution.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          {results.length === 0 && (
            <div className="instructions">
              <h3>How to use the simulator:</h3>
              <ol>
                <li>
                  Enter the <strong>Probability of Success</strong> (0.0 to 1.0,
                  e.g., 0.5 for a fair coin)
                </li>
                <li>
                  Set the <strong>Trials per Experiment</strong> (any positive
                  integer, e.g., 100 coin flips)
                </li>
                <li>
                  Choose the <strong>Number of Experiments</strong> to run (any
                  positive integer)
                </li>
                <li>Click <strong>Start Simulation</strong> to see the results</li>
                <li>Click on any bar in the histogram to view detailed statistics for that outcome</li>
              </ol>
              <p>
                The histogram will show the distribution of success counts across
                all experiments with unlimited bins for precise visualization.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App 