"use client";

import { Component, type ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { reportClientError } from "@/lib/monitoring/client-report";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    reportClientError({
      area: "client",
      message: error.message,
      stack: error.stack,
      cause: info.componentStack,
      context: { boundary: "ErrorBoundary" },
      severity: "critical",
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="m-4 space-y-3 text-center">
          <p className="text-phantom-danger">Something went wrong.</p>
          <p className="text-xs text-phantom-muted">{this.state.errorMessage}</p>
          <Button
            variant="secondary"
            onClick={() => this.setState({ hasError: false, errorMessage: "" })}
          >
            Try Again
          </Button>
        </Card>
      );
    }
    return this.props.children;
  }
}
