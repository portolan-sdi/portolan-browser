import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StylePicker from '../../src/components/maps/StylePicker.vue'

const styles = [
  { name: 'style-a', title: 'A' },
  { name: 'style-b', title: 'B' },
]

const factory = (props = {}) => mount(StylePicker, {
  props: { styles, activeIndex: 0, legend: [], ...props },
  global: { mocks: { $t: key => key } },
})

describe('StylePicker', () => {
  it('emits the user\'s choice', async () => {
    const wrapper = factory()
    await wrapper.findAll('option')[1].setSelected()
    expect(wrapper.emitted('change')).toEqual([[1]])
  })

  // The parent applies the style and pushes the new index back down. Comparing
  // against the previous value instead of the prop echoed that straight back
  // as a `change`, so every style was applied twice — a full clear and rebuild
  // of the map's layers each time.
  it('does not echo the parent\'s own update back as a change', async () => {
    const wrapper = factory()
    await wrapper.setProps({ activeIndex: 1 })
    expect(wrapper.emitted('change')).toBeUndefined()
    expect(wrapper.find('select').element.value).toBe('1')
  })

  it('hides the dropdown for a single style but keeps its legend', () => {
    const wrapper = factory({
      styles: [styles[0]],
      legend: [{ color: '#0f0', label: 'park' }],
    })
    expect(wrapper.find('select').exists()).toBe(false)
    expect(wrapper.findAll('.legend-items li')).toHaveLength(1)
  })
})
