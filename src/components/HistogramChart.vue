<template>
  <div class="chart-container">
    <div v-if="!hasData" class="no-data-overlay">
      <h3>No Data Available</h3>
      <p>Click "Start Simulation" to generate data.</p>
    </div>
    <div v-else class="chart-content">
      <h3 class="chart-title">{{ title }}</h3>
      <div class="chart-wrapper">
        <svg :width="chartWidth" :height="chartHeight" class="histogram-svg">
          <!-- Y-axis -->
          <line
            :x1="margin.left"
            :y1="margin.top"
            :x2="margin.left"
            :y2="chartHeight - margin.bottom"
            stroke="#666"
            stroke-width="2"
          />

          <!-- X-axis -->
          <line
            :x1="margin.left"
            :y1="chartHeight - margin.bottom"
            :x2="chartWidth - margin.right"
            :y2="chartHeight - margin.bottom"
            stroke="#666"
            stroke-width="2"
          />

          <!-- Bars -->
          <rect
            v-for="(bar, index) in bars"
            :key="index"
            :x="bar.x"
            :y="bar.y"
            :width="bar.width"
            :height="bar.height"
            fill="rgba(102, 126, 234, 0.8)"
            stroke="rgba(102, 126, 234, 1)"
            stroke-width="1"
            rx="2"
          />

          <!-- X-axis labels -->
          <text
            v-for="(label, index) in xLabels"
            :key="index"
            :x="label.x"
            :y="label.y"
            text-anchor="middle"
            :font-size="xLabels.length > 15 ? '10' : '12'"
            fill="#666"
            :transform="
              xLabels.length > 20 ? `rotate(-45, ${label.x}, ${label.y})` : ''
            "
          >
            {{ label.text }}
          </text>

          <!-- Y-axis labels -->
          <text
            v-for="(label, index) in yLabels"
            :key="index"
            :x="label.x"
            :y="label.y"
            text-anchor="end"
            font-size="12"
            fill="#666"
          >
            {{ label.text }}
          </text>

          <!-- Axis titles -->
          <text
            :x="chartWidth / 2"
            :y="chartHeight - 10"
            text-anchor="middle"
            font-size="14"
            font-weight="bold"
            fill="#333"
          >
            Number of Successes
          </text>

          <text
            :x="15"
            :y="chartHeight / 2"
            text-anchor="middle"
            font-size="14"
            font-weight="bold"
            fill="#333"
            transform="rotate(-90, 15, 200)"
          >
            Frequency
          </text>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from "vue";

interface HistogramData {
  labels: string[];
  data: number[];
}

const props = defineProps({
  histogramData: {
    type: Object as PropType<HistogramData>,
    required: true,
  },
  title: {
    type: String,
    default: "Simulation Results Distribution",
  },
});

const chartWidth = 600;
const chartHeight = 400;
const margin = { top: 20, right: 20, bottom: 60, left: 60 };

const hasData = computed(() => {
  return (
    props.histogramData &&
    props.histogramData.labels.length > 0 &&
    props.histogramData.data.length > 0
  );
});

const maxValue = computed(() => {
  return hasData.value ? Math.max(...props.histogramData.data) : 0;
});

const plotWidth = computed(() => chartWidth - margin.left - margin.right);
const plotHeight = computed(() => chartHeight - margin.top - margin.bottom);

const bars = computed(() => {
  if (!hasData.value) return [];

  const barWidth = plotWidth.value / props.histogramData.labels.length;
  const scale = plotHeight.value / maxValue.value;

  return props.histogramData.data.map((value, index) => {
    const height = value * scale;
    return {
      x: margin.left + index * barWidth + 2,
      y: chartHeight - margin.bottom - height,
      width: barWidth - 4,
      height: height,
    };
  });
});

const xLabels = computed(() => {
  if (!hasData.value) return [];

  const totalBars = props.histogramData.labels.length;
  const barWidth = plotWidth.value / totalBars;

  const labels = [];

  // Show label for EVERY bar to eliminate confusion
  for (let i = 0; i < totalBars; i++) {
    const label = props.histogramData.labels[i];
    // Extract center value from range labels like "45-47" -> "46"
    let displayText;
    if (label.includes("-")) {
      const parts = label.split("-");
      const start = parseInt(parts[0]);
      const end = parseInt(parts[1]);
      displayText = Math.round((start + end) / 2).toString();
    } else {
      displayText = label;
    }

    labels.push({
      x: margin.left + i * barWidth + barWidth / 2,
      y: chartHeight - margin.bottom + 20,
      text: displayText,
    });
  }

  return labels;
});

const yLabels = computed(() => {
  if (!hasData.value) return [];

  const maxFrequency = maxValue.value;
  const steps = 5;

  // Calculate step size, ensuring we get nice round numbers
  let stepValue = maxFrequency / steps;

  // Round step value to nice numbers (1, 2, 5, 10, 20, 50, etc.)
  if (stepValue > 0) {
    const magnitude = Math.pow(10, Math.floor(Math.log10(stepValue)));
    const normalized = stepValue / magnitude;

    if (normalized <= 1) stepValue = magnitude;
    else if (normalized <= 2) stepValue = 2 * magnitude;
    else if (normalized <= 5) stepValue = 5 * magnitude;
    else stepValue = 10 * magnitude;
  }

  // Generate labels from 0 to maxFrequency with the calculated step
  const labels = [];
  for (let value = 0; value <= maxFrequency; value += stepValue) {
    const normalizedValue = Math.round(value);
    const yPosition =
      chartHeight -
      margin.bottom -
      (normalizedValue / maxFrequency) * plotHeight.value +
      5;

    labels.push({
      x: margin.left - 10,
      y: yPosition,
      text: normalizedValue.toString(),
    });

    // Stop if we've reached or exceeded the max frequency
    if (normalizedValue >= maxFrequency) break;
  }

  return labels;
});
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.no-data-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
  color: #666;
  font-style: italic;
  text-align: center;
  border-radius: 8px;
}

.no-data-overlay h3 {
  margin-bottom: 10px;
}

.chart-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-title {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
  font-size: 16px;
  font-weight: bold;
}

.chart-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.histogram-svg {
  max-width: 100%;
  max-height: 100%;
}

rect {
  transition: opacity 0.2s ease;
}

rect:hover {
  opacity: 0.7;
}
</style>