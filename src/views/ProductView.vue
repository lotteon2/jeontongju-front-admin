<template>
  <div>
    <div class="productListHeader">
      <label>주모를 선택해주세요</label>
      <SearchableDropdown
        :sellers="sellers"
        :selectedSeller="selectedSeller"
        @select="setSelect"
      ></SearchableDropdown>
    </div>
    <CustomTable :headers="header" :items="items" @rowClick="handleClickRow"></CustomTable>
    <CustomPagination
      :on-change-page="onChangePage"
      :request-page="requestPage"
      :total-pages="totalPages"
    />
  </div>
  <div v-if="isLoading">
    <img src="../assets/loading.gif" alt="loading" />
  </div>
  <CustomModal
    v-if="popState"
    :modalTitle="this.modalTitle"
    btnText1="비공개로 바꾸기"
    btnText2="공개로 바꾸기"
    @btnClick1="() => handleChangeVisibility(false)"
    @btnClick2="() => handleChangeVisibility(true)"
    @closeBtnClick="this.changePopState"
  ></CustomModal>
</template>

<script lang="ts" scoped>
import SearchableDropdown from '@/components/common/CustomSearchableDropdown.vue'
import { useMyInfoStore } from '@/stores/myInfo'
import CustomTable from '@/components/common/CustomTable.vue'
import CustomPagination from '@/components/common/CustomPagination.vue'
import CustomModal from '@/components/common/CustomModal.vue'
import { useToast } from 'vue-toastification'
import { getProductListBySellerId } from '@/api/search/searchAPIService.ts'
import type { GetProductListBySellerIdResponseData } from '@/api/search/searchAPIService.types'
import { updateProductVisibility } from '@/api/product/productAPIService.ts'

export default {
  components: {
    CustomTable,
    CustomModal,
    CustomPagination,
    SearchableDropdown
  },
  computed: {
    filteredOptions() {
      const regex = new RegExp(this.searchTerm, 'i')
      return this.sellers.filter((seller) => regex.test(seller.label))
    }
  },
  methods: {
    async onChangePage(page: number) {
      if (0 <= page && page < this.totalPages) {
        this.requestPage = page
      }
    },
    pagingMethod(page: number) {
      this.page = page
    },
    getSellerName() {
      const idx = this.sellers.findIndex(
        (seller) => Number(seller.value) === Number(this.selectedSeller)
      )
      return this.sellers[idx].label
    },
    setSelect(value) {
      if (value === '' || typeof value !== 'number') return
      this.selectedSeller = value
    },
    changePopState() {
      this.popState = !this.popState
    },
    handleClickRow(items: GetProductListBySellerIdResponseData) {
      this.changePopState()
      this.modalTitle = items.productName
      this.isActivate = items.isActivate
      this.selectedProductId = items.productId
    },

    async handleChangeVisibility(isActivate: boolean) {
      const toast = useToast()
      try {
        const data = await updateProductVisibility(this.selectedProductId, { isActivate })
        if (data.code === 200) {
          const idx = this.items.findIndex((item) => item.productId === this.selectedProductId)
          this.items[idx].isActivate = isActivate
          this.changePopState()
        }
      } catch (err) {
        toast.error(`상품 공개 상태가 변경에 실패했어요.`, {
          timeout: 2000
        })
      }
    },
    async getProductListBySellerId(sellerId: number, page: number, size: number) {
      const toast = useToast()
      try {
        this.isLoading = true
        const data = await getProductListBySellerId(sellerId, page, size)
        if (data.code === 200) {
          const newItems = data.data.content
          newItems.forEach(
            (it: GetProductListBySellerIdResponseData, idx: number) =>
              (newItems[idx] = {
                ...newItems[idx],
                createdAt: it.createdAt.slice(0, 10),
                shortsId: it.shortsId ? it.shortsId : '-',
                productPrice: it.productPrice ? it.productPrice.toLocaleString() : it.productPrice,
                stockQuantity: it.stockQuantity
                  ? it.stockQuantity.toLocaleString()
                  : it.stockQuantity,
                isActivate: it.isActivate ? 'Y' : 'N'
              })
          )
          this.items = newItems
          this.totalPages = data.data.totalPages
        }
      } catch (error) {
        toast.error(`주문의 상품내역을 불러오는데 실패했어요.`, {
          timeout: 2000
        })
      } finally {
        this.isLoading = false
      }
    }
  },
  data() {
    return {
      searchTerm: '',
      requestPage: 0,
      page: 0,
      totalPages: 0,
      selectedSeller: -1,
      header: [
        { text: '주모 이름', value: 'storeName' },
        { text: '상품 이름', value: 'productName' },
        { text: '등록일', value: 'createdAt' },
        { text: '판매량', value: 'totalSalesCount' },
        { text: '총 가격', value: 'productPrice' },
        { text: '재고', value: 'stockQuantity' },
        { text: '리뷰 개수', value: 'reviewCount' },
        { text: '쇼츠', value: 'shortsId' },
        { text: '공개 여부', value: 'isActivate' }
      ],
      items: [],
      sellers: [],
      isLoading: true,
      modalTitle: '',
      isActivate: false,
      selectedProductId: '-1',
      popState: false
    } as {
      requestPage: number
      page: number
      totalPages: number
      selectedSeller: number
      header: { text: string; value: string }[]
      items: GetProductListBySellerIdResponseData[]
      sellers: { value: number; label: string }[]
      isLoading: boolean
      modalTitle: string
      isActivate: boolean
      selectedProductId: string
      popState: boolean
      searchTerm: string
    }
  },
  mounted() {
    const myInfo = useMyInfoStore()
    this.sellers = myInfo.getSellers()
    this.selectedSeller = this.sellers ? this.sellers[0].value : -1
    this.getProductListBySellerId(this.selectedSeller, 0, 10)
  },
  watch: {
    selectedSeller: function (value) {
      this.getProductListBySellerId(value, this.page, 10)
    },
    requestPage: function (value) {
      this.getProductListBySellerId(this.selectedSeller, value, 10)
    }
  }
}
</script>

<style lang="scss" scoped>
.productListHeader {
  display: flex;
  align-items: center;
  gap: 1rem;
}
select::-ms-expand {
  display: none;
}

.select {
  margin-left: 1rem;
  margin-bottom: 1rem;
  background-size: 20px;
  padding: 5px 30px 5px 10px;
  border-radius: 4px;
  outline: 0 none;
  background: url('@/assets/arrow.jpeg') no-repeat 95% 50%;
  -o-appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

.select option {
  background: black;
  color: #fff;
  padding: 3px 0;
}

select:hover {
  border-color: #888;
}

select:focus {
  border-color: #aaa;
  box-shadow: 0 0 1px 3px rgba(59, 153, 252, 0.7);
  box-shadow: 0 0 0 3px -moz-mac-focusring;
  color: #222;
  outline: none;
}

select:disabled {
  opacity: 0.5;
}

label {
  margin-bottom: 1rem;
}

option {
}
</style>
