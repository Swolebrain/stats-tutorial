import { useState, useMemo, useCallback } from 'react'

export interface SimulationParams {
    probabilityOfSuccess: number
    trialsPerExperiment: number
    numberOfExperiments: number
}

export interface ExperimentResult {
    experimentNumber: number
    successes: number
    timestamp: number
}

export interface SimulationStats {
    mean: number
    variance: number
    standardDeviation: number
    min: number
    max: number
    expectedValue: number
    pValue: number
    zScore: number
}

export interface SelectedBarStats {
    successes: number
    frequency: number
    pValue: number
    zScore: number
}

// Standard normal distribution functions
function erf(x: number): number {
    // Approximation of error function
    const a1 = 0.254829592
    const a2 = -0.284496736
    const a3 = 1.421413741
    const a4 = -1.453152027
    const a5 = 1.061405429
    const p = 0.3275911

    const sign = x < 0 ? -1 : 1
    x = Math.abs(x)

    const t = 1.0 / (1.0 + p * x)
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

    return sign * y
}

function normalCDF(x: number, mean: number = 0, stdDev: number = 1): number {
    return 0.5 * (1 + erf((x - mean) / (stdDev * Math.sqrt(2))))
}

function calculateZScore(observedValue: number, expectedValue: number, standardDeviation: number): number {
    if (standardDeviation === 0) return 0
    return (observedValue - expectedValue) / standardDeviation
}

function calculatePValue(zScore: number): number {
    // Two-tailed p-value
    return 2 * (1 - normalCDF(Math.abs(zScore)))
}

export function useStatisticsSimulator() {
    const [isRunning, setIsRunning] = useState(false)
    const [results, setResults] = useState<ExperimentResult[]>([])
    const [currentExperiment, setCurrentExperiment] = useState(0)
    const [selectedBar, setSelectedBar] = useState<number | null>(null)
    const [params, setParams] = useState<SimulationParams>({
        probabilityOfSuccess: 0.5,
        trialsPerExperiment: 100,
        numberOfExperiments: 1000
    })

    const animationSpeed = 30 // Fixed animation speed in milliseconds

    // Generate a single trial result
    const generateTrial = (probability: number): boolean => {
        return Math.random() < probability
    }

    // Run a single experiment
    const runExperiment = (experimentNumber: number, trialsPerExperiment: number, probabilityOfSuccess: number): ExperimentResult => {
        let successes = 0

        for (let i = 0; i < trialsPerExperiment; i++) {
            if (generateTrial(probabilityOfSuccess)) {
                successes++
            }
        }

        return {
            experimentNumber,
            successes,
            timestamp: Date.now()
        }
    }

    const histogramData = useMemo(() => {
        if (results.length === 0) return { labels: [], data: [] }

        const successCounts = results.map((r: ExperimentResult) => r.successes)
        const min = Math.min(...successCounts)
        const max = Math.max(...successCounts)

        // Create bins for histogram - UNLIMITED BINS (removed the 20 bin limit)
        // One bin per possible value (unlimited bins)
        const bins: { [key: number]: number } = {}

        // Initialize bins
        for (let i = min; i <= max; i++) {
            bins[i] = 0
        }

        // Count results in each bin
        successCounts.forEach((count: number) => {
            bins[count] = (bins[count] || 0) + 1
        })

        const labels = Object.keys(bins).map(key => key.toString())
        const data = Object.keys(bins).map(key => bins[parseInt(key)])

        return { labels, data }
    }, [results])

    // Calculate statistics from results
    const statistics = useMemo((): SimulationStats => {
        if (results.length === 0) {
            return {
                mean: 0,
                variance: 0,
                standardDeviation: 0,
                min: 0,
                max: 0,
                expectedValue: 0,
                pValue: 0,
                zScore: 0
            }
        }

        const successCounts = results.map((r: ExperimentResult) => r.successes)
        const n = successCounts.length

        const mean = successCounts.reduce((sum: number, count: number) => sum + count, 0) / n
        const variance = successCounts.reduce((sum: number, count: number) => sum + Math.pow(count - mean, 2), 0) / n
        const standardDeviation = Math.sqrt(variance)
        const min = Math.min(...successCounts)
        const max = Math.max(...successCounts)
        const expectedValue = params.probabilityOfSuccess * params.trialsPerExperiment

        // For binomial distribution: theoretical standard deviation
        const theoreticalStdDev = Math.sqrt(params.trialsPerExperiment * params.probabilityOfSuccess * (1 - params.probabilityOfSuccess))
        
        // Calculate Z-score and P-value for the observed mean vs expected
        const zScore = calculateZScore(mean, expectedValue, theoreticalStdDev / Math.sqrt(n))
        const pValue = calculatePValue(zScore)

        return {
            mean,
            variance,
            standardDeviation,
            min,
            max,
            expectedValue,
            pValue,
            zScore
        }
    }, [results, params.probabilityOfSuccess, params.trialsPerExperiment])

    // Calculate statistics for selected bar
    const selectedBarStats = useMemo((): SelectedBarStats | null => {
        if (selectedBar === null || results.length === 0) return null

        const frequency = results.filter(r => r.successes === selectedBar).length
        const expectedValue = params.probabilityOfSuccess * params.trialsPerExperiment
        
        // For binomial distribution: theoretical standard deviation
        const theoreticalStdDev = Math.sqrt(params.trialsPerExperiment * params.probabilityOfSuccess * (1 - params.probabilityOfSuccess))
        
        // Calculate Z-score for this specific value
        const zScore = calculateZScore(selectedBar, expectedValue, theoreticalStdDev)
        
        // Calculate P-value for observing this specific value or more extreme
        const pValue = calculatePValue(zScore)

        return {
            successes: selectedBar,
            frequency,
            pValue,
            zScore
        }
    }, [selectedBar, results, params.probabilityOfSuccess, params.trialsPerExperiment])

    // Handle bar selection
    const selectBar = useCallback((barIndex: number) => {
        if (histogramData.labels.length > 0) {
            const successCount = parseInt(histogramData.labels[barIndex])
            setSelectedBar(successCount)
        }
    }, [histogramData.labels])

    // Clear bar selection
    const clearSelection = useCallback(() => {
        setSelectedBar(null)
    }, [])

    // Reset simulation
    const reset = useCallback(() => {
        setResults([])
        setCurrentExperiment(0)
        setIsRunning(false)
        setSelectedBar(null)
    }, [])

    // Run the complete simulation with animation
    const runSimulation = useCallback(async (): Promise<void> => {
        if (isRunning) return

        // Reset and start simulation
        setResults([])
        setCurrentExperiment(0)
        setIsRunning(true)
        setSelectedBar(null)

        let shouldContinue = true
        
        try {
            for (let i = 0; i < params.numberOfExperiments && shouldContinue; i++) {
                const result = runExperiment(i + 1, params.trialsPerExperiment, params.probabilityOfSuccess)
                setResults((prev: ExperimentResult[]) => [...prev, result])
                setCurrentExperiment(i + 1)

                // Animate the simulation
                if (i < params.numberOfExperiments - 1) {
                    await new Promise(resolve => setTimeout(resolve, animationSpeed))
                }
                
                // Check if we should continue (allow for stopping)
                setIsRunning(current => {
                    shouldContinue = current
                    return current
                })
            }
        } catch (error) {
            console.error('Simulation error:', error)
        } finally {
            setIsRunning(false)
        }
    }, [isRunning, params.numberOfExperiments, params.trialsPerExperiment, params.probabilityOfSuccess, animationSpeed])

    // Stop the simulation
    const stopSimulation = useCallback(() => {
        setIsRunning(false)
    }, [])

    // Update simulation parameters
    const updateParams = useCallback((newParams: Partial<SimulationParams>) => {
        setParams((prev: SimulationParams) => ({ ...prev, ...newParams }))
        // Reset results when parameters change to avoid confusion
        setResults([])
        setCurrentExperiment(0)
        setSelectedBar(null)
    }, [])

    return {
        // State
        isRunning,
        results,
        currentExperiment,
        params,
        selectedBar,

        // Computed
        histogramData,
        statistics,
        selectedBarStats,

        // Methods
        runSimulation,
        stopSimulation,
        reset,
        updateParams,
        selectBar,
        clearSelection
    }
} 