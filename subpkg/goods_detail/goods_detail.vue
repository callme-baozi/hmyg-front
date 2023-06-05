<template>
	<view v-if="goods_info.goods_name">
		<!-- 轮播图区域 -->
		<swiper :indicator-dots="true" :autoplay="true" :interval="3000" :duration="1000" :circular="true">
			<swiper-item v-for="(item, i) in goods_info.pics" :key="i">
				<image :src="item.pics_big" @click="preview(i)"></image>
			</swiper-item>
		</swiper>

		<!-- 商品信息区域 -->
		<view class="goods-info-box">
			<!-- 商品价格 -->
			<view class="price">￥{{goods_info.goods_price}}</view>
			<!-- 信息主体区域 -->
			<view class="goods-info-body">
				<!-- 商品名称 -->
				<view class="goods-name">{{goods_info.goods_name}}</view>
				<!-- 收藏 -->
				<view class="favi" :style="{ color: iconColor }">
					<uni-icons type="star" size="24" :color="iconColor" @click="starCode"></uni-icons>
					<text>收藏</text>
				</view>
			</view>
			<!-- 运费 -->
			<view class="yf">快递：免运费 -- {{cart.length}}</view>
		</view>

		<!-- 商品详情信息 -->
		<rich-text :nodes="goods_info.goods_introduce"></rich-text>

		<!-- 商品导航组件 -->
		<view class="goods_nav">
			<!-- fill 控制右侧按钮的样式 -->
			<!-- options 左侧按钮的配置项 -->
			<!-- buttonGroup 右侧按钮的配置项 -->
			<!-- click 左侧按钮的点击事件处理函数 -->
			<!-- buttonClick 右侧按钮的点击事件处理函数 -->
			<uni-goods-nav :fill="true" :options="options" :buttonGroup="buttonGroup" @click="onClick"
				@buttonClick="buttonClick" />
		</view>

		<uni-popup ref="popup" type="bottom" background-color="#fff">
			<view class="popup-content" :class="{ 'popup-height': type === 'left' || type === 'right' }"><text
					class="text">很遗憾，没有这个页面</text></view>
		</uni-popup>
	</view>
</template>

<script>
	// 从 vuex 中按需导出 mapState  mapMutations mapGetters 辅助方法
	import {
		mapState,
		mapMutations,
		mapGetters
	} from 'vuex'


	export default {
		computed: { // 计算属性
			// 调用 mapState 方法，把 m_cart 模块中的 cart 数组映射到当前页面中，作为计算属性来使用
			// ...mapState('模块的名称', ['要映射的数据名称1', '要映射的数据名称2'])
			...mapState('m_cart', ['cart']),
			...mapState('m_user', ['userinfo', 'token', 'user_id']),
			...mapGetters('m_cart', ['total'])
		},
		watch: {
			// handler 属性用来定义侦听器的 function 处理函数
			total: {
				handler(newVal) {
					// 2. 通过数组的 find() 方法，找到购物车按钮的配置对象
					const findResult = this.options.find((x) => x.text === '购物车')

					if (findResult) {
						// 3. 动态为购物车按钮的 info 属性赋值
						findResult.info = newVal
					}
				},
				// immediate 属性用来声明此侦听器，是否在页面初次加载完毕后立即调用
				immediate: true
			}
		},
		data() {
			return {
				// 商品详情对象
				goods_info: {},
				// 左侧按钮组的配置对象
				options: [{
					icon: 'shop',
					text: '店铺'
				}, {
					icon: 'cart',
					text: '购物车',
					info: 0
				}],
				// 右侧按钮组的配置对象
				buttonGroup: [{
						text: '加入购物车',
						backgroundColor: '#ff0000',
						color: '#fff'
					},
					{
						text: '立即购买',
						backgroundColor: '#ffa200',
						color: '#fff'
					}
				],
				iconColor: "gray",
				isStar: 0
			};
		},
		onLoad(options) {
			// 获取商品 Id
			const goods_id = options.goods_id
			// 调用请求商品详情数据的方法
			this.getGoodsDetail(goods_id)
		},
		methods: {
			// 把m_cart模块的updateCartInfo放到当前页面使用
			...mapMutations('m_cart', ['updateCartInfo']),
			// 定义请求商品详情数据的方法
			async getGoodsDetail(goods_id) {
				const {
					data: res
				} = await uni.$http.get('/api/home/getGoodsDetail', {
					goods_id
				})
				if (res.meta.status !== 200) return uni.$showMsg()
				// 使用字符串的 replace() 方法，为 img 标签添加行内的 style 样式，从而解决图片底部空白间隙的问题
				res.message.goods_introduce = res.message.goods_introduce.replace(/<img /g,
					'<img style="display:block;" ').replace(/webp/g, 'jpg')
				// 为 data 中的数据赋值
				this.goods_info = res.message
				// console.log(this.goods_info)
			},
			// 实现轮播图的预览效果
			preview(i) {
				// 调用 uni.previewImage() 方法预览图片
				uni.previewImage({
					// 预览时，默认显示图片的索引
					current: i,
					// 所有图片 url 地址的数组
					urls: this.goods_info.pics.map(x => x.pics_big)
				})
			},
			// 左侧按钮的点击事件处理函数
			onClick(e) {
				if (e.content.text === '购物车') {
					// 切换到购物车页面
					uni.switchTab({
						url: '/pages/cart/cart'
					})
				} else {
					this.$refs.popup.open('center')
					console.log("你点击了店铺，但是没有这个页面")
				}
			},
			starCode() {
				this.isStar = !this.isStar
				this.isStar == 0 ? this.iconColor = 'gray' : this.iconColor = 'orange'
			},
			// 把 m_cart 模块中的 addToCart 方法映射到当前页面使用
			...mapMutations('m_cart', ['addToCart', 'getCartList']), // 这个已经没用了
			async buttonClick(e) {
				let user_id = this.user_id
				// 1. 判断是否点击了 加入购物车 按钮
				if (e.content.text === '加入购物车') {
					if (!this.token) {
						return this.delayNavigate()
					}

					// 2. 组织一个商品的信息对象
					const goodsDto = {
						user_id: user_id, // 用户id
						goods_id: this.goods_info.goods_id, // 商品的Id
						goods_name: this.goods_info.goods_name, // 商品的名称
						goods_price: this.goods_info.goods_price, // 商品的价格
						goods_count: 1, // 商品的数量
						goods_small_logo: this.goods_info.goods_small_logo, // 商品的图片
						goods_state: true // 商品的勾选状态
					}
					// 发送post请求
					const {
						data: result
					} = await uni.$http.post('/api/cart/addProdToCart', goodsDto)

					if (result.meta.status !== 200) return uni.$showMsg('加入购物车失败！')

					// 3. 通过 this 调用映射过来的 addToCart 方法，把商品信息对象存储到购物车中
					// 这里不应该加入前端的cart，而是调用更新购物车信息的接口，刷新购物车列表
					this.addToCart(goodsDto)
					// this.getCartList({
					// 	user_id: user_id
					// })
				} else {
					this.$refs.popup.open('center')
					console.log("你点击了店铺，但是没有这个页面")
				}
			},
			...mapMutations('m_user', ['updateRedirectInfo']),
			// 展示倒计时的提示消息
			showTips(n) {
				// 调用 uni.showToast() 方法，展示提示消息
				uni.showToast({
					// 不展示任何图标
					icon: 'none',
					// 提示的消息
					title: '请先登录！' + n + ' 秒后自动跳转到登录页',
					// 为页面添加透明遮罩，防止点击穿透
					mask: true,
					// 1.5 秒后自动消失
					duration: 1500
				})
			},
			// 延迟导航到 my 页面
			async delayNavigate() {
				// 把 data 中的秒数重置成 3 秒
				this.seconds = 1
				// 1. 展示提示消息，此时 seconds 的值等于 3
				this.showTips(this.seconds)

				// 1. 将定时器的 Id 存储到 timer 中
				this.timer = setInterval(() => {
					this.seconds--

					// 2. 判断秒数是否 <= 0
					if (this.seconds <= 0) {
						// 2.1 清除定时器
						clearInterval(this.timer)

						// 2.2 跳转到 my 页面
						uni.switchTab({
							url: '/pages/my/my',
							// 页面跳转成功之后的回调函数
							success: () => {
								// 调用 vuex 的 updateRedirectInfo 方法，把跳转信息存储到 Store 中
								this.updateRedirectInfo({
									// 跳转的方式
									openType: 'navigateTo',
									// 从哪个页面跳转过去的
									from: '/subpkg/goods_detail/goods_detail?goods_id=' +
										this.goods_info.goods_id
								})

							}
						})
						// 2.3 终止后续代码的运行（当秒数为 0 时，不再展示 toast 提示消息）
						return
					}
					this.showTips(this.seconds)
				}, 1000)
			},
		}
	}
</script>

<style lang="scss">
	swiper {
		height: 750rpx;

		image {
			width: 100%;
			height: 100%;
		}
	}

	// 商品信息区域的样式
	.goods-info-box {
		padding: 10px;
		padding-right: 0;

		.price {
			color: #c00000;
			font-size: 18px;
			margin: 10px 0;
		}

		.goods-info-body {
			display: flex;
			justify-content: space-between;

			.goods-name {
				font-size: 18px;
				padding-right: 10px;
			}

			// 收藏区域
			.favi {
				width: 120px;
				font-size: 14px;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				border-left: 1px solid #bcbcbc;
				// color: red;
			}
		}

		// 运费
		.yf {
			margin: 10px 0;
			font-size: 12px;
			color: gray;
		}
	}

	.goods-detail-container {
		// 给页面外层的容器，添加 50px 的内padding，
		// 防止页面内容被底部的商品导航组件遮盖
		padding-bottom: 50px;
	}

	.goods_nav {
		// 为商品导航组件添加固定定位
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
	}

	.popup-content {
		align-items: center;
		justify-content: center;
		padding: 15px;
		height: 50px;
		background-color: #fff;
		font-size: 18px;
	}
</style>