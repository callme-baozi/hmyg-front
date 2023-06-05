<template>
	<view>
		<view class="goods-list">
			<view v-for="(goods, i) in goodsList" :key="i" @click="gotoDetail(goods)">
				<my-goods :goods="goods"></my-goods>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 请求参数对象
				queryObj: {
					// 查询关键词
					query: '',
					// 商品分类Id
					cid: '',
					// 页码值
					pagenum: 1,
					// 每页显示多少条数据
					pagesize: 10
				},
				// 商品列表的数据
				goodsList: [],
				// 总数量，用来实现分页
				total: 0,
				// // 默认的空图片
				// defaultPic: 'https://cdn.jsdelivr.net/gh/PayYingJAY/Petchar-image/help.svg'
				// 是否正在请求数据
				isloading: false
			}
		},
		onLoad(options) {
			// console.log(options)
			// 将页面参数转存到 this.queryObj 对象中
			this.queryObj.query = options.query || ''
			this.queryObj.cid = options.cid || ''
			// 调用获取商品列表数据的方法
			this.getGoodsList()
		},
		methods: {
			// 获取商品列表数据的方法
			async getGoodsList(callback) {
				// 打开节流阀
				this.isloading = true
				// 发起请求
				const {
					data: res
				} = await uni.$http.get('/api/home/getGoodsList', this.queryObj)
				if (res.meta.status !== 200) return uni.$showMsg()
				// 关闭节流阀
				this.isloading = false

				// 只要下拉刷新请求完毕，如果callback存在就立即按需调用 cb 回调函数
				callback && callback()

				// 为数据赋值
				// console.log(res.message.goods[0].goods_id)
				this.total = res.message.total
				// 为数据赋值：通过展开运算符的形式，进行新旧数据的拼接
				this.goodsList = [...this.goodsList, ...res.message.goods]
				// console.log(this.total)
				// console.log(this.queryObj.goodsList[0].goods_small_logo)
			},
			// 点击跳转到商品详情页面
			gotoDetail(goods) {
				uni.navigateTo({
					url: '/subpkg/goods_detail/goods_detail?goods_id=' + goods.goods_id
				})
			}
		},
		// 触底的事件
		onReachBottom() {
			// 判断是否还有下一页数据
			if (this.queryObj.pagenum * this.queryObj.pagesize >= this.total) return uni.$showMsg('数据加载完毕！')
			// 判断是否正在请求其它数据，如果是，则不发起额外的请求
			if (this.isloading) return
			// 让页码值自增 +1
			this.queryObj.pagenum += 1
			// 重新获取列表数据
			this.getGoodsList()
		},
		// 下拉刷新的事件
		onPullDownRefresh() {
			// 1. 重置关键数据
			this.queryObj.pagenum = 1
			this.total = 0
			this.isloading = false
			this.goodsList = []

			// 2. 重新发起请求
			this.getGoodsList(() => uni.stopPullDownRefresh())
		}
	}
</script>

<style lang="scss">
	.goods-item {
		display: flex;
		padding: 10px 5px;
		border-bottom: 1px solid #dddddd;

		.goods-item-left {
			margin-right: 5px;

			.goods-pic {
				width: 100px;
				height: 100px;
				display: block;
				border-radius: 12px;
			}
		}

		.goods-item-right {
			display: flex;
			flex-direction: column;
			justify-content: space-between;

			.goods-name {
				font-size: 16px;
			}

			.goods-price {
				font-size: 16px;
				color: #c00000;
			}
		}
	}
</style>