<template>
  <div class="liveAdd">
    <div>
      <div class="label">라이브 경매 이름(3자 이상)</div>
      <input v-model="title" placeholder="라이브 경매 이름을 입력해주세요." />
    </div>
    <div>
      <div class="label">라이브 경매 설명(3자 이상)</div>
      <input v-model="description" placeholder="라이브 경매 설명을 입력해주세요." />
    </div>
    <div>
      <div class="label">라이브 경매 시작일(내일부터 선택 가능해요.)</div>
      <Datepicker
        v-model="startDate"
        :locale="locale"
        :weekStartsOn="0"
        :inputFormat="inputFormat"
        placeholder="경매 시작일"
        style="
          border-radius: 8px;
          width: 100%;
          border: 1px solid lightgray;
          padding: 0.5rem;
          box-sizing: border-box;
          margin-top: 0.3rem;
        "
      />
    </div>
    <CustomButton btnText="등록하기" :handleClick="addAuction" :disabled="isButtonDisabled" />
  </div>
</template>

<script lang="ts" scoped>
import { ref, reactive } from 'vue'
import CustomButton from '@/components/common/CustomButton.vue'
import { registerAuction } from '@/api/auction/auctionAPIService'
import Datepicker from 'vue3-datepicker'
import { ko } from 'date-fns/locale'
import { useToast } from 'vue-toastification'

export default {
  components: {
    CustomButton,
    Datepicker
  },
  setup() {
    const picked = ref(new Date())
    const locale = reactive(ko)
    const inputFormat = ref('yyyy-MM-dd')

    return {
      picked,
      locale,
      inputFormat
    }
  },
  data() {
    return {
      title: '',
      description: '',
      startDate: new Date()
    }
  },
  methods: {
    async addAuction() {
      const toast = useToast()
      try {
        const data = await registerAuction({
          title: this.title,
          description: this.description,
          startDate: this.startDate.toLocaleDateString().replace(/ /g, '')
        })
        if (data.code === 200) {
          toast.success('라이브 경매 등록에 성공했어요.', {
            timeout: 2000
          })
          this.$router.replace('/live')
        }
      } catch (error) {
        toast.error('라이브 경매 등록에 실패했어요.', {
          timeout: 2000
        })
      }
    }
  },
  computed: {
    isButtonDisabled() {
      return this.title.length < 3 || this.description.length < 3 || this.startDate < new Date()
    }
  }
}
</script>

<style lang="scss" scoped>
.liveAdd {
  width: 70vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  margin: 3rem;
}

input {
  border-radius: 8px;
  border: 1px solid lightgray;
  padding: 0.5rem;
  width: 100%;
  box-sizing: border-box;
  margin-top: 0.3rem;
}
</style>
