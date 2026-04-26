import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:8080/api/notes';

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then(setNotes)
      .catch(console.error);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const note = { title, content };
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    });
    const saved = await response.json();
    setNotes((previous) => [...previous, saved]);
    setTitle('');
    setContent('');
  };

  return (
    <div className="app-container">
      <header>
        <h1>Fullstack Experiment 9</h1>
        <p>React frontend + Spring Boot backend + PostgreSQL</p>
      </header>

      <section className="form-panel">
        <h2>Add a note</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label>
            Content
            <textarea value={content} onChange={(e) => setContent(e.target.value)} required />
          </label>
          <button type="submit">Save Note</button>
        </form>
      </section>

      <section className="notes-panel">
        <h2>Saved Notes</h2>
        {notes.length === 0 ? (
          <p>No notes yet.</p>
        ) : (
          <ul>
            {notes.map((note) => (
              <li key={note.id}>
                <strong>{note.title}</strong>
                <p>{note.content}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default App;
