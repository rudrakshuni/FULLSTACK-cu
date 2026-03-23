import React from 'react';
import Button from './Button';
import Form from './Form';
import Dashboard from './Dashboard';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>React Testing Examples</h1>
      </header>
      <main>
        <section>
          <h2>Button Component</h2>
          <Button label="Click Me" onClick={() => alert('Button clicked!')} />
        </section>
        <section>
          <h2>Form Component</h2>
          <Form />
        </section>
        <section>
          <h2>Dashboard Component</h2>
          <Dashboard
            data={[
              { id: '1', title: 'Item 1', description: 'Description 1', status: 'active' },
              { id: '2', title: 'Item 2', description: 'Description 2', status: 'inactive' },
            ]}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
