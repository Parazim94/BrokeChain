import React from "react";
import { Image, ImageProps, Platform } from "react-native";

const LazyImage: React.FC<ImageProps> = (props) => {
  if (Platform.OS === "web") {
    return <Image {...(props as any)} loading="lazy" />;
  }
  return <Image {...props} />;
};

export default LazyImage;
