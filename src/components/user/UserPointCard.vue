<template>
  <div class="user-point-card">
    <div class="user-point-card__title">{{ title }} 냥</div>
    <div class="user-point-card__right">
      <div class="user-point-card__detail">
        {{ translatedDetail }} / 포인트 {{ title > 0 ? '적립' : '사용' }}
      </div>
      <div class="user-point-card__date">{{ date }}</div>
    </div>
  </div>
</template>

<script lang="ts" scoped>
import { defineComponent } from 'vue'
import { translatePointState } from '@/types/POINT.ts'

export default defineComponent({
  props: {
    title: {
      type: Number,
      default: -1
    },
    detail: {
      type: String,
      default: ''
    },
    date: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      translatedDetail: ''
    }
  },
  methods: {
    translateDetail() {
      this.translatedDetail = translatePointState(this.detail)
    }
  },
  mounted() {
    this.translateDetail()
  }
})
</script>

<style lang="scss" scoped>
.user-point-card {
  width: 80%;
  border-radius: 12px;
  background-color: #ffe2e2;
  display: flex;
  padding: 2rem 3rem;
  justify-content: space-between;
  margin: 1rem auto;
}

.user-point-card__title {
  flex: 1;
  font-size: 3rem;
}

.user-point-card__right {
  flex: 1;
  float: left;
  text-align: left;
}

.user-point-card__detail {
  font-size: 2rem;
}

.user-point-card__date {
  font-size: 1rem;
}
</style>
