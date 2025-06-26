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
  selectedBar?: number | null
  onBarClick?: (barIndex: number) => void
}

const HistogramChart: React.FC<HistogramChartProps> = ({ 
  histogramData, 
  title = "Simulation Results Distribution",
  isAnimating = false,
  selectedBar = null,
  onBarClick
}) => {
  const chartRef = useRef<ChartJS<'bar'>>(null)

  const hasData = histogramData && histogramData.labels.length > 0 && histogramData.data.length > 0

  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => {
    // Create background colors array with highlighting for selected bar
    const backgroundColors = histogramData.data.map((_, index) => {
      if (selectedBar !== null) {
        const successCount = parseInt(histogramData.labels[index])
        return successCount === selectedBar 
          ? 'rgba(255, 99, 132, 0.8)' // Highlighted color for selected bar
          : 'rgba(102, 126, 234, 0.4)' // Dimmed color for non-selected bars
      }
      return 'rgba(102, 126, 234, 0.8)' // Default color
    })

    const borderColors = histogramData.data.map((_, index) => {
      if (selectedBar !== null) {
        const successCount = parseInt(histogramData.labels[index])
        return successCount === selectedBar 
          ? 'rgba(255, 99, 132, 1)' // Highlighted border for selected bar
          : 'rgba(102, 126, 234, 0.6)' // Dimmed border for non-selected bars
      }
      return 'rgba(102, 126, 234, 1)' // Default border
    })

    return {
      labels: histogramData.labels,
      datasets: [
        {
          label: 'Frequency',
          data: histogramData.data,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 2,
          borderRadius: 2,
        },
      ],
    }
  }, [histogramData.labels, histogramData.data, selectedBar])

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
          afterLabel: (_context: any) => {
            return 'Click to view statistics for this bar'
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
        borderWidth: 2,
      },
    },
    onClick: (_event: any, elements: any[]) => {
      if (elements.length > 0 && onBarClick) {
        const barIndex = elements[0].index
        onBarClick(barIndex)
      }
    },
    onHover: (_event: any, elements: any[]) => {
      const canvas = _event?.native?.target
      if (canvas) {
        canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default'
      }
    },
  }), [title, histogramData.labels.length, isAnimating, onBarClick])

  // Force chart update when data changes during animation
  useEffect(() => {
    if (chartRef.current && isAnimating) {
      chartRef.current.update('none') // Update without animation
    }
  }, [histogramData, isAnimating])

  // Update chart when selected bar changes
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update('none')
    }
  }, [selectedBar])

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
        {selectedBar !== null && (
          <div className="selection-info" style={{ 
            textAlign: 'center', 
            marginTop: '10px', 
            padding: '8px', 
            backgroundColor: 'rgba(255, 99, 132, 0.1)', 
            borderRadius: '4px',
            fontSize: '14px',
            color: '#666'
          }}>
            Selected: {selectedBar} successes (click elsewhere to deselect)
          </div>
        )}
      </div>
    </div>
  )
}

export default HistogramChart 