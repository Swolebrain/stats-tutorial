# Statistics Simulator - React + TypeScript + Chart.js

A powerful React-based statistics simulator with unlimited histogram bins using Chart.js for visualization.

## 🚀 Features

- **React 18** with TypeScript for modern development
- **Chart.js** integration for professional histogram visualization
- **Unlimited Bins** - No artificial 20-bin limitation
- **Real-time Animation** - Watch experiments build up gradually
- **Responsive Design** - Works on desktop and mobile
- **Input Validation** - Proper form validation with error handling
- **Clean Architecture** - Modular components and custom hooks

## 📦 Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Build for production:**
```bash
npm run build
```

## 🔄 Migration from Vue 3

This project was successfully migrated from Vue 3 to React. Here are the key changes made:

### Dependencies Changed
- **Removed:** `vue`, `vue-chartjs`, `@vitejs/plugin-vue`, `vue-tsc`, `@vue/tsconfig`
- **Added:** `react`, `react-dom`, `react-chartjs-2`, `@vitejs/plugin-react`, `@types/react`, `@types/react-dom`

### Architecture Changes

#### 1. **Vue Composables → React Hooks**
- `src/composables/useStatisticsSimulator.ts` → `src/hooks/useStatisticsSimulator.ts`
- `ref()` → `useState()`
- `computed()` → `useMemo()`
- `readonly()` → Removed (not needed in React)

#### 2. **Vue Components → React Components**
- `src/App.vue` → `src/App.tsx`
- `src/components/HistogramChart.vue` → `src/components/HistogramChart.tsx`
- Template syntax → JSX
- Vue event handlers → React event handlers

#### 3. **Chart Implementation**
- **Old:** Custom SVG implementation with 20-bin limitation
- **New:** Chart.js with react-chartjs-2 wrapper
- **Benefit:** Professional charts with unlimited bins and better performance

#### 4. **Configuration Updates**
- `vite.config.ts`: Vue plugin → React plugin
- `tsconfig.json`: Vue-specific config → React-specific config
- `index.html`: Updated script reference and root element
- `env.d.ts`: Removed Vue module declarations

### Key Improvements

#### Unlimited Bins
```typescript
// OLD (Vue): Limited to 20 bins
const binCount = Math.min(20, max - min + 1) // Max 20 bins

// NEW (React): Unlimited bins
const binCount = max - min + 1 // One bin per possible value
```

#### Chart.js Integration
```tsx
// Professional Chart.js histogram with full customization
<Bar 
  ref={chartRef} 
  data={chartData} 
  options={options} 
/>
```

#### Better State Management
```typescript
// React hooks with proper dependency management
const histogramData = useMemo(() => {
  // Computation logic
}, [results]) // Proper dependencies
```

## 🎯 Usage

1. **Set Parameters:**
   - **Probability of Success:** 0.0 to 1.0 (e.g., 0.5 for fair coin)
   - **Trials per Experiment:** Any positive integer (e.g., 100)
   - **Number of Experiments:** Any positive integer (e.g., 1000)

2. **Run Simulation:**
   - Click "Start Simulation" to begin
   - Watch the histogram build up in real-time
   - Use "Stop" to interrupt or "Reset" to clear results

3. **Analyze Results:**
   - Histogram shows distribution of success counts
   - Each bar represents a specific number of successes
   - Unlimited bins provide precise visualization

## 🏗️ Project Structure

```
src/
├── hooks/
│   └── useStatisticsSimulator.ts    # React hook for simulation logic
├── components/
│   └── HistogramChart.tsx           # Chart.js histogram component
├── App.tsx                          # Main React component
├── main.tsx                         # React entry point
└── style.css                       # Global styles
```

## 🔧 Technical Details

### React Hook Features
- `useState` for state management
- `useMemo` for computed values
- `useCallback` for optimized event handlers
- Proper TypeScript typing throughout

### Chart.js Configuration
- Responsive design with maintainAspectRatio: false
- Custom tooltips and axis labels
- Smooth animations with easing
- Automatic cleanup on unmount

### Performance Optimizations
- Memoized calculations to prevent unnecessary re-renders
- Optimized Chart.js configuration
- Efficient state updates during animation

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with UI
npm run test:ui
```

## 🚀 Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📊 Example Use Cases

- **Coin Flipping:** Set probability to 0.5, trials to 100
- **Dice Rolling:** Set probability to 1/6 ≈ 0.167 for specific number
- **Quality Control:** Set probability to defect rate, trials to sample size
- **A/B Testing:** Set probability to conversion rate, trials to visitors

## 🎨 Customization

The Chart.js implementation allows easy customization:

```typescript
const options = {
  // Customize colors
  backgroundColor: 'rgba(102, 126, 234, 0.8)',
  borderColor: 'rgba(102, 126, 234, 1)',
  
  // Customize animations
  animation: {
    duration: 1000,
    easing: 'easeInOutQuart'
  },
  
  // Customize scales and labels
  scales: {
    x: { title: { text: 'Number of Successes' } },
    y: { title: { text: 'Frequency' } }
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for educational or commercial purposes. 