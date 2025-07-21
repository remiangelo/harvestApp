import React, { useState, useEffect } from 'react';
import {
  Image,
  ImageStyle,
  ActivityIndicator,
  View,
  StyleSheet,
  ImageSourcePropType,
  ImageURISource,
  ViewStyle,
} from 'react-native';
import { theme } from '../constants/theme';

interface OptimizedImageProps {
  source: ImageSourcePropType;
  style?: ImageStyle | ImageStyle[];
  containerStyle?: ViewStyle | ViewStyle[];
  showLoadingIndicator?: boolean;
  fallbackSource?: ImageSourcePropType;
  onLoad?: () => void;
  onError?: () => void;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  loadingIndicatorColor?: string;
  loadingIndicatorSize?: number | 'small' | 'large';
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  containerStyle,
  showLoadingIndicator = true,
  fallbackSource,
  onLoad,
  onError,
  resizeMode = 'cover',
  loadingIndicatorColor = theme.colors.primary,
  loadingIndicatorSize = 'small',
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageSource, setImageSource] = useState<ImageSourcePropType>(source);

  useEffect(() => {
    setImageSource(source);
    setError(false);
    setLoading(true);
  }, [source]);

  const handleLoad = () => {
    setLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setLoading(false);
    setError(true);

    if (fallbackSource) {
      setImageSource(fallbackSource);
    }

    onError?.();
  };

  const getOptimizedSource = (): ImageSourcePropType => {
    if (typeof imageSource === 'object' && 'uri' in imageSource) {
      const uri = (imageSource as ImageURISource).uri;

      // Add cache control headers for better performance
      return {
        ...imageSource,
        uri,
        cache: 'force-cache',
      } as ImageURISource;
    }

    return imageSource;
  };

  const imageStyles = Array.isArray(style) ? style : [style];
  const containerStyles = Array.isArray(containerStyle) ? containerStyle : [containerStyle];

  return (
    <View style={[styles.container, ...containerStyles]}>
      <Image
        source={getOptimizedSource()}
        style={[styles.image, ...imageStyles]}
        onLoad={handleLoad}
        onError={handleError}
        resizeMode={resizeMode}
      />

      {loading && showLoadingIndicator && (
        <View style={[styles.loadingContainer, StyleSheet.absoluteFillObject]}>
          <ActivityIndicator size={loadingIndicatorSize} color={loadingIndicatorColor} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
  },
});
