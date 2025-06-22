import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useStatisticsSimulator } from '../useStatisticsSimulator'

describe('useStatisticsSimulator', () => {
  beforeEach(() => {
    // Reset Math.random to ensure consistent testing
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
  })

  it('should initialize with default parameters', () => {
    const simulator = useStatisticsSimulator()
    
    expect(simulator.params.value).toEqual({
      probabilityOfSuccess: 0.5,
      trialsPerExperiment: 100,
      numberOfExperiments: 1000
    })
    
    expect(simulator.isRunning.value).toBe(false)
    expect(simulator.results.value).toEqual([])
    expect(simulator.currentExperiment.value).toBe(0)
  })

  it('should update parameters correctly', () => {
    const simulator = useStatisticsSimulator()
    
    simulator.updateParams({
      probabilityOfSuccess: 0.3,
      trialsPerExperiment: 50,
      numberOfExperiments: 500
    })
    
    expect(simulator.params.value).toEqual({
      probabilityOfSuccess: 0.3,
      trialsPerExperiment: 50,
      numberOfExperiments: 500
    })
  })

  it('should generate trial results correctly', () => {
    const simulator = useStatisticsSimulator()
    
    // With Math.random mocked to return 0.5
    // probabilityOfSuccess = 0.5, so Math.random() < 0.5 should be false
    simulator.updateParams({ probabilityOfSuccess: 0.5 })
    
    // Mock Math.random to return 0.3 (less than 0.5, so should be success)
    vi.spyOn(Math, 'random').mockReturnValue(0.3)
    
    // We can't directly test the private generateTrial function,
    // but we can test it indirectly through runExperiment
    const result = simulator['runExperiment'](1)
    
    // With 100 trials and Math.random returning 0.3 (success),
    // all trials should be successes
    expect(result.successes).toBe(100)
    expect(result.experimentNumber).toBe(1)
    expect(result.timestamp).toBeDefined()
  })

  it('should calculate histogram data correctly', () => {
    const simulator = useStatisticsSimulator()
    
    // Mock results
    simulator['results'].value = [
      { experimentNumber: 1, successes: 45, timestamp: Date.now() },
      { experimentNumber: 2, successes: 50, timestamp: Date.now() },
      { experimentNumber: 3, successes: 55, timestamp: Date.now() },
      { experimentNumber: 4, successes: 45, timestamp: Date.now() },
      { experimentNumber: 5, successes: 50, timestamp: Date.now() }
    ]
    
    const histogramData = simulator.histogramData.value
    
    expect(histogramData.labels).toBeDefined()
    expect(histogramData.data).toBeDefined()
    expect(histogramData.labels.length).toBeGreaterThan(0)
    expect(histogramData.data.length).toBeGreaterThan(0)
  })

  it('should calculate statistics correctly', () => {
    const simulator = useStatisticsSimulator()
    
    // Mock results with known values
    simulator['results'].value = [
      { experimentNumber: 1, successes: 40, timestamp: Date.now() },
      { experimentNumber: 2, successes: 50, timestamp: Date.now() },
      { experimentNumber: 3, successes: 60, timestamp: Date.now() }
    ]
    
    simulator.updateParams({
      probabilityOfSuccess: 0.5,
      trialsPerExperiment: 100
    })
    
    const stats = simulator.statistics.value
    
    expect(stats.mean).toBe(50) // (40 + 50 + 60) / 3
    expect(stats.min).toBe(40)
    expect(stats.max).toBe(60)
    expect(stats.expectedValue).toBe(50) // 0.5 * 100
    expect(stats.standardDeviation).toBeCloseTo(8.165, 2)
  })

  it('should reset simulation correctly', () => {
    const simulator = useStatisticsSimulator()
    
    // Add some results
    simulator['results'].value = [
      { experimentNumber: 1, successes: 50, timestamp: Date.now() }
    ]
    simulator['currentExperiment'].value = 1
    simulator['isRunning'].value = true
    
    simulator.reset()
    
    expect(simulator.results.value).toEqual([])
    expect(simulator.currentExperiment.value).toBe(0)
    expect(simulator.isRunning.value).toBe(false)
  })

  it('should update animation speed correctly', () => {
    const simulator = useStatisticsSimulator()
    
    simulator.updateAnimationSpeed(100)
    expect(simulator.animationSpeed.value).toBe(100)
    
    // Test bounds
    simulator.updateAnimationSpeed(5) // Below minimum
    expect(simulator.animationSpeed.value).toBe(10)
    
    simulator.updateAnimationSpeed(300) // Above maximum
    expect(simulator.animationSpeed.value).toBe(200)
  })

  it('should handle empty results in statistics', () => {
    const simulator = useStatisticsSimulator()
    
    const stats = simulator.statistics.value
    
    expect(stats.mean).toBe(0)
    expect(stats.variance).toBe(0)
    expect(stats.standardDeviation).toBe(0)
    expect(stats.min).toBe(0)
    expect(stats.max).toBe(0)
    expect(stats.expectedValue).toBe(0)
  })

  it('should handle empty results in histogram data', () => {
    const simulator = useStatisticsSimulator()
    
    const histogramData = simulator.histogramData.value
    
    expect(histogramData.labels).toEqual([])
    expect(histogramData.data).toEqual([])
  })

  it('should stop simulation correctly', () => {
    const simulator = useStatisticsSimulator()
    
    simulator['isRunning'].value = true
    simulator.stopSimulation()
    
    expect(simulator.isRunning.value).toBe(false)
  })
}) 