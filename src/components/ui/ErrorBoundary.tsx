"use client";

import { Component, type ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="m-4 text-center">
          <p className="text-phantom-danger">Something went wrong.</p>
          <Button
            variant="secondary"
            className="mt-3"
            onClick={() => this.setState({ hasError: false })}
          >
            Try Again
          </Button>
        </Card>
      );
    }
    return this.props.children;
  }
}
