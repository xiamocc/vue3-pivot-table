<template>
  <!-- <div> -->
  <!-- Label -->

  <el-dropdown
    size="small"
    split-button
    type="primary"
    trigger="click"
    v-if="hasDropdown"
    class="btn-draggable"
    :hide-on-click="false"
  >

    <btn-icon></btn-icon>
    {{ field.label }}
    <template #dropdown>
      <el-dropdown-menu>
        <template v-if="field.headerAttributeFilter">
          <h6 class="dropdown-header">Attributes</h6>

          <el-dropdown-item
            v-for="(header, index) in field.headers"
            :key="index"
          >
            <el-checkbox
              style="width: 100%;height: 24px;"
              v-model="header.checked"
            >
              {{ header.label }}
            </el-checkbox>
          </el-dropdown-item>
        </template>
        <h6
          class="dropdown-header"
          :class="{'el-dropdown-menu__item--divided':field.headerAttributeFilter}"
        >Values</h6>
        <el-button
          type="text"
          class="toggle-check-btn"
          @click="toggleAllValues(!allValuesSelected)"
        >{{allValuesSelected ? unselectAllText : selectAllText}}</el-button>
        <el-dropdown-item
          v-for="(item, index) in modelValue"
          :key="index"
        >
          <el-checkbox
            style="width: 100%;height: 24px;"
            v-model="item.checked"
          >
            <slot
              v-if="field.valueFilterSlotName"
              :name="field.valueFilterSlotName"
              :value="item.value"
            >
              Missing slot <code>{{ field.valueFilterSlotName }}</code>
            </slot>
            <template v-else>
              {{ item.value }}
            </template>
          </el-checkbox>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
  <el-button
    v-else
    size="small"
    type="primary"
    class="btn-draggable"
  >
    <btn-icon></btn-icon>{{ field.label }}
  </el-button>

</template>

<script>
import BtnIcon from './BtnIcon'
import { ref, toRefs, computed } from 'vue'
export default {
  model: {
    prop: 'modelValue',
  },
  components: {
    BtnIcon
  },
  props: {
    modelValue: {
      type: Array
    },
    field: {
      type: Object
    },
    variant: {
      type: String,
      default: 'primary'
    },
    selectAllText: {
      type: String
    },
    unselectAllText: {
      type: String
    }
  },
  setup (props) {
    const { modelValue, field } = toRefs(props)
    const showDropdown = ref(false)
    const toggleShowDropdown = () => {
      showDropdown.value = !showDropdown.value
    }
    const toggleAllValues = (target) => {
      modelValue.value.forEach(valueObject => {
        valueObject.checked = target
      })
    }
    const hasDropdown = computed(() => {
      return field.value.headerAttributeFilter
        && field.value.headers
        || field.value.valueFilter
    })
    const allValuesSelected = computed(() => {
      let allValuesSelected = true
      for (let valueObject of modelValue.value) {
        if (!valueObject.checked) {
          allValuesSelected = false
          break
        }
      }
      return allValuesSelected
    })
    return {
      hasDropdown,
      showDropdown,
      toggleAllValues,
      allValuesSelected,
      toggleShowDropdown,
    }
  }
}
</script>

<style lang="scss" scoped>
.toggle-check-btn {
  width: 100%;
  min-height: 24px;
  padding: 0 0 6px 0;
}
/* Grid with gutter */
.gutter-x-sm,
.gutter-sm {
  margin-left: -0.5rem;
  > * {
    margin-left: 0.5rem;
  }
}

.btn-draggable {
  cursor: move !important;
  z-index: 999;
  // padding-left: 0.5625rem;
}
.dropdown-header {
  margin-top: 0;
  display: block;
  padding: 0.5rem 1.5rem 0.5rem 1rem;
  margin-bottom: 0;
  font-size: 0.875rem;
  color: #6c757d;
  white-space: nowrap;
}
</style>
