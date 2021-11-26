// @ts-ignore
import Pivot from './components/Pivot.vue'
// @ts-ignore
import PivotTable from './components/PivotTable.vue'

export function install (Vue) {
  Vue.component("Pivot", Pivot)
  Vue.component("PivotTable", PivotTable)
}
