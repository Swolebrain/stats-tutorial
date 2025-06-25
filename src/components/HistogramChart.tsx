import React, { useEffect, useRef, useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface HistogramData {
  labels: string[]
  data: number[]
}

interface HistogramChartProps {
  histogramData: HistogramData
  title?: string
  isAnimating?: boolean
}

const HistogramChart: React.FC<HistogramChartProps> = ({ 
  histogramData, 
  title = "Simulation Results Distribution",
  isAnimating = false 
}) => {
  const chartRef = useRef<ChartJS<'bar'>>(null)

  const hasData = histogramData && histogramData.labels.length > 0 && histogramData.data.length > 0

  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => ({
    labels: histogramData.labels,
    datasets: [
      {
        label: 'Frequency',
        data: histogramData.data,
        backgroundColor: 'rgba(102, 126, 234, 0.8)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 1,
        borderRadius: 2,
      },
    ],
  }), [histogramData.labels, histogramData.data])

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    datasets: {
      bar: {
        barPercentage: 0.8,
        categoryPercentage: 0.9,
      },
    },
    plugins: {
      legend: {
        display: false, // Hide legend for cleaner look
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
        color: '#333',
        padding: 20,
      },
      tooltip: {
        callbacks: {
          title: (context: any) => {
            const label = context[0].label
            return `Successes: ${label}`
          },
          label: (context: any) => {
            return `Frequency: ${context.parsed.y}`
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Number of Successes',
          font: {
            size: 14,
            weight: 'bold' as const,
          },
          color: '#333',
        },
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: histogramData.labels.length > 20 ? 45 : 0,
          color: '#666',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Frequency',
          font: {
            size: 14,
            weight: 'bold' as const,
          },
          color: '#333',
        },
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#666',
          precision: 0, // Show only integer values
        },
      },
    },
    animation: {
      duration: isAnimating ? 0 : 300, // Disable animation during simulation
      easing: 'easeInOutQuart' as const,
    },
    interaction: {
      intersect: false,
    },
    elements: {
      bar: {
        borderWidth: 1,
      },
    },
  }), [title, histogramData.labels.length, isAnimating])

  // Force chart update when data changes during animation
  useEffect(() => {
    if (chartRef.current && isAnimating) {
      chartRef.current.update('none') // Update without animation
    }
  }, [histogramData, isAnimating])

  // Clean up chart on unmount
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [])

  if (!hasData) {
    return (
      <div className="chart-container">
        <div className="no-data-overlay">
          <h3>No Data Available</h3>
          <p>Click "Start Simulation" to generate data.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chart-container">
      <div className="chart-content">
        <div className="chart-wrapper" style={{ height: '400px' }}>
          <Bar 
            ref={chartRef} 
            data={chartData} 
            options={options}
            redraw={isAnimating}
          />
        </div>
      </div>
    </div>
  )
}

export default HistogramChart 