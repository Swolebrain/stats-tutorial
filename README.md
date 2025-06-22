# Statistics Simulator

A Vue 3 + TypeScript frontend application that visualizes the results of repeating statistical random events across multiple experiments using interactive histograms.

## Features

- **Interactive Histogram Visualization**: Uses Chart.js to display the distribution of success counts across experiments
- **Real-time Animation**: Watch the histogram build gradually as experiments complete
- **Adjustable Parameters**: 
  - Probability of Success (0-100%)
  - Trials per Experiment (10-500)
  - Number of Experiments (100-5000)
  - Animation Speed (10-200ms between experiments)
- **Statistical Analysis**: Displays mean, standard deviation, expected value, and range
- **Responsive Design**: Works on desktop and mobile devices
- **TypeScript**: Fully typed for better development experience
- **Testable**: Comprehensive unit tests for simulation logic

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd statistics-simulator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

### Running Tests

```bash
npm test
```

## Usage

1. **Set Parameters**:
   - **Probability of Success**: Set the probability of a successful trial (e.g., 0.5 for a fair coin)
   - **Trials per Experiment**: Number of trials in each experiment (e.g., 100 coin flips)
   - **Number of Experiments**: Total number of experiments to run
   - **Animation Speed**: Control how fast the histogram builds

2. **Run Simulation**: Click "Start Simulation" to begin

3. **View Results**: 
   - Watch the histogram build in real-time
   - See statistical summary cards
   - Use Stop/Reset buttons to control the simulation

## Project Structure

```
src/
├── components/
│   └── HistogramChart.vue          # Chart.js histogram component
├── composables/
│   ├── useStatisticsSimulator.ts   # Core simulation logic
│   └── __tests__/                  # Unit tests
├── App.vue                         # Main application component
├── main.ts                         # Application entry point
└── style.css                       # Global styles
```

## Technical Details

### Simulation Algorithm

The simulator implements a binomial distribution simulation:

1. **Single Trial**: Generates a random number and compares it to the probability of success
2. **Experiment**: Runs multiple trials and counts successes
3. **Multiple Experiments**: Repeats experiments and records success counts
4. **Histogram**: Bins the success counts and displays frequency distribution

### Key Components

- **`useStatisticsSimulator`**: Vue 3 composable containing all simulation logic
- **`HistogramChart`**: Vue component using Chart.js for visualization
- **TypeScript Interfaces**: Strong typing for all data structures
- **Responsive CSS**: Modern, mobile-friendly design

### Testing

The application includes comprehensive unit tests for:
- Parameter validation and updates
- Simulation logic correctness
- Statistical calculations
- Edge cases and error handling

## Examples

### Coin Flip Simulation
- Probability: 0.5 (50%)
- Trials per Experiment: 100
- Number of Experiments: 1000
- Expected Result: Bell curve centered around 50 successes

### Biased Coin Simulation
- Probability: 0.7 (70%)
- Trials per Experiment: 100
- Number of Experiments: 1000
- Expected Result: Bell curve centered around 70 successes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License. 