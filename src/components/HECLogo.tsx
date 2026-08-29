import { Image } from 'expo-image';

const ASPECT = 180.9525 / 200; // official HEC emblem viewBox ratio

type Props = {
  /** Width of the emblem in points. Height follows the official aspect ratio. */
  size?: number;
};

/** Official Higher Education Commission (Pakistan) emblem. */
export default function HECLogo({ size = 44 }: Props) {
  return (
    <Image
      source={require('../../assets/hec-logo.svg')}
      style={[{ width: size, height: size / ASPECT }]}
      contentFit="contain"
      accessibilityLabel="Higher Education Commission Pakistan"
    />
  );
}
