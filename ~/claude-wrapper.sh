#!/bin/bash

# Claude wrapper script for Kilocode integration
# This script handles the Claude CLI invocation with proper error handling

# Check if API key is set
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "Error: ANTHROPIC_API_KEY environment variable is not set" >&2
    echo "Please set your Anthropic API key:" >&2
    echo "export ANTHROPIC_API_KEY='your-api-key-here'" >&2
    exit 1
fi

# Forward all arguments to claude-code
exec /opt/homebrew/bin/claude-code "$@"