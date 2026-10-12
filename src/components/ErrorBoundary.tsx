import { Component, type ReactNode } from 'react';

type State = { error: Error | null };

/** If a section crashes, show a way back instead of a blank page. */
export class ErrorBoundary extends Component<{ children: ReactNode; resetKey: string }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('Page failed to render:', error);
  }

  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }

  render() {
    if (this.state.error) {
      return (
        <section className="detail-missing wrap">
          <h1 className="tag">Something broke</h1>
          <p>This page hit an error while loading. Reloading usually fixes it.</p>
          <a href="#top">Back to the home page</a>
        </section>
      );
    }
    return this.props.children;
  }
}
