import React from 'react';
import renderer, { act } from 'react-test-renderer';
import HarvestSwipeCard from '../HarvestSwipeCard';
import { saveSwipe } from '../../lib/swipes';

const profile = {
  id: '1',
  name: 'Test',
  age: 30,
  bio: '',
  photos: ['photo'],
  hobbies: [],
  location: '',
  gender: '',
  sexualIdentity: '',
  relationshipGoals: [],
};

jest.mock('../../lib/swipes', () => ({
  saveSwipe: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

describe('HarvestSwipeCard persistence callbacks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls saveSwipe once on like', async () => {
    const onLike = () => saveSwipe('user', profile.id, 'like');
    let card: renderer.ReactTestRenderer;
    await act(async () => {
      card = renderer.create(
        <HarvestSwipeCard profile={profile} onLike={onLike} onDislike={() => {}} />
      );
    });

    expect(saveSwipe).not.toHaveBeenCalled();

    await act(async () => {
      await (card!.root.props as any).onLike();
    });

    expect(saveSwipe).toHaveBeenCalledTimes(1);
  });

  it('calls saveSwipe once on dislike', async () => {
    const onDislike = () => saveSwipe('user', profile.id, 'nope');
    let card: renderer.ReactTestRenderer;
    await act(async () => {
      card = renderer.create(
        <HarvestSwipeCard profile={profile} onLike={() => {}} onDislike={onDislike} />
      );
    });

    expect(saveSwipe).not.toHaveBeenCalled();

    await act(async () => {
      await (card!.root.props as any).onDislike();
    });

    expect(saveSwipe).toHaveBeenCalledTimes(1);
  });

  it('calls saveSwipe once on super like', async () => {
    const onSuperLike = () => saveSwipe('user', profile.id, 'super_like');
    let card: renderer.ReactTestRenderer;
    await act(async () => {
      card = renderer.create(
        <HarvestSwipeCard
          profile={profile}
          onLike={() => {}}
          onDislike={() => {}}
          onSuperLike={onSuperLike}
        />
      );
    });

    expect(saveSwipe).not.toHaveBeenCalled();

    await act(async () => {
      await (card!.root.props as any).onSuperLike();
    });

    expect(saveSwipe).toHaveBeenCalledTimes(1);
  });
});
