import React from 'react';
import renderer, { act } from 'react-test-renderer';
import AuthScreen from '../auth';

const mockLoginWithOAuth = jest.fn();

jest.mock('../../stores/useAuthStore', () => ({
  useAuthStore: () => ({ loginWithOAuth: mockLoginWithOAuth }),
}));

describe('AuthScreen social logins', () => {
  beforeEach(() => {
    mockLoginWithOAuth.mockClear();
  });

  it('renders social login text', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<AuthScreen />);
    });
    expect(tree.root.findByProps({ children: 'Continue with Google' })).toBeTruthy();
    expect(tree.root.findByProps({ children: 'Continue with Facebook' })).toBeTruthy();
  });

  it('calls loginWithOAuth with correct provider', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<AuthScreen />);
    });
    act(() => {
      tree.root.findByProps({ testID: 'google-login' }).props.onPress();
    });
    expect(mockLoginWithOAuth).toHaveBeenCalledWith('google');
    act(() => {
      tree.root.findByProps({ testID: 'facebook-login' }).props.onPress();
    });
    expect(mockLoginWithOAuth).toHaveBeenCalledWith('facebook');
  });
});
