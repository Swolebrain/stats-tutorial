<template>
  <div id="app">
    <div class="container">
      <header class="header">
        <h1>Statistics Simulator</h1>
        <p>Visualize the distribution of random events across multiple experiments</p>
      </header>

      <div class="content">
        <!-- Simulation Controls -->
        <div class="controls">
          <div class="control-group">
            <label for="probability">Probability of Success</label>
            <input
              id="probability"
              type="range"
              min="0"
              max="1"
              step="0.01"
              :value="params.probabilityOfSuccess"
              @input="updateProbability"
            />
            <div class="value-display">{{ (params.probabilityOfSuccess * 100).toFixed(1) }}%</div>
          </div>

          <div class="control-group">
            <label for="trials">Trials per Experiment</label>
            <input
              id="trials"
              type="range"
              min="10"
              max="500"
              step="10"
              :value="params.trialsPerExperiment"
              @input="updateTrials"
            />
            <div class="value-display">{{ params.trialsPerExperiment }} trials</div>
          </div>

          <div class="control-group">
            <label for="experiments">Number of Experiments</label>
            <input
              id="experiments"
              type="range"
              min="100"
              max="5000"
              step="100"
              :value="params.numberOfExperiments"
              @input="updateExperiments"
            />
            <div class="value-display">{{ params.numberOfExperiments }} experiments</div>
          </div>

          <div class="control-group">
            <label for="speed">Animation Speed</label>
            <input
              id="speed"
              type="range"
              min="10"
              max="200"
              step="10"
              :value="200 - animationSpeed"
              @input="updateSpeed"
            />
            <div class="value-display">{{ Math.round((200 - animationSpeed) / 2) }}% speed</div>
          </div>
        </div>

        <!-- Control Buttons -->
        <div class="button-container">
          <button
            class="btn"
            :disabled="isRunning"
            @click="startSimulation"
          >
            {{ isRunning ? 'Running...' : 'Start Simulation' }}
          </button>
          <button
            v-if="isRunning"
            class="btn"
            style="margin-left: 10px; background: #dc3545;"
            @click="stopSimulation"
          >
            Stop
          </button>
          <button
            v-if="!isRunning && results.length > 0"
            class="btn"
            style="margin-left: 10px; background: #28a745;"
            @click="reset"
          >
            Reset
          </button>
        </div>

        <!-- Progress Indicator -->
        <div v-if="isRunning" class="progress">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: `${(currentExperiment / params.numberOfExperiments) * 100}%` }"
            ></div>
          </div>
          <div class="progress-text">
            Experiment {{ currentExperiment }} of {{ params.numberOfExperiments }}
          </div>
        </div>

        <!-- Histogram Chart -->
        <div class="chart-container">
          <HistogramChart
            :histogram-data="histogramData"
            :title="`Distribution of Successes (${params.numberOfExperiments} experiments, ${params.trialsPerExperiment} trials each)`"
          />
        </div>

        <!-- Statistics -->
        <div v-if="results.length > 0" class="stats">
          <div class="stat-card">
            <div class="stat-value">{{ statistics.mean.toFixed(2) }}</div>
            <div class="stat-label">Mean</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ statistics.standardDeviation.toFixed(2) }}</div>
            <div class="stat-label">Standard Deviation</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ statistics.expectedValue.toFixed(2) }}</div>
            <div class="stat-label">Expected Value</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ statistics.min }} - {{ statistics.max }}</div>
            <div class="stat-label">Range</div>
          </div>
        </div>

        <!-- Instructions -->
        <div v-if="results.length === 0" class="instructions">
          <h3>How to use the simulator:</h3>
          <ol>
            <li>Adjust the <strong>Probability of Success</strong> (e.g., 0.5 for a fair coin)</li>
            <li>Set the <strong>Trials per Experiment</strong> (e.g., 100 coin flips)</li>
            <li>Choose the <strong>Number of Experiments</strong> to run</li>
            <li>Click <strong>Start Simulation</strong> to see the results</li>
          </ol>
          <p>The histogram will show the distribution of success counts across all experiments.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import HistogramChart from './components/HistogramChart.vue'
import { useStatisticsSimulator } from './composables/useStatisticsSimulator'

const {
  isRunning,
  results,
  currentExperiment,
  params,
  animationSpeed,
  histogramData,
  statistics,
  runSimulation,
  stopSimulation,
  reset,
  updateParams,
  updateAnimationSpeed
} = useStatisticsSimulator()

// Event handlers for controls
const updateProbability = (event: Event) => {
  const target = event.target as HTMLInputElement
  updateParams({ probabilityOfSuccess: parseFloat(target.value) })
}

const updateTrials = (event: Event) => {
  const target = event.target as HTMLInputElement
  updateParams({ trialsPerExperiment: parseInt(target.value) })
}

const updateExperiments = (event: Event) => {
  const target = event.target as HTMLInputElement
  updateParams({ numberOfExperiments: parseInt(target.value) })
}

const updateSpeed = (event: Event) => {
  const target = event.target as HTMLInputElement
  const speed = 200 - parseInt(target.value)
  updateAnimationSpeed(speed)
}

const startSimulation = async () => {
  try {
    await runSimulation()
  } catch (error) {
    console.error('Simulation error:', error)
  }
}
</script>

<style scoped>
.progress {
  margin: 20px 0;
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e1e5e9;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.instructions {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
  border-left: 4px solid #667eea;
}

.instructions h3 {
  margin-bottom: 15px;
  color: #333;
}

.instructions ol {
  margin-left: 20px;
  margin-bottom: 15px;
}

.instructions li {
  margin-bottom: 8px;
  color: #555;
}

.instructions p {
  color: #666;
  font-style: italic;
}
</style> 