<template>
  <div id="app">
    <div class="container">
      <header class="header">
        <h1>Statistics Simulator</h1>
        <p>
          Visualize the distribution of random events across multiple
          experiments
        </p>
      </header>

      <div class="content">
        <!-- Simulation Controls -->
        <div class="controls">
          <div class="control-group">
            <label for="probability">Probability of Success</label>
            <input
              id="probability"
              type="number"
              min="0"
              max="1"
              step="any"
              :value="params.probabilityOfSuccess"
              @input="updateProbability"
              @blur="validateProbability"
              placeholder="0.5"
              :class="{ 'invalid': !isProbabilityValid }"
            />
            <div class="value-display" :class="{ 'error': !isProbabilityValid }">
              <span v-if="isProbabilityValid">{{ (params.probabilityOfSuccess * 100).toFixed(params.probabilityOfSuccess < 0.01 ? 3 : 1) }}%</span>
              <span v-else class="error-text">Must be between 0.0 and 1.0</span>
            </div>
          </div>

          <div class="control-group">
            <label for="trials">Trials per Experiment</label>
            <input
              id="trials"
              type="number"
              step="1"
              :value="params.trialsPerExperiment"
              @input="updateTrials"
              placeholder="100"
            />
            <div class="value-display">
              {{ params.trialsPerExperiment }} trials
            </div>
          </div>

          <div class="control-group">
            <label for="experiments">Number of Experiments</label>
            <input
              id="experiments"
              type="number"
              step="1"
              :value="params.numberOfExperiments"
              @input="updateExperiments"
              placeholder="1000"
            />
            <div class="value-display">
              {{ params.numberOfExperiments }} experiments
            </div>
          </div>
        </div>

        <!-- Control Buttons -->
        <div class="button-container">
          <button 
            class="btn" 
            :disabled="isRunning || !isProbabilityValid" 
            @click="startSimulation"
            :title="!isProbabilityValid ? 'Please enter a valid probability (0.0 to 1.0)' : ''"
          >
            {{ isRunning ? "Running..." : "Start Simulation" }}
          </button>
          <button
            v-if="isRunning"
            class="btn"
            style="margin-left: 10px; background: #dc3545"
            @click="stopSimulation"
          >
            Stop
          </button>
          <button
            v-if="!isRunning && results.length > 0"
            class="btn"
            style="margin-left: 10px; background: #28a745"
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
              :style="{
                width: `${
                  (currentExperiment / params.numberOfExperiments) * 100
                }%`,
              }"
            ></div>
          </div>
          <div class="progress-text">
            Experiment {{ currentExperiment }} of
            {{ params.numberOfExperiments }}
          </div>
        </div>

        <!-- Histogram Chart -->
        <div class="chart-container">
          <HistogramChart
            :histogram-data="histogramData"
            :title="`Distribution of Successes (${params.numberOfExperiments} experiments, ${params.trialsPerExperiment} trials each)`"
          />
        </div>

        <!-- Instructions -->
        <div v-if="results.length === 0" class="instructions">
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
          </ol>
          <p>
            The histogram will show the distribution of success counts across
            all experiments.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import HistogramChart from "./components/HistogramChart.vue";
import { useStatisticsSimulator } from "./composables/useStatisticsSimulator";

const {
  isRunning,
  results,
  currentExperiment,
  params,
  histogramData,
  statistics,
  runSimulation,
  stopSimulation,
  reset,
  updateParams,
} = useStatisticsSimulator();

// Validation state
const isProbabilityValid = ref(true);

// Event handlers for controls
const updateProbability = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const inputValue = target.value;
  
  // Allow empty input (user is still typing)
  if (inputValue === '') {
    isProbabilityValid.value = false;
    return;
  }
  
  const value = parseFloat(inputValue);
  
  // Debug logging
  console.log('Input value:', inputValue, 'Parsed value:', value);
  
  // Validate the input - allow any number between 0 and 1 (inclusive)
  // Use small epsilon for floating point comparison
  const epsilon = 1e-10;
  if (isNaN(value) || value < -epsilon || value > 1 + epsilon) {
    isProbabilityValid.value = false;
    console.log('Validation failed:', { 
      isNaN: isNaN(value), 
      tooSmall: value < -epsilon, 
      tooLarge: value > 1 + epsilon,
      actualValue: value 
    });
    return; // Don't update if invalid
  }
  
  // Valid input - update the parameter
  isProbabilityValid.value = true;
  updateParams({ probabilityOfSuccess: value });
  
  // Reset results when parameters change to avoid mismatch
  if (results.value.length > 0) {
    reset();
  }
};

const validateProbability = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const inputValue = target.value;
  
  // Don't validate empty input
  if (inputValue === '') {
    isProbabilityValid.value = false;
    return;
  }
  
  const value = parseFloat(inputValue);
  
  console.log('Blur validation - Input:', inputValue, 'Parsed:', value);
  
  // Use same epsilon for consistency
  const epsilon = 1e-10;
  if (isNaN(value) || value < -epsilon || value > 1 + epsilon) {
    isProbabilityValid.value = false;
    console.log('Blur validation failed, resetting to:', params.value.probabilityOfSuccess);
    // Reset to last valid value
    target.value = params.value.probabilityOfSuccess.toString();
  } else {
    isProbabilityValid.value = true;
    // Ensure the parameter is updated even on blur
    updateParams({ probabilityOfSuccess: value });
  }
};

const updateTrials = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = parseInt(target.value);
  if (!isNaN(value) && value > 0) {
    updateParams({ trialsPerExperiment: value });
    // Reset results when parameters change to avoid mismatch
    if (results.value.length > 0) {
      reset();
    }
  }
};

const updateExperiments = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = parseInt(target.value);
  if (!isNaN(value) && value > 0) {
    updateParams({ numberOfExperiments: value });
    // Reset results when parameters change to avoid mismatch
    if (results.value.length > 0) {
      reset();
    }
  }
};

const startSimulation = async () => {
  // Double-check validation before starting
  if (!isProbabilityValid.value) {
    console.warn("Cannot start simulation: Invalid probability value");
    return;
  }
  
  try {
    await runSimulation();
  } catch (error) {
    console.error("Simulation error:", error);
  }
};
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

/* Validation styles */
.invalid {
  border-color: #dc3545 !important;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
}

.value-display.error {
  color: #dc3545;
}

.error-text {
  font-weight: 500;
  font-size: 12px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn:disabled:hover {
  background-color: inherit;
  transform: none;
}
</style>
