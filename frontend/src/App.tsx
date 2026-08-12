import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { ChatInterface } from './components/chat/ChatInterface';
import { SettingsModal } from './components/settings/SettingsModal';
import { useSettingsStore } from './store/settingsStore';
import { Toaster } from 'react-hot-toast';
import { I18nProvider } from './i18n';

function App() {
  const [forceSettings, setForceSettings] = useState(false);
  const hasApiKey = useSettingsStore((s) => s.hasApiKey());

  useEffect(() => {
    // 首启动检测：如果没有 API Key，强制弹出 Settings
    if (!hasApiKey) {
      setForceSettings(true);
    }
  }, []);

  return (
    <I18nProvider>
      <div className="min-h-screen bg-background text-text font-sans selection:bg-primary/30">
        <Header />
        <main className="min-h-[calc(100vh-4rem)] pt-16">
          <ChatInterface />
        </main>
        <SettingsModal forceOpen={forceSettings} onConfigured={() => setForceSettings(false)} />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1A1D24',
              color: '#F4F4F5',
              border: '1px solid #3F3F46',
            },
          }}
        />
      </div>
    </I18nProvider>
  );
}

export default App;
