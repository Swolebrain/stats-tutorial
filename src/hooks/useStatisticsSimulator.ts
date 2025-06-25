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
}

export function useStatisticsSimulator() {
    const [isRunning, setIsRunning] = useState(false)
    const [results, setResults] = useState<ExperimentResult[]>([])
    const [currentExperiment, setCurrentExperiment] = useState(0)
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
                expectedValue: 0
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

        return {
            mean,
            variance,
            standardDeviation,
            min,
            max,
            expectedValue
        }
    }, [results, params.probabilityOfSuccess, params.trialsPerExperiment])

    // Reset simulation
    const reset = useCallback(() => {
        setResults([])
        setCurrentExperiment(0)
        setIsRunning(false)
    }, [])

    // Run the complete simulation with animation
    const runSimulation = useCallback(async (): Promise<void> => {
        if (isRunning) return

        // Reset and start simulation
        setResults([])
        setCurrentExperiment(0)
        setIsRunning(true)

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
    }, [])

    return {
        // State
        isRunning,
        results,
        currentExperiment,
        params,

        // Computed
        histogramData,
        statistics,

        // Methods
        runSimulation,
        stopSimulation,
        reset,
        updateParams
    }
} 