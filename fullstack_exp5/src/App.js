import React from 'react';
import Button from './Button';
import LoginForm from './LoginForm';
import CardList from './CardList';
import './index.css';

function App() {
  const sampleCards = [
    { title: 'React Testing', description: 'Jest and React Testing Library', status: 'active' },
    { title: 'Unit Tests', description: 'Button component testing', status: 'active' },
    { title: 'Integration Tests', description: 'Form submission testing', status: 'completed' }
  ];

  return (
    <div className="container">
      <h1>Frontend Testing Examples - exp5</h1>

      <section>
        <h2>a) Unit Tests - Button Component</h2>
        <p>Simple test: render text + click event handling</p>
        <Button label="Click me for test!" onClick={() => alert('Button clicked!')} />
      </section>

      <section>
        <h2>b) Integration Tests - Login Form</h2>
        <p>Fill fields → validate → show messages</p>
        <LoginForm />
      </section>

      <section>
        <h2>c) Snapshot Tests - Card List</h2>
        <p>Different states: loading, error, empty, data</p>
        <CardList cards={sampleCards} />
      </section>
    </div>
  );
}

export default App;
