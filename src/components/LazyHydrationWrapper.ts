import { computed, defineComponent, markRaw, toRef, type VNode } from 'vue';

import {
  useLazyHydration,
  useHydrateWhenIdle,
  useHydrateWhenVisible,
  useHydrateOnInteraction,
  useHydrateWhenTriggered,
} from '../composables';

const normalizeSlot = (slotContent: VNode[]) =>
  slotContent.length === 1 ? slotContent[0] : slotContent;

const LazyHydrationWrapper = defineComponent({
  name: 'LazyHydrationWrapper',
  inheritAttrs: false,
  suspensible: false,
  props: {
    whenIdle: {
      default: false,
      type: [Boolean, Number],
    },
    whenVisible: {
      default: false,
      type: [Boolean, Object],
    },
    onInteraction: {
      default: false,
      type: [Array, Boolean, String],
    },
    whenTriggered: {
      default: undefined,
      type: [Boolean, Object],
    },
  },
  emits: ['hydrated'],

  setup(props, { slots, emit }) {
    const result = useLazyHydration();

    if (!result.willPerformHydration) {
      return () => normalizeSlot(slots.default!({}));
    }

    result.onHydrated(() => emit('hydrated'));

    if (props.whenIdle) {
      useHydrateWhenIdle(
        result,
        props.whenIdle !== true ? props.whenIdle : undefined
      );
    }

    if (props.whenVisible) {
      useHydrateWhenVisible(
        result,
        props.whenVisible !== true ? props.whenVisible : undefined
      );
    }

    if (props.onInteraction) {
      let events;

      if (props.onInteraction !== true) {
        events = computed(() =>
          Array.isArray(props.onInteraction)
            ? props.onInteraction
            : [props.onInteraction]
        ).value;
      }

      useHydrateOnInteraction(result, events);
    }

    if (props.whenTriggered !== undefined) {
      useHydrateWhenTriggered(result, toRef(props, 'whenTriggered'));
    }

    return () => normalizeSlot(slots.default!({}));
  },
});

/**
 * @public A renderless Vue.js component to lazy hydrate its children.
 */
export default markRaw(LazyHydrationWrapper) as typeof LazyHydrationWrapper;
