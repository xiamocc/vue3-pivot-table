<template>
  <div>
    <!-- Top row -->
    <div
      v-if="showSettings"
      class="pivot-row nowrap gutter mb-3 "
    >
      <div class="left-col">
        <el-button
          size="small"
          type="primary"
          @click="toggleShowSettings"
        >{{ hideSettingsText }}</el-button>
      </div>

      <!-- Available fields -->
      <div
        class="pivot-row-fill drag-area"
        :class="dragAreaClass"
      >
        <div class="drag-area-title mb-3">{{ availableFieldsLabelText }}</div>
        <draggable
          v-model="internal.availableFieldKeys"
          class="pivot-row flex-row gutter-sm drag-area-zone"
          group="fields"
          handle=".btn-draggable"
          @start="start"
          @end="end"
        >
          <template #item="{element}">
            <div class="field">
              <field-label
                :field="fieldsWithValues[element.key]"
                v-model="fieldValues[element.key]"
                :select-all-text="selectAllText"
                :unselect-all-text="unselectAllText"
              >
                <template
                  v-for="(_, slot) of $slots"
                  v-slot:[slot]="scope"
                >
                  <slot
                    :name="slot"
                    v-bind="scope"
                  />
                </template>
              </field-label>
            </div>
          </template>
        </draggable>
      </div>
    </div>

    <div
      v-else
      class="mb-3"
    >
      <el-button
        size="small"
        type="primary"
        @click="toggleShowSettings"
      >{{ hideSettingsText }}</el-button>
    </div>

    <div
      class="pivot-row nowrap gutter mb-3"
      v-if="showSettings"
    >
      <!-- Top left zone - TODO: renderer select menu -->
      <div class="left-col"></div>

      <!-- Column fields -->
      <div
        class="pivot-row-fill drag-area primary"
        :class="dragAreaClass"
      >
        <div class="drag-area-title mb-3">{{ colsLabelText }}</div>
        <draggable
          v-model="internal.colFieldKeys"
          class="pivot-row flex-row gutter-sm drag-area-zone"
          group="fields"
          handle=".btn-draggable"
          item-key="key"
          @start="start"
          @end="end"
        >
          <template #item="{element}">
            <div class="field">
              <field-label
                :field="fieldsWithValues[element.key]"
                v-model="fieldValues[element.key]"
                :select-all-text="selectAllText"
                :unselect-all-text="unselectAllText"
              >
                <template
                  v-for="(_, slot) of $slots"
                  v-slot:[slot]="scope"
                >
                  <slot
                    :name="slot"
                    v-bind="scope"
                  />
                </template>
              </field-label>
            </div>
          </template>
        </draggable>
      </div>
    </div>

    <div class="pivot-row nowrap gutter">
      <!-- Row fields -->
      <div
        v-if="showSettings"
        class="left-col"
      >
        <div
          class="drag-area primary"
          :class="dragAreaClass"
        >
          <div class="drag-area-title mb-3">{{ rowsLabelText }}</div>
          <draggable
            v-model="internal.rowFieldKeys"
            class="pivot-row column align-items-start gutter-sm drag-area-zone"
            group="fields"
            handle=".btn-draggable"
            item-key="key"
            @start="start"
            @end="end"
          >
            <template #item="{element}">
              <div class="field">
                <field-label
                  :field="fieldsWithValues[element.key]"
                  v-model="fieldValues[element.key]"
                  :select-all-text="selectAllText"
                  :unselect-all-text="unselectAllText"
                >
                  <template
                    v-for="(_, slot) of $slots"
                    v-slot:[slot]="scope"
                  >
                    <slot
                      :name="slot"
                      v-bind="scope"
                    />
                  </template>
                </field-label>
              </div>
            </template>
          </draggable>
        </div>
      </div>

      <!-- Table -->
      <div
        class="pivot-row-fill"
        :style="tableWrapperStyle"
      >
        <pivot-table
          :data="data"
          :row-fields="rowFields"
          :col-fields="colFields"
          :reducer="reducer"
          :reducer-initial-value="reducerInitialValue"
          :no-data-warning-text="noDataWarningText"
          :is-data-loading="isDataLoading"
        >
          <!-- pass down scoped slots -->
          <template
            v-for="(_, slot) of $slots"
            v-slot:[slot]="scope"
          >
            <slot
              :name="slot"
              v-bind="scope"
            />
          </template>
        </pivot-table>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable vue/no-unused-components */
import FieldLabel from './FieldLabel.vue'
import PivotTable from './PivotTable.vue'
import Draggable from 'vuedraggable'
import naturalSort from 'javascript-natural-sort'

export default {
  name: 'vue-pivot',
  components: { FieldLabel, PivotTable, Draggable },
  props: {
    data: {
      type: Array,
      default: () => []
    },
    fields: {
      type: Array,
      default: () => []
    },
    availableFieldKeys: {
      type: Array,
      default: () => []
    },
    rowFieldKeys: {
      type: Array,
      default: () => []
    },
    colFieldKeys: {
      type: Array,
      default: () => []
    },
    reducer: {
      type: Function,
      default: sum => sum + 1
    },
    reducerInitialValue: {
      default: 0
    },
    defaultShowSettings: {
      type: Boolean,
      default: true
    },
    availableFieldsLabelText: {
      type: String,
      default: '待选维度'
    },
    colsLabelText: {
      type: String,
      default: '列维'
    },
    rowsLabelText: {
      type: String,
      default: '行维'
    },
    hideSettingsText: {
      type: String,
      default: '隐藏设置'
    },
    showSettingsText: {
      type: String,
      default: '显示设置'
    },
    noDataWarningText: {
      type: String,
      default: '暂无数据显示.'
    },
    selectAllText: {
      type: String,
      default: '全部选中'
    },
    unselectAllText: {
      type: String,
      default: '取消全选'
    },
    isDataLoading: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    const fieldValues = {}
    this.fields.filter(field => field.valueFilter).forEach(field => {
      fieldValues[field.key] = {}
    })
    const loopInit = (arr) => {
      let newArr = []
      for (let i = 0; i < arr.length; i++) {
        newArr.push({ key: arr[i] })
      }
      return newArr
    }
    const availableFieldKeys = loopInit(this.availableFieldKeys)
    const rowFieldKeys = loopInit(this.rowFieldKeys)
    const colFieldKeys = loopInit(this.colFieldKeys)
    return {
      internal: {
        availableFieldKeys: availableFieldKeys,
        rowFieldKeys: rowFieldKeys,
        colFieldKeys: colFieldKeys
      },
      fieldValues,
      dragging: false,
      showSettings: true
    }
  },
  computed: {
    // Fields with values extracted from data (if field has valueFilter)
    fieldsWithValues: function () {
      // Create object: field.key => field
      const fieldsWithValues = {}

      this.fields.forEach(field => {
        fieldsWithValues[field.key] = field
      })

      // Add valuesSet
      const valueFilterableFields = this.fields.filter(field => field.valueFilter)

      // Create valuesSet for each value filterable field
      valueFilterableFields.forEach(field => {
        fieldsWithValues[field.key].valuesSet = new Set()
      })

      // Iterate on data once
      this.data.forEach(item => {
        valueFilterableFields.forEach(field => {
          fieldsWithValues[field.key].valuesSet.add(field.getter(item))
        })
      })

      // Creates values sorted from valuesSet
      valueFilterableFields.forEach(field => {
        fieldsWithValues[field.key].values = Array.from(fieldsWithValues[field.key].valuesSet).sort(field.sort || naturalSort)
      })

      return fieldsWithValues
    },
    // Fields selected values as set
    valuesFiltered: function () {
      const valuesFiltered = {}

      for (let [key, valuesObject] of Object.entries(this.fieldValues)) {
        valuesFiltered[key] = new Set()
        valuesObject.forEach(valueObject => {
          if (valueObject.checked) {
            valuesFiltered[key].add(valueObject.value)
          }
        })
      }

      return valuesFiltered
    },
    // Pivot table props from Pivot props & data
    rowFields: function () {
      const rowFields = []
      this.internal.rowFieldKeys.forEach(item => {
        const field = this.fields.find(field => field.key === item.key)
        // Generate headerSlotNames from headers
        if (field.headers) {
          field.headerSlotNames = field.headers
            .filter(header => header.checked)
            .map(header => header.slotName)
        }

        // Add selected values
        if (field.valueFilter) {
          field.valuesFiltered = this.valuesFiltered[field.key]
        }

        rowFields.push(field)
      })

      return rowFields
    },
    colFields: function () {
      const colFields = []

      this.internal.colFieldKeys.forEach(item => {
        const field = this.fields.find(field => field.key === item.key)

        // Generate headerSlotNames from headers
        if (field.headers) {
          field.headerSlotNames = field.headers
            .filter(header => header.checked)
            .map(header => header.slotName)
        }

        // Add selected values
        if (field.valueFilter) {
          field.valuesFiltered = this.valuesFiltered[field.key]
        }

        colFields.push(field)
      })

      return colFields
    },
    // Drag area class
    dragAreaClass: function () {
      return this.dragging ? 'drag-area-highlight' : null
    },
    // Table wrapper style
    tableWrapperStyle: function () {
      const maxWidth = this.showSettings ? 'calc(100% - 200px - 2rem)' : '100%'
      return `max-width: ${ maxWidth };`
    }
  },
  methods: {
    // Toggle settings
    toggleShowSettings: function () {
      this.showSettings = !this.showSettings
    },
    // Update dragging boolean
    start: function () {
      this.dragging = true
    },
    end: function () {
      this.dragging = false
    },
    // Update fieldValues
    updateFieldValues: function () {
      for (let [key, field] of Object.entries(this.fieldsWithValues)) {
        if (field.valueFilter) {
          this.fieldValues[key] = []
          field.values.forEach(value => {
            this.fieldValues[key].push({ value, checked: true })
          })
        }
      }
    }
  },
  watch: {
    data: function () {
      this.updateFieldValues()
    }
  },
  created: function () {
    this.showSettings = this.defaultShowSettings
    this.updateFieldValues()
  }
}
</script>

<style lang="scss" scoped>
.pivot-row {
  display: flex;
  &.nowrap {
    flex-wrap: nowrap;
  }
  &.column {
    flex-direction: column;
  }
  &-fill {
    flex: 1 1 auto;
  }
}

.left-col {
  min-width: 200px;
  max-width: 200px;
}

.gutter,
.gutter-y {
  margin-top: -1rem;

  > * {
    margin-top: 1rem;
  }
}
.gutter-x,
.gutter {
  margin-left: -1rem;
  > * {
    margin-left: 1rem;
  }
}

.gutter-sm,
.gutter-y-sm {
  margin-top: -0.5rem;

  > * {
    margin-top: 0.5rem;
  }
}
.gutter-x-sm,
.gutter-sm {
  margin-left: -0.5rem;
  > * {
    margin-left: 0.5rem;
  }
}

.drag-area {
  border: 1px dashed #ccc;
  padding: 0.75rem;
  transition: background-color 0.4s;
  &.primary {
    border-color: var(--el-color-primary);
  }
  .drag-area-title {
    line-height: 1;
  }

  .drag-area-zone {
    min-width: 10rem;
    min-height: 46px;
  }
}

.drag-area-highlight {
  background-color: #f3f3f3;
}

.sortable-ghost {
  opacity: 0.4;
}

.field {
  position: relative;
}
</style>
