import { SampleConcept } from '../types';

export const SAMPLE_CONCEPTS: SampleConcept[] = [
  {
    id: 'quantum-computing',
    title: 'Quantum Entanglement & Superposition',
    category: 'Physics & Computing',
    text: `Quantum computing leverages the principles of quantum mechanics to process information in fundamentally new ways. Unlike classical bits that store either a 0 or a 1, quantum bits (qubits) can exist in a superposition of both states simultaneously. 

When qubits become entangled, the state of one qubit instantaneously dictates the state of another, regardless of distance. This allows quantum algorithms, such as Shor's algorithm for prime factorization and Grover's search algorithm, to solve complex mathematical optimization, cryptography, and molecular simulation problems exponentially faster than classical supercomputers.

However, decoherence—caused by thermal fluctuations and electromagnetic interference—poses a significant challenge, requiring error mitigation and ultra-cold cryogenics to maintain quantum coherence.`,
    difficulty: 'Undergraduate',
    tone: 'Analogy-Heavy',
    iconName: 'Atom'
  },
  {
    id: 'neural-networks',
    title: 'Neural Networks & Backpropagation',
    category: 'Artificial Intelligence',
    text: `Artificial Neural Networks (ANNs) are computational models inspired by the human brain. An ANN consists of layers of nodes (neurons): an input layer, hidden layers, and an output layer. Each connection carries a weight, and each node applies a non-linear activation function (such as ReLU or Sigmoid) to the weighted sum of its inputs.

Training a neural network involves two main phases:
1. Forward Pass: Input data flows forward through the network to produce a prediction, which is evaluated against the target using a loss function (e.g., Mean Squared Error or Cross-Entropy).
2. Backpropagation: The gradient of the loss function with respect to each weight is computed using the calculus chain rule. Optimization algorithms like Adam or SGD adjust weights in the direction that minimizes loss.`,
    difficulty: 'High School',
    tone: 'Plain & Direct',
    iconName: 'Brain'
  },
  {
    id: 'inflation-central-banks',
    title: 'Inflation & Central Bank Interest Rates',
    category: 'Economics & Finance',
    text: `Inflation represents the sustained increase in the general price level of goods and services over time, eroding purchasing power. It is caused by demand-pull (consumer demand exceeding supply) or cost-push factors (increased production costs like raw materials).

Central Banks (such as the Federal Reserve or ECB) control monetary policy to maintain target inflation (typically ~2%). When inflation rises too quickly, central banks increase benchmark interest rates. Higher interest rates make borrowing money more expensive for consumers and businesses, curbing spending and cooling economic demand. Conversely, during economic downturns, central banks lower rates to stimulate borrowing and investment.`,
    difficulty: '5-Year-Old/ELI5',
    tone: 'Humorous & Casual',
    iconName: 'TrendingUp'
  },
  {
    id: 'photosynthesis',
    title: 'Photosynthesis & Light-Independent Reactions',
    category: 'Biology',
    text: `Photosynthesis is the biochemical process by which photoautotrophs (plants, algae, and cyanobacteria) convert light energy into chemical energy stored in glucose. 

Equation: 6CO₂ + 6H₂O + photons → C₆H₁₂O₆ + 6O₂

The process occurs in two stages inside chloroplasts:
1. Light-Dependent Reactions (in thylakoid membranes): Absorption of light by chlorophyll splits water molecules (photolysis), releasing O₂ gas and generating ATP and NADPH.
2. Light-Independent Reactions / Calvin Cycle (in the stroma): ATP and NADPH power the fixation of atmospheric carbon dioxide into 3-carbon sugars (G3P), which combine to form glucose and complex carbohydrates.`,
    difficulty: 'Domain Expert',
    tone: 'Plain & Direct',
    iconName: 'Leaf'
  }
];
