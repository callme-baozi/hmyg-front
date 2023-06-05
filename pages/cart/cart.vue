<template>
	<view>
		<view class="cart-container" v-if="cart.length !== 0">
			<my-address class="address-view"></my-address>
			<!-- 购物车商品列表的标题区域 -->
			<view class="cart-title">
				<!-- 左侧的图标 -->
				<uni-icons type="shop" size="18"></uni-icons>
				<!-- 描述文本 -->
				<text class="cart-title-text">购物车</text>
			</view>

			<!-- 商品列表区域 -->
			<!-- uni-swipe-action 是最外层包裹性质的容器 -->
			<uni-swipe-action>
				<block v-for="(goods, i) in cart" :key="i">
					<!-- uni-swipe-action-item 可以为其子节点提供滑动操作的效果。需要通过 options 属性来指定操作按钮的配置信息 -->
					<uni-swipe-action-item :right-options="options" @click="swipeActionClickHandler(goods)">
						<my-goods :goods="goods" :show-radio="true" :show-num="true" @radio-change="radioChangeHandler"
							@num-change="numberChangeHandler"></my-goods>
					</uni-swipe-action-item>
				</block>
			</uni-swipe-action>

			<!-- 结算区域 -->
			<my-settle class='cart-container'></my-settle>
		</view>

		<!-- 空白购物车区域 -->
		<view class="empty-cart" v-else>
			<image src="/static/cart_empty.png" class="empty-img"></image>
			<text class="tip-text">空空如也~\n上拉刷新</text>
		</view>

	</view>
</template>

<script>
	// 导入自己封装的 mixin 模块
	import badgeMix from '@/mixins/tabbar-badge.js'
	// 按需导入 mapState 这个辅助函数
	import {
		mapState,
		mapMutations
	} from 'vuex'
	import user from '../../store/user';

	export default {
		// 将 badgeMix 混入到当前的页面中进行使用
		mixins: [badgeMix],
		computed: {
			// 将 m_cart 模块中的 cart 数组映射到当前页面中使用
			...mapState('m_cart', ['cart']),
			// 将 m_user 模块中的 userInfo 用户信息映射到当前页面中使用
			...mapState('m_user', ['userinfo', 'token', 'user_id']),
		},
		data() {
			return {
				options: [{
					text: '删除', // 显示的文本内容
					style: {
						backgroundColor: '#C00000' // 按钮的背景颜色
					}
				}]
			};
		},
		onLoad() {
			if (!this.token) {
				return this.delayNavigate()
			}
			// console.log(this.userinfo)
			this.getCartList({
				user_id: this.user_id
			})
			this.getAddress()

		},
		onPullDownRefresh() {
			this.getCartList({
				user_id: this.user_id
			})
			this.getAddress()
			// 1秒后恢复下拉前状态
			setTimeout(function() {
				uni.stopPullDownRefresh();
			}, 1000);
		},
		methods: {
			...mapMutations('m_user', ['getAddress', 'updateRedirectInfo']),
			...mapMutations('m_cart', ['getCartList']),
			...mapMutations('m_cart', ['updateGoodsState', 'updateGoodsCount', 'removeGoodsById', 'updateCartInfo']),
			// 商品的勾选状态发生了变化
			async radioChangeHandler(e) {
				// 这里不调用m_cart模块的updateGoodsState方法了，改为发请求到后端，然后更新购物车信息
				// this.updateGoodsState(e)
				let user_id = this.user_id
				const {
					data: res
				} = await uni.$http.post('/api/cart/updateGoodsState', {
					user_id,
					e
				})
				if (res.meta.status !== 200) {
					return uni.$showMsg('更新商品勾选状态失败')
				}
				this.getCartList({
					user_id: this.user_id
				})

			},
			// 商品的数量发生了变化
			async numberChangeHandler(e) {
				// 这里不调用m_cart模块的updateGoodsCount方法了，改为发请求到后端，然后更新购物车信息
				// this.updateGoodsCount(e)
				let user_id = this.user_id
				// let goods_count = e.goods_count
				const {
					data: res
				} = await uni.$http.post('/api/cart/updateGoodsCount', {
					user_id,
					e
				})
				if (res.meta.status !== 200) {
					return uni.$showMsg('更新商品数量失败')
				}
				// 重新获取购物车信息
				this.getCartList({
					user_id: this.user_id
				})

			},
			// 点击了滑动操作按钮
			async swipeActionClickHandler(goods) {
				// 这里不再使用removeGoodsById在前端数据删除，改为发请求到后端
				// this.removeGoodsById(goods.goods_id)
				let user_id = this.user_id
				let goods_id = goods.goods_id
				const {
					data: res
				} = await uni.$http.get('/api/cart/deleteCartPro', {
					user_id,
					goods_id
				})
				if (res.meta.status !== 200) {
					return uni.$showMsg('删除购物车商品失败！')
				}
				this.getCartList({
					user_id: user_id
				})
			},
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
									openType: 'switchTab',
									// 从哪个页面跳转过去的
									from: '/pages/cart/cart'
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
	.cart-title {
		height: 40px;
		display: flex;
		align-items: center;
		font-size: 14px;
		padding-left: 5px;
		border-bottom: 1px solid #efefef;

		.cart-title-text {
			margin-left: 10px;
		}
	}

	.address-view {
		display: flex;
		align-items: center;
		justify-content: center;
		border-bottom: 1px solid #bebebe;
	}

	.cart-container {
		padding-bottom: 50px;
	}

	.empty-cart {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 150px;

		.empty-img {
			width: 90px;
			height: 90px;
		}

		.tip-text {
			font-size: 12px;
			color: gray;
			margin-top: 15px;
		}
	}
</style>