import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './i18n';
import '@fontsource/noto-sans-arabic/400.css';
import '@fontsource/noto-sans-arabic/700.css';
import DirectionProvider from './components/DirectionProvider';
import LoadingFallback from './components/LoadingFallback';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Suspense fallback={<LoadingFallback />}>
      <DirectionProvider>
        <App />
      </DirectionProvider>
    </Suspense>
  </React.StrictMode>
);

reportWebVitals();
