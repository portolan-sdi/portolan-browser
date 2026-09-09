import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LayerControl from '../../src/components/maps/LayerControl.vue'

// The control renders its list inside a popover that loads asynchronously and
// teleports. Stub it down to its slot so the test can read the markup, and
// drive `update()` the way the popover's @show does.
const factory = async (overlays) => {
  const stacLayer = {
    getFootprintLayerIds: () => [],
    getChildrenLayerIds: () => [],
    getAssetOverlays: () => overlays,
    setCogVisible: () => {},
  }
  const wrapper = mount(LayerControl, {
    props: { basemaps: [], activeBasemapIndex: 0, stacLayer },
    global: {
      mocks: { $t: key => key },
      stubs: {
        BPopover: { template: '<div><slot /></div>' },
        BFormCheckbox: { template: '<label><slot /></label>' },
        BIconLayersFill: true,
      },
    },
  })
  await wrapper.setProps({ map: {} })  // the watcher assigns the popover target
  wrapper.vm.update()
  await wrapper.vm.$nextTick()
  return wrapper
}

const cogOverlay = (legend) => ({
  id: 'mask', title: '3-class mask', type: 'deckgl', visible: true, legend,
})

describe('LayerControl legend', () => {
  it('lists one swatch row per class under the layer', async () => {
    const wrapper = await factory([cogOverlay([
      { color: 'rgb(0, 158, 115)', label: 'field' },
      { color: 'rgb(213, 94, 0)', label: 'boundary' },
    ])])
    const rows = wrapper.findAll('.layer-legend li')
    expect(rows).toHaveLength(2)
    expect(rows.map(r => r.text())).toEqual(['field', 'boundary'])
    expect(rows[0].find('.legend-swatch').attributes('style'))
      .toContain('background-color: rgb(0, 158, 115)')
  })

  it('renders no list at all for a layer with no legend', async () => {
    const wrapper = await factory([cogOverlay([])])
    expect(wrapper.find('.layer-legend').exists()).toBe(false)
  })

  it('renders no list for an overlay that carries no legend field', async () => {
    const wrapper = await factory([
      { id: 'vec', title: 'Vector', type: 'maplibre', visible: true, layerIds: ['a'] },
    ])
    expect(wrapper.find('.layer-legend').exists()).toBe(false)
  })

  it('renders a class name as text, never as markup', async () => {
    const wrapper = await factory([cogOverlay([
      { color: 'rgb(1, 2, 3)', label: '<img src=x onerror=alert(1)>' },
    ])])
    const row = wrapper.find('.layer-legend li')
    expect(row.find('img').exists()).toBe(false)
    expect(row.text()).toContain('<img src=x onerror=alert(1)>')
  })
})
