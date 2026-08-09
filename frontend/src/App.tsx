import { Header } from './components/layout/Header';
import { ChatInterface } from './components/chat/ChatInterface';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="min-h-screen bg-background text-text font-sans selection:bg-primary/30">
      <Header />
      <main className="h-screen">
        <ChatInterface />
      </main>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1a1d20',
            color: '#fff',
            border: '1px solid #374151',
          },
        }}
      />
    </div>
  );
}

export default App;
