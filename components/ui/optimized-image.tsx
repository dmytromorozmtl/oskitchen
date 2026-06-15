import Image, { type ImageProps } from "next/image";

const BLUR_DATA_URL =
  "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoEAAQAAwAHYAEAAUAABQAA";

type OptimizedImageProps = Omit<ImageProps, "placeholder" | "blurDataURL"> & {
  priority?: boolean;
};

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  ...rest
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      sizes={sizes}
      {...rest}
    />
  );
}
