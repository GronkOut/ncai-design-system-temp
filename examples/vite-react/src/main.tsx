import '@ncai/design-system-temp/styles.css';
import { Checkbox } from '@ncai/design-system-temp';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function App() {
  return (
    <main className="example-page">
      <section className="example-card" aria-labelledby="example-title">
        <p className="example-eyebrow">NC AI Design System Temp</p>
        <h1 id="example-title">Vite React 설치 검증</h1>
        <p className="example-description">
          npm tarball로 설치한 `@ncai/design-system-temp`와 `@ncai/design-tokens-temp`가 실제 Vite 앱에서 빌드되는지
          확인하는 예제입니다.
        </p>

        <label className="example-checkbox-row">
          <Checkbox aria-label="약관 동의" defaultChecked />
          <span>NC AI 디자인 시스템 Checkbox 사용</span>
        </label>
      </section>
    </main>
  );
}

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element was not found.');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
