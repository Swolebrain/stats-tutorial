import { ref, computed, readonly } from 'vue'

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
    const isRunning = ref(false)
    const results = ref<ExperimentResult[]>([])
    const currentExperiment = ref(0)
    const animationSpeed = ref(50) // milliseconds between experiments

    const params = ref<SimulationParams>({
        probabilityOfSuccess: 0.5,
        trialsPerExperiment: 100,
        numberOfExperiments: 1000
    })

    // Generate a single trial result
    const generateTrial = (probability: number): boolean => {
        return Math.random() < probability
    }

    // Run a single experiment
    const runExperiment = (experimentNumber: number): ExperimentResult => {
        let successes = 0

        for (let i = 0; i < params.value.trialsPerExperiment; i++) {
            if (generateTrial(params.value.probabilityOfSuccess)) {
                successes++
            }
        }

        return {
            experimentNumber,
            successes,
            timestamp: Date.now()
        }
    }

    const histogramData = computed(() => {
        if (results.value.length === 0) return { labels: [], data: [] }

        const successCounts = results.value.map(r => r.successes)
        const min = Math.min(...successCounts)
        const max = Math.max(...successCounts)

        // Create bins for histogram
        const binCount = Math.min(20, max - min + 1) // Max 20 bins
        const binSize = Math.ceil((max - min + 1) / binCount)

        const bins: { [key: number]: number } = {}

        // Initialize bins
        for (let i = 0; i < binCount; i++) {
            const binStart = min + (i * binSize)
            bins[binStart] = 0
        }

        // Count results in each bin
        successCounts.forEach(count => {
            const binIndex = Math.floor((count - min) / binSize)
            const binStart = min + (binIndex * binSize)
            bins[binStart] = (bins[binStart] || 0) + 1
        })

        const labels = Object.keys(bins).map(key => {
            const start = parseInt(key)
            const end = start + binSize - 1
            return `${start}-${end}`
        })

        const data = Object.keys(bins).map(key => bins[parseInt(key)])

        return { labels, data }
    })

    // Calculate statistics from results
    const statistics = computed((): SimulationStats => {
        if (results.value.length === 0) {
            return {
                mean: 0,
                variance: 0,
                standardDeviation: 0,
                min: 0,
                max: 0,
                expectedValue: 0
            }
        }

        const successCounts = results.value.map(r => r.successes)
        const n = successCounts.length

        const mean = successCounts.reduce((sum, count) => sum + count, 0) / n
        const variance = successCounts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / n
        const standardDeviation = Math.sqrt(variance)
        const min = Math.min(...successCounts)
        const max = Math.max(...successCounts)
        const expectedValue = params.value.probabilityOfSuccess * params.value.trialsPerExperiment

        return {
            mean,
            variance,
            standardDeviation,
            min,
            max,
            expectedValue
        }
    })

    // Reset simulation
    const reset = () => {
        results.value = []
        currentExperiment.value = 0
        isRunning.value = false
    }

    // Run the complete simulation with animation
    const runSimulation = async (): Promise<void> => {
        if (isRunning.value) return

        reset()
        isRunning.value = true

        try {
            for (let i = 0; i < params.value.numberOfExperiments; i++) {
                if (!isRunning.value) break // Allow cancellation

                const result = runExperiment(i + 1)
                results.value.push(result)
                currentExperiment.value = i + 1

                // Animate the simulation
                if (i < params.value.numberOfExperiments - 1) {
                    await new Promise(resolve => setTimeout(resolve, animationSpeed.value))
                }
            }
        } finally {
            isRunning.value = false
        }
    }

    // Stop the simulation
    const stopSimulation = () => {
        isRunning.value = false
    }

    // Update simulation parameters
    const updateParams = (newParams: Partial<SimulationParams>) => {
        params.value = { ...params.value, ...newParams }
    }

    // Update animation speed
    const updateAnimationSpeed = (speed: number) => {
        animationSpeed.value = Math.max(10, Math.min(200, speed))
    }

    return {
        // State
        isRunning: readonly(isRunning),
        results: readonly(results),
        currentExperiment: readonly(currentExperiment),
        params: readonly(params),
        animationSpeed: readonly(animationSpeed),

        // Computed
        histogramData,
        statistics,

        // Methods
        runSimulation,
        stopSimulation,
        reset,
        updateParams,
        updateAnimationSpeed
    }
} 