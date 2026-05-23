/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, useTheme } from './Theme.tsx';
import { BreakpointProvider } from './hooks/useBreakpoint.tsx';
import { Playground } from './components/App/Playground.tsx';
import './styles.css';

function App() {
  const { theme } = useTheme();

  React.useEffect(() => {
    document.body.style.backgroundColor = theme.Color.Base.Surface[1];
  }, [theme]);

  return (
      <Playground />
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BreakpointProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BreakpointProvider>
  </React.StrictMode>
);