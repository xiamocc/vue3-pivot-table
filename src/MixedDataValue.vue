<template>
  <div>
    <div v-if="hasCount">{{ number(value.count || 0)  }}</div>
    <div v-if="hasGdp">{{ amount(value.gdp || 0)  }}</div>
  </div>
</template>

<script>
export default {
  name: 'MixedDataValue',
  props: {
    value: {},
    labels: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    typeLabel: function () {
      return this.labels.find(label => label.field.key === 'type')
    },
    hasCount: function () {
      return !this.typeLabel || this.typeLabel.value === 'count'
    },
    hasGdp: function () {
      return !this.typeLabel || this.typeLabel.value === 'gdp'
    }
  },
  methods: {
    number: function (value) {
      return value.toLocaleString()
    },
    amount: function (value) {
      return value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2
      })
    }
  }
}
</script>
