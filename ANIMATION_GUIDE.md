# Animation Guide

## Animation Libraries

PDCollector uses three animation libraries:

1. **React Native Reanimated v3** - Core animation engine with 60fps native performance
2. **Moti** - Declarative animations with a simple API built on Reanimated
3. **React Native SVG** - For animated SVG graphics

## Setup

All libraries are already installed and configured:
- `react-native-reanimated@^3.19.4`
- `moti@^0.27.5`
- `react-native-svg@^15.15.0`

Babel plugin is configured in `babel.config.js`.

## Using Moti (Recommended for most cases)

### Basic Example

```tsx
import {MotiView} from 'moti';

function FadeIn() {
  return (
    <MotiView
      from={{opacity: 0}}
      animate={{opacity: 1}}
      transition={{type: 'timing', duration: 300}}
    >
      <Text>I fade in!</Text>
    </MotiView>
  );
}
```

### Using Animation Presets

```tsx
import {MotiView} from 'moti';
import {MotiPresets, MotiTransitions} from '../utils/animations';

function AnimatedCard() {
  return (
    <MotiView
      {...MotiPresets.slideInBottom}
      transition={MotiTransitions.spring}
    >
      <Card>Content</Card>
    </MotiView>
  );
}
```

### Available Presets

From `src/utils/animations.ts`:

- `MotiPresets.fadeIn` - Fade in
- `MotiPresets.fadeOut` - Fade out
- `MotiPresets.scaleUp` - Scale up from 0 to 1
- `MotiPresets.scaleDown` - Scale down from 1 to 0
- `MotiPresets.slideInRight` - Slide in from right
- `MotiPresets.slideInLeft` - Slide in from left
- `MotiPresets.slideInTop` - Slide in from top
- `MotiPresets.slideInBottom` - Slide in from bottom
- `MotiPresets.press` - Press feedback animation
- `MotiPresets.bounce` - Bounce animation
- `MotiPresets.shake` - Shake animation
- `MotiPresets.pulse` - Pulse animation
- `MotiPresets.rotate` - Rotation animation

### Transitions

- `MotiTransitions.spring` - Fast spring transition
- `MotiTransitions.smoothSpring` - Smooth spring transition
- `MotiTransitions.timing` - Normal timing (250ms)
- `MotiTransitions.fastTiming` - Fast timing (150ms)
- `MotiTransitions.slowTiming` - Slow timing (350ms)

### Staggered Animations

```tsx
import {MotiView} from 'moti';
import {createStaggerDelay} from '../utils/animations';

function ListItems({items}) {
  return (
    <>
      {items.map((item, index) => (
        <MotiView
          key={item.id}
          from={{opacity: 0, translateY: 20}}
          animate={{opacity: 1, translateY: 0}}
          transition={{
            type: 'timing',
            duration: 300,
            delay: createStaggerDelay(index, 50), // 50ms between each
          }}
        >
          <ListItem item={item} />
        </MotiView>
      ))}
    </>
  );
}
```

### Conditional Animations

```tsx
import {MotiView} from 'moti';

function Toggle({isActive}) {
  return (
    <MotiView
      animate={{
        backgroundColor: isActive ? '#4CAF50' : '#9E9E9E',
        scale: isActive ? 1.1 : 1,
      }}
      transition={{type: 'spring'}}
    >
      <Text>{isActive ? 'Active' : 'Inactive'}</Text>
    </MotiView>
  );
}
```

### Loop Animations

```tsx
import {MotiView} from 'moti';

function LoadingSpinner() {
  return (
    <MotiView
      from={{rotate: '0deg'}}
      animate={{rotate: '360deg'}}
      transition={{
        type: 'timing',
        duration: 1000,
        loop: true,
      }}
    >
      <Icon name="loading" />
    </MotiView>
  );
}
```

## Using Reanimated Directly

For complex animations, use Reanimated directly:

```tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

function ComplexAnimation() {
  const offset = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{translateX: offset.value}],
    };
  });

  const moveRight = () => {
    offset.value = withSpring(100);
  };

  return (
    <>
      <Animated.View style={[styles.box, animatedStyles]} />
      <Button title="Move" onPress={moveRight} />
    </>
  );
}
```

## Animated Touchables

Use the custom `Touchable` component (already created):

```tsx
import {Touchable} from '../components';

function InteractiveButton() {
  return (
    <Touchable onPress={() => console.log('Pressed!')}>
      <View style={styles.button}>
        <Text>Press Me</Text>
      </View>
    </Touchable>
  );
}
```

The Touchable component uses Moti to provide press feedback automatically.

## AnimatePresence (Enter/Exit Animations)

```tsx
import {AnimatePresence, MotiView} from 'moti';

function ConditionalRender({show}) {
  return (
    <AnimatePresence>
      {show && (
        <MotiView
          from={{opacity: 0, scale: 0}}
          animate={{opacity: 1, scale: 1}}
          exit={{opacity: 0, scale: 0}}
          transition={{type: 'timing', duration: 200}}
        >
          <Card>I animate in and out!</Card>
        </MotiView>
      )}
    </AnimatePresence>
  );
}
```

## Performance Tips

1. **Use Reanimated for complex animations** - Runs on UI thread
2. **Use Moti for simple animations** - Easier API, still performant
3. **Avoid animating layout properties** - Use transform instead
4. **Use `useNativeDriver` when possible** - Better performance
5. **Limit simultaneous animations** - Too many can cause jank
6. **Test on real devices** - Animations may perform differently

## Common Patterns

### Fade In on Mount

```tsx
function Component() {
  return (
    <MotiView from={{opacity: 0}} animate={{opacity: 1}}>
      <Content />
    </MotiView>
  );
}
```

### Slide In Modal

```tsx
function Modal({visible}) {
  return (
    <AnimatePresence>
      {visible && (
        <MotiView
          from={{translateY: 300}}
          animate={{translateY: 0}}
          exit={{translateY: 300}}
          transition={{type: 'spring'}}
        >
          <ModalContent />
        </MotiView>
      )}
    </AnimatePresence>
  );
}
```

### Skeleton Loading

```tsx
function Skeleton() {
  return (
    <MotiView
      from={{opacity: 0.3}}
      animate={{opacity: [0.3, 0.7, 0.3]}}
      transition={{
        loop: true,
        duration: 1500,
      }}
      style={{backgroundColor: '#E0E0E0', height: 20, borderRadius: 4}}
    />
  );
}
```

## Resources

- [Reanimated Docs](https://docs.swmansion.com/react-native-reanimated/)
- [Moti Docs](https://moti.fyi/)
- [Animation Best Practices](https://reactnative.dev/docs/performance#animations)
